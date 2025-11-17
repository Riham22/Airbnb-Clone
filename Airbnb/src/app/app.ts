import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./components/navbar/navbar";
import { Footer } from "./components/footer/footer";
import { Filtersbar } from "./components/filtersbar/filtersbar";
import { SearchBarComponent } from "./components/searchbar/searchbar";
import { HomeComponent } from "./components/home/home";
import { MainLayout } from "./Layouts/main-layout/main-layout";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, Filtersbar, SearchBarComponent, HomeComponent, MainLayout],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Airbnb');
}
