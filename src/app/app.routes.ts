import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'my-spaces',
    loadComponent: () => import('./pages/my-spaces/my-spaces.page').then(m => m.MySpacesPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'register-space',
    loadComponent: () => import('./pages/register-space/register-space.page').then(m => m.RegisterSpacePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'reservations-calendar',
    loadComponent: () => import('./pages/reservations-calendar/reservations-calendar.page').then(m => m.ReservationsCalendarPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'payments',
    loadComponent: () => import('./pages/payments/payments.page').then(m => m.PaymentsPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications.page').then(m => m.NotificationsPage),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'login', 
    pathMatch: 'full',
  },
  {
    path: 'paymentsinfo',
    loadComponent: () => import('./paymentsinfo/paymentsinfo.page').then( m => m.PaymentsinfoPage)
  },
];
