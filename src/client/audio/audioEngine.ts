import { bus } from '../core/eventBus';

export class AudioEngine {
    private ctx: AudioContext | null = null;
    private oscillator: OscillatorNode | null = null;
    private gainNode: GainNode | null = null;
    private isPlaying = false;

    private initContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.gainNode = this.ctx.createGain();
            this.gainNode.connect(this.ctx.destination);
        }
    }

    public toggle40HzModulation() {
        this.initContext();
        if (this.isPlaying) {
            this.oscillator?.stop();
            this.oscillator?.disconnect();
            this.isPlaying = false;
            bus.emit('audio_40hz_stopped');
            return;
        }

        this.oscillator = this.ctx!.createOscillator();
        this.oscillator.type = 'sine';
        this.oscillator.frequency.value = 200; 

        const amOscillator = this.ctx!.createOscillator();
        amOscillator.type = 'sine';
        amOscillator.frequency.value = 40; 

        const amGain = this.ctx!.createGain();
        amGain.gain.value = 0.5;

        amOscillator.connect(amGain.gain);
        this.oscillator.connect(amGain);
        amGain.connect(this.gainNode!);

        this.oscillator.start();
        amOscillator.start();
        
        this.isPlaying = true;
        bus.emit('audio_40hz_active');
    }
}
