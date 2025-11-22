import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './Services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App  {
  title = 'airbnb-clone';
  constructor(private authService: AuthService) {

    this.authService.checkAuthentication();
  }
}
