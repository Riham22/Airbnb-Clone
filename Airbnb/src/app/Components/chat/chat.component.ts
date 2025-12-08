import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../Services/chat.service';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent {
    messages: any[] = [];
    userInput: string = '';
    isOpen: boolean = false;
    isLoading: boolean = false;

    constructor(private chatService: ChatService) { }

    toggleChat() {
        this.isOpen = !this.isOpen;
    }

    sendMessage() {
        if (!this.userInput.trim()) return;

        // Add user message to UI
        this.messages.push({
            sender: 'user',
            text: this.userInput
        });

        const msgToSend = this.userInput;
        this.userInput = '';
        this.isLoading = true;

        // Send to API
        this.chatService.sendMessage(msgToSend).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                console.log('Chatbot API Response:', response); // Debug log

                // Handle potential case sensitivity or empty response
                const botResponse = response.response || response.Response || 'I did not receive a text response.';

                // Add bot response to UI
                this.messages.push({
                    sender: 'bot',
                    text: botResponse
                });
            },
            error: (error) => {
                this.isLoading = false;
                console.error('Chatbot Error:', error);

                let errorMessage = 'Sorry, I encountered an error. Please try again.';
                if (error.status === 0) {
                    errorMessage = 'Cannot connect to server. Check if backend is running.';
                } else if (error.error && error.error.error) {
                    errorMessage = `Error: ${error.error.error}`;
                } else if (error.message) {
                    errorMessage = `Error: ${error.message}`;
                }

                this.messages.push({
                    sender: 'bot',
                    text: errorMessage
                });
            }
        });
    }

    clearChat() {
        this.isLoading = true;
        this.chatService.clearChat().subscribe({
            next: () => {
                this.isLoading = false;
                this.messages = [];
            },
            error: (err) => {
                this.isLoading = false;
                console.error(err);
            }
        });
    }

    newChat() {
        this.chatService.newConversation();
        this.messages = [];
    }

    formatMessageWithLinks(text: string): string {
        // Simple basic link formatting could be added here
        // For now, returning text as is, or preventing XSS if needed (Angular sanitizes by default but innerHTML needs care)
        // If text contains http links, we could replace them.
        if (!text) return '';
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank">${url}</a>`);
    }
}
