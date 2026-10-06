import { EventBus, bus } from './core/eventBus';
import { NexusDatabase } from './database/indexeddb';
import { TelemetryEngine } from './telemetry/telemetryEngine';
import { AudioEngine } from './audio/audioEngine';
import { initializeKeyboard } from './ui/keyboard';

class NexusOS {
    private db = new NexusDatabase();
    private telemetry = new TelemetryEngine();
    private audio = new AudioEngine();

    async boot() {
        bus.emit('system_boot_sequence_initiated');
        
        try {
            await this.db.initialize();
            bus.emit('database_ready');
            
            initializeKeyboard(this.audio);
            bus.emit('keyboard_interceptors_active');

            this.setupFocusMode();
            
            const healthEl = document.getElementById('system-health');
            if(healthEl) {
                healthEl.innerText = "ALL SYSTEMS NOMINAL";
                healthEl.style.color = "var(--signal)";
            }

            // Load Set A by default
            bus.emit('track_change', 'SPOM-A');

        } catch (e) {
            bus.emit('system_error', e);
        }
    }

    private setupFocusMode() {
        let focus = false;
        bus.on('focus_mode_toggled', () => {
            focus = !focus;
            const sidebar = document.getElementById('sidebar');
            const tools = document.getElementById('tools-panel');
            if (sidebar && tools) {
                sidebar.style.display = focus ? 'none' : 'block';
                tools.style.display = focus ? 'none' : 'block';
            }
            bus.emit(focus ? 'focus_mode_entered' : 'focus_mode_exited');
        });
    }
}

// Engage
const os = new NexusOS();
os.boot();
