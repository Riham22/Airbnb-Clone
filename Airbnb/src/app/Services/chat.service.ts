import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = 'http://localhost:5034/api/chatbot';
    private sessionId: string;

    constructor(private http: HttpClient) {
        // Generate session ID once
        this.sessionId = this.generateUUID();
    }

    sendMessage(message: string) {
        return this.http.post(`${this.apiUrl}/send`, {
            sessionId: this.sessionId,  // ← Include session ID
            message: message
        });
    }

    clearChat() {
        return this.http.post(`${this.apiUrl}/clear/${this.sessionId}`, {});
    }

    newConversation() {
        // Start fresh conversation
        this.sessionId = this.generateUUID();
    }

    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
