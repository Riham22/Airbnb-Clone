import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './Services/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './Components/chat/chat.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    FormsModule,           // ✅ Fixes [(ngModel)]
    ReactiveFormsModule,   // ✅ Fixes [formGroup]
    CommonModule,
    ChatComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'airbnb-clone';
  constructor(private authService: AuthService) {

    this.authService.checkAuthentication();
  }
}
