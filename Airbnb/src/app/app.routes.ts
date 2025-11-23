import { Routes } from '@angular/router';
import { MainLayoutComponent } from './Layouts/main-layout/main-layout';
import { BecomeHostComponent } from './Components/become-host/become-host';
import { AuthComponent } from './Components/auth/auth';
import { PropertyDetailsComponent } from './Components/property-details/property-details';
import { AuthGuard } from './Gaurds/auth.gaurd';
import { RoleGuard } from './Gaurds/role.gaurd';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./Pages/home/home').then(m => m.HomeComponent)
      },
      {
        path: 'search',
        loadComponent: () => import('./Pages/search/search').then(m => m.SearchComponent)
      },
      {
        path: 'auth',
        component: AuthComponent
      },
      {
        path: 'become-host',
        component: BecomeHostComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'property/:id',
        component: PropertyDetailsComponent
      },
      {
        path: 'host',
        loadComponent: () => import('./Components/host-dashboard/host-dashboard').then(m => m.HostDashboardComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['host', 'admin'] }
      },
      {
        path: 'admin',
        loadComponent: () => import('./Components/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
];
