import { bus } from '../core/eventBus';

export interface DRMConfig {
    keySystem: string;
    licenseServer: string;
}

export class DRMProvider {
    private videoElement: HTMLVideoElement;
    private mediaKeys: MediaKeys | null = null;

    constructor(videoElement: HTMLVideoElement) {
        this.videoElement = videoElement;
    }

    async initializeDRM(config: DRMConfig): Promise<void> {
        try {
            bus.emit("drm_initializing", { system: config.keySystem });
            
            const keySystemAccess = await navigator.requestMediaKeySystemAccess(config.keySystem, [{
                initDataTypes: ['cenc'],
                videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }]
            }]);

            this.mediaKeys = await keySystemAccess.createMediaKeys();
            await this.videoElement.setMediaKeys(this.mediaKeys);

            this.videoElement.addEventListener('encrypted', (e: MediaEncryptedEvent) => this.handleEncrypted(e, config.licenseServer));
            
            bus.emit("drm_ready", { system: config.keySystem });
        } catch (err) {
            bus.emit("drm_error", { message: "License acquisition failed or DRM not supported." });
            throw err;
        }
    }

    private async handleEncrypted(event: MediaEncryptedEvent, licenseServer: string) {
        if (!this.mediaKeys || !event.initData) return;
        
        const session = this.mediaKeys.createSession();
        
        session.addEventListener('message', async (e: MediaKeyMessageEvent) => {
            const response = await fetch(licenseServer, {
                method: 'POST',
                body: e.message
            });
            const license = await response.arrayBuffer();
            await session.update(license);
            bus.emit("drm_license_active");
        });

        await session.generateRequest(event.initDataType, event.initData);
    }
}
