// import { Routes } from '@angular/router';
// import { MainLayoutComponent } from './Layouts/main-layout/main-layout';
// import { BecomeHostComponent } from './Components/become-host/become-host';
// import { AuthComponent } from './Components/auth/auth';
// import { PropertyDetailsComponent } from './Components/property-details/property-details';
// import { AuthGuard } from './Gaurds/auth.gaurd';
// import { RoleGuard } from './Gaurds/role.gaurd';

// export const routes: Routes = [
//   {
//     path: '',
//     component: MainLayoutComponent,
//     children: [
//       {
//         path: '',
//         loadComponent: () => import('./Pages/home/home').then(m => m.HomeComponent)
//       },
//       {
//         path: 'search',
//         loadComponent: () => import('./Pages/search/search').then(m => m.SearchComponent)
//       },
//       {
//         path: 'auth',
//         component: AuthComponent
//       },
//       {
//         path: 'forget-password',
//         loadComponent: () => import('./Components/forget-password/forget-password.component').then(m => m.ForgetPasswordComponent)
//       },
//       {
//         path: 'become-host',
//         component: BecomeHostComponent,
//         canActivate: [AuthGuard]
//       },
//       {
//         path: 'property/:id',
//         component: PropertyDetailsComponent
//       },
//       {
//         path: 'host',
//         loadComponent: () => import('./Components/host-dashboard/host-dashboard').then(m => m.HostDashboardComponent),
//         canActivate: [AuthGuard, RoleGuard],
//         data: { roles: ['host', 'admin'] }
//       },
//       {
//         path: 'wishlists',
//         loadComponent: () => import('./Components/wish-list/wish-list').then(m => m.WishlistComponent),
//         canActivate: [AuthGuard]
//       },
//       {
//         path: 'trips',
//         loadComponent: () => import('./Components/booking/booking').then(m => m.Booking),
//         canActivate: [AuthGuard]
//       },
//       {
//         path: 'messages',
//         loadComponent: () => import('./Components/messages/messages').then(m => m.MessagesComponent),
//         canActivate: [AuthGuard]
//       },
//       {
//         path: 'notifications',
//         loadComponent: () => import('./Components/notifications/notifications').then(m => m.NotificationsComponent),
//         canActivate: [AuthGuard]
//       },
//       {
//         path: 'account',
//         loadComponent: () => import('./Components/user-profile/user-profile').then(m => m.UserProfile),
//         canActivate: [AuthGuard]
//       },
//       {
//         path: 'account-personal-info',
//         loadComponent: () => import('./Components/personal-info/personal-info').then(m => m.PersonalInfoComponent),
//         canActivate: [AuthGuard]
//       },
//       {
//         path: 'help',
//         loadComponent: () => import('./Components/help-center/help-center').then(m => m.HelpCenterComponent)
//       },
//       {
//         path: 'gift-cards',
//         loadComponent: () => import('./Components/gift-cards/gift-cards').then(m => m.GiftCardsComponent)
//       },
//       {
//         path: 'host-experience',
//         loadComponent: () => import('./Components/host-experience/host-experience').then(m => m.HostExperienceComponent)
//       },
//       {
//         path: 'admin',
//         loadComponent: () => import('./Components/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent),
//         canActivate: [AuthGuard, RoleGuard],
//         data: { roles: ['Admin'] }
//       },
//       {
//         path: '**',
//         redirectTo: ''
//       }
//     ]
//   }
// ];
// app.routes.ts
import { Routes } from '@angular/router';
import { Test } from './Components/test/test';
import { MainLayoutComponent } from './Layouts/main-layout/main-layout';
import { AuthGuard } from './Gaurds/auth.gaurd';
import { RoleGuard } from './Gaurds/role.gaurd';
import { PropertyDetailsComponent } from './Components/property-details/property-details';
import { BecomeHostComponent } from './Components/become-host/become-host';
import { AuthComponent } from './Components/auth/auth';

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
        path: 'forget-password',
        loadComponent: () => import('./Components/forget-password/forget-password.component').then(m => m.ForgetPasswordComponent)
      },
      {
        path: 'become-host',
        component: BecomeHostComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'property/:id',
        component: PropertyDetailsComponent,
        data: { type: 'property' }
      },
      {
        path: 'experience/:id',
        component: PropertyDetailsComponent,
        data: { type: 'experience' }
      },
      {
        path: 'service/:id',
        component: PropertyDetailsComponent,
        data: { type: 'service' }
      },
      {
        path: 'host',
        loadComponent: () => import('./Components/host-dashboard/host-dashboard').then(m => m.HostDashboardComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['host', 'admin'] }
      },
      {
        path: 'wishlists',
        loadComponent: () => import('./Components/wish-list/wish-list').then(m => m.WishlistComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'trips',
        loadComponent: () => import('./Components/booking/booking').then(m => m.Booking),
        canActivate: [AuthGuard]
      },
      {
        path: 'payment/:id',
        loadComponent: () => import('./Pages/payment/payment').then(m => m.PaymentComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'messages',
        loadComponent: () => import('./Components/messages/messages').then(m => m.MessagesComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'notifications',
        loadComponent: () => import('./Components/notifications/notifications').then(m => m.NotificationsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'account',
        loadComponent: () => import('./Components/user-profile/user-profile').then(m => m.UserProfile),
        canActivate: [AuthGuard]
      },
      {
        path: 'account-personal-info',
        loadComponent: () => import('./Components/personal-info/personal-info').then(m => m.PersonalInfoComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'account/payments',
        loadComponent: () => import('./Components/payments-payouts/payments-payouts').then(m => m.PaymentsPayoutsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'help',
        loadComponent: () => import('./Components/help-center/help-center').then(m => m.HelpCenterComponent)
      },
      {
        path: 'gift-cards',
        loadComponent: () => import('./Components/gift-cards/gift-cards').then(m => m.GiftCardsComponent)
      },
      {
        path: 'host-experience',
        loadComponent: () => import('./Components/host-experience/host-experience').then(m => m.HostExperienceComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./Components/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Admin'] }
      },
      {
        path: 'admin/add-user',
        loadComponent: () => import('./Components/admin-dashboard/add-user/add-user.component').then(m => m.AddUserComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Admin'] }
      },
      {
        path: 'admin/add-listing',
        loadComponent: () => import('./Components/admin-dashboard/add-listing/add-listing.component').then(m => m.AddListingComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Admin', 'Host'] }
      },
      {
        path: 'admin/add-service',
        loadComponent: () => import('./Components/admin-dashboard/add-service/add-service.component').then(m => m.AddServiceComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Admin', 'Host'] }
      },
      {
        path: 'admin/add-experience',
        loadComponent: () => import('./Components/admin-dashboard/add-experience/add-experience.component').then(m => m.AddExperienceComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Admin', 'Host'] }
      },
      {
        path: 'account-settings',
        loadComponent: () => import('./Components/personal-account/personal-account.component').then(m => m.PersonalAccountComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'payment',
        loadComponent: () => import('./Components/payment/payment').then(m => m.PaymentComponent),
        canActivate: [AuthGuard],

      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
];

