import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell').then(m => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes').then(m => m.PRODUCT_ROUTES)
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('./features/sales/sale-history/sale-history').then(m => m.SaleHistoryComponent)
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/users/user-management/user-management').then(m => m.UserManagementComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'products' }
];
