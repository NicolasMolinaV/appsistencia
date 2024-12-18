import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  userData: any = null; 

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    try {
      this.userData = await this.authService.getUserProfile();
      console.log('Datos del usuario cargados:', this.userData);
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
    }
  }

  logout() {
    localStorage.removeItem('token'); 
    this.router.navigate(['/login']);
  }
}
