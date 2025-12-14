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

    console.log('RoleGuard checking user:', user);
    console.log('Expected roles:', expectedRoles);

    // 1. Check for Roles array
    let userRoles: string[] = [];
    if (Array.isArray(user.Roles)) {
      userRoles = user.Roles.map((r: string) => r.toLowerCase());
    } else if (Array.isArray(user.roles)) {
      userRoles = user.roles.map((r: string) => r.toLowerCase());
    }

    // 2. Check for single role properties and add to array
    const singleRole = user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      user.role ||
      user.Role;

    if (singleRole) {
      userRoles.push(singleRole.toLowerCase());
    }

    console.log('User roles found:', userRoles);

    // 3. Username fallback
    const username = user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || user.name || user.username;
    if (username && username.toLowerCase() === 'admin') {
      userRoles.push('admin');
    }

    // Check if any user role matches expected roles
    const hasRole = userRoles.some(role => expectedRoles.includes(role));

    if (hasRole) {
      return true;
    } else {
      console.log('❌ RoleGuard: Access denied');
      this.router.navigate(['/']);
      return false;
    }
  }
}
