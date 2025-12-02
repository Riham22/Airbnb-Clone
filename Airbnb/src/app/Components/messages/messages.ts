import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-messages',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container">
      <h1>Messages</h1>
      <p>You have no new messages.</p>
    </div>
  `,
    styles: [`
    .container { padding: 20px; max-width: 800px; margin: 0 auto; margin-top: 80px; }
    h1 { font-size: 24px; font-weight: 600; margin-bottom: 16px; }
  `]
})
export class MessagesComponent { }
