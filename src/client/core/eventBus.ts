type EventCallback = (payload: any) => void;

export class EventBus {
    private listeners: Record<string, EventCallback[]> = {};

    emit(event: string, payload?: any): void {
        const time = new Date().toISOString().substring(11, 19);
        this.logTerminal(`[${time}] ${event.toUpperCase()} ${payload ? JSON.stringify(payload) : ''}`);
        
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(cb => cb(payload));
    }

    on(event: string, callback: EventCallback): void {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    private logTerminal(msg: string) {
        const term = document.getElementById('term-output');
        if (term) {
            const line = document.createElement('div');
            line.textContent = msg;
            line.style.color = 'var(--text-secondary)';
            term.appendChild(line);
            term.scrollTop = term.scrollHeight;
        }
    }
}
export const bus = new EventBus();
