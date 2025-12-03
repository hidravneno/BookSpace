import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    const expectedRole = route.data['role'];
    
    // Si la ruta requiere un rol específico y el usuario tiene otro rol
    if (expectedRole && currentUser.role !== expectedRole) {
      // Redirigir a la vista correcta según su rol
      if (currentUser.role === 'host') {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/tabs']);
      }
      return false;
    }

    return true;
  }
}
