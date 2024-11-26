import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
    
    const userData = await this.authService.getCurrentUser(); // Método para obtener datos del usuario

    // Verificar si el tipo de usuario es 'admin'
    if (userData && userData.tipo_usuario === 'admin') {
      return true; // Permitir acceso
    } else {
      this.router.navigate(['/login']); // Redirigir si no es admin
      return false; // Denegar acceso
    }
  }
}
