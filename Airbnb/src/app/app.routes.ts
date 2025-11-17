import { Routes } from '@angular/router';

import { Register } from './components/register/register';
import { HomeComponent } from './components/home/home';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'home', component: HomeComponent},
  {path: 'Signup', component: Register}

];
