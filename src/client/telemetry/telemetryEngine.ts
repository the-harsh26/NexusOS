import { bus } from '../core/eventBus';

export class TelemetryEngine {
    private isPlaying = false;
    private isVisible = true;
    private sessionStart = 0;
    private activeSeconds = 0;
    private lastTick = 0;
    private trackId = "";

    constructor() {
        this.bindEvents();
        this.startTick();
    }

    private bindEvents() {
        document.addEventListener('visibilitychange', () => {
            this.isVisible = document.visibilityState === 'visible';
            bus.emit(this.isVisible ? 'tab_visible' : 'tab_hidden');
        });

        bus.on('media_play', () => { this.isPlaying = true; });
        bus.on('media_pause', () => { this.isPlaying = false; });
        bus.on('media_buffer', () => { this.isPlaying = false; });
        bus.on('track_change', (id) => { this.trackId = id; });
    }

    private startTick() {
        this.lastTick = performance.now();
        requestAnimationFrame(() => this.tick());
    }

    private tick() {
        const now = performance.now();
        const delta = (now - this.lastTick) / 1000;
        this.lastTick = now;

        if (this.isPlaying && this.isVisible) {
            this.activeSeconds += delta;
            
            if (Math.floor(this.activeSeconds) % 60 === 0 && delta > 0) {
                bus.emit('active_study_heartbeat', { 
                    track: this.trackId, 
                    activeSeconds: Math.floor(this.activeSeconds) 
                });
            }
        }
        requestAnimationFrame(() => this.tick());
    }
}
