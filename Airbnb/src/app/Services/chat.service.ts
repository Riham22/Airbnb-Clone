// chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatRequest {
  sessionId: string;
  message: string;
}

export interface ChatResponse {
  response: string;
  success: boolean;
  sessionId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // Update this URL to match your backend port (e.g., 7020 or 5001)
  private apiUrl = 'https://localhost:7020/api/Chatbot';

  constructor(private http: HttpClient) {}

  sendMessage(message: string, sessionId: string): Observable<ChatResponse> {
    const payload: ChatRequest = {
      sessionId: sessionId,
      message: message
    };
    return this.http.post<ChatResponse>(`${this.apiUrl}/send`, payload);
  }

  refreshKnowledge(): Observable<any> {
    return this.http.post(`${this.apiUrl}/refresh-knowledge`, {});
  }
  
  clearHistory(sessionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/clear/${sessionId}`, {});
  }
}