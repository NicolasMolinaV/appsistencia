import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AnimationController } from '@ionic/angular';
import { AuthService } from '../auth.service'; // Asegúrate de importar el AuthService

@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.page.html',
  styleUrls: ['./registrarse.page.scss'],
})
export class RegistrarsePage implements OnInit {

  @ViewChild('usuarioInput', { read: ElementRef }) usuarioInput?: ElementRef<HTMLIonInputElement>;
  @ViewChild('emailInput', { read: ElementRef }) emailInput?: ElementRef<HTMLIonInputElement>;
  @ViewChild('passwordInput', { read: ElementRef }) passwordInput?: ElementRef<HTMLIonInputElement>;
  @ViewChild('confirmPasswordInput', { read: ElementRef }) confirmPasswordInput?: ElementRef<HTMLIonInputElement>;

  isToastOpen = false;
  user = {
    usuario: "",
    email: "",
    password: "",
    confirmPassword: ""
  };

  constructor(
    private router: Router,
    private toastController: ToastController,
    private authService: AuthService // Inyecta el servicio de autenticación
  ) { }

  ngOnInit() {}

  async onClick() {
    if (this.user.usuario.trim() === '' || this.user.email.trim() === '' || 
        this.user.password.trim() === '' || this.user.confirmPassword.trim() === '') {
      await this.showToast('Por favor, completa todos los campos.');
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      await this.showToast('Las contraseñas no coinciden.');
      return;
    }

    try {
      // Llama al método de registro y pasa los datos completos
      await this.authService.register(this.user.email, this.user.password, this.user.usuario);
      console.log("Registro exitoso");
      this.router.navigate(["/home"]); // Redirigir a la página principal
    } catch (error: any) {
      await this.showToast('Error al registrarse: ' + error.message);
    }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}
