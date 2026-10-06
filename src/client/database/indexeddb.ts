export class NexusDatabase {
    private dbName = "SpomNexusDB";
    private version = 1;
    private db: IDBDatabase | null = null;

    async initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('sessions')) {
                    db.createObjectStore('sessions', { keyPath: 'sessionId' });
                }
                if (!db.objectStoreNames.contains('telemetry')) {
                    db.createObjectStore('telemetry', { autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('mistakes')) {
                    const mistakesStore = db.createObjectStore('mistakes', { keyPath: 'id', autoIncrement: true });
                    mistakesStore.createIndex('topicId', 'topicId', { unique: false });
                }
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    async saveSession(sessionData: any): Promise<void> {
        if (!this.db) return;
        const tx = this.db.transaction('sessions', 'readwrite');
        tx.objectStore('sessions').put(sessionData);
    }
}
