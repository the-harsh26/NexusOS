import { bus } from '../core/eventBus';

export function initializeKeyboard(audio: any) {
    const palette = document.getElementById('cmd-palette');
    const input = document.getElementById('cmd-input') as HTMLInputElement;

    window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName) && e.key !== 'k') return;

        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            const isOpen = palette!.style.display === 'block';
            palette!.style.display = isOpen ? 'none' : 'block';
            if (!isOpen) {
                input.value = '';
                input.focus();
            }
            return;
        }

        if (e.key === 'Escape') {
            palette!.style.display = 'none';
            bus.emit('focus_mode_exited');
        }

        if (palette!.style.display !== 'block') {
            switch(e.key.toLowerCase()) {
                case '1': bus.emit('track_change', 'SPOM-A'); break;
                case '2': bus.emit('track_change', 'SPOM-B'); break;
                case 'f': bus.emit('focus_mode_toggled'); break;
                case 'm': audio.toggle40HzModulation(); break;
                case ' ': 
                    e.preventDefault();
                    bus.emit('timer_toggled'); 
                    break;
            }
        }
    });
}
