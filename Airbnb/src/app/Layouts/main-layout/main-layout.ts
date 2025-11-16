import { Component } from '@angular/core';
import { Navbar } from "../../components/navbar/navbar";
import { RouterOutlet } from "@angular/router";
import { Footer } from "../../components/footer/footer";
import { SearchBarComponent } from "../../components/searchbar/searchbar";
import { Filtersbar } from "../../components/filtersbar/filtersbar";

@Component({
  selector: 'app-main-layout',
  imports: [Navbar, RouterOutlet, Footer, SearchBarComponent, Filtersbar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
onSearch(payload: any) {
console.log('Search payload', payload);
// TODO: call API with search criteria
}
onFilter(filter: string) {
console.log('Filter selected', filter);
// TODO: apply filter
}
}
