// chat.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for *ngFor, *ngIf
import { FormsModule } from '@angular/forms';   // Required for [(ngModel)]
import { ChatService, ChatResponse } from '../../Services/chat.service';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages: Message[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  sessionId: string = '';
  isOpen: boolean = false; // Toggle for chat window

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    // Generate or retrieve a session ID
    this.sessionId = localStorage.getItem('chatSessionId') || this.generateSessionId();
    localStorage.setItem('chatSessionId', this.sessionId);

    // Add initial greeting
    this.addBotMessage('Hello! How can I help you explore our properties and services today?');
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMsg = this.userInput;
    this.addUserMessage(userMsg);
    this.userInput = '';
    this.isLoading = true;

    this.chatService.sendMessage(userMsg, this.sessionId).subscribe({
      next: (res: ChatResponse) => {
        this.addBotMessage(res.response);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Chat error:', err);
        this.addBotMessage('Sorry, I am having trouble connecting to the server.');
        this.isLoading = false;
      }
    });
  }

  private addUserMessage(text: string) {
    this.messages.push({ text, sender: 'user', timestamp: new Date() });
  }

  private addBotMessage(text: string) {
    this.messages.push({ text, sender: 'bot', timestamp: new Date() });
  }

  newChat() {
    this.messages = [];
    this.sessionId = this.generateSessionId();
    localStorage.setItem('chatSessionId', this.sessionId);
    this.addBotMessage('Hello! How can I help you explore our properties and services today?');
  }

  formatMessageWithLinks(text: string): string {
    // Simple regex to convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" style="color: #ff385c; text-decoration: underline;">${url}</a>`;
    });
  }

  private generateSessionId(): string {
    return 'session-' + Math.random().toString(36).substr(2, 9);
  }
}