import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../Services/auth';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = (route.data['roles'] as Array<string>).map(r => r.toLowerCase());
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/auth']);
      return false;
    }

    const userRole = user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      user.role ||
      user.Role;

    // TEMPORARY WORKAROUND: If no role claim, check username for admin
    if (!userRole) {
      const username = user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || user.name || user.username;
      console.log('⚠️ RoleGuard: No role found, checking username:', username);

      // If username is "admin" and route expects admin role
      if (username && username.toLowerCase() === 'admin' && expectedRoles.includes('admin')) {
        console.log('✅ RoleGuard: Granting access based on username');
        return true;
      }

      console.log('❌ RoleGuard: Access denied - no role and username check failed');
      this.router.navigate(['/']);
      return false;
    }

    if (userRole && expectedRoles.includes(userRole.toLowerCase())) {
      return true;
    } else {
      // Redirect based on role if possible, otherwise home
      if (userRole && userRole.toLowerCase() === 'host') {
        this.router.navigate(['/host']);
      } else if (userRole && userRole.toLowerCase() === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
      return false;
    }
  }
}
