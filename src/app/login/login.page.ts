import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AnimationController, IonInput } from '@ionic/angular';
import { Animation } from '@ionic/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  @ViewChild('emailInput', { read: ElementRef }) emailInput?: ElementRef<HTMLIonInputElement>;
  @ViewChild('passwordInput', { read: ElementRef }) passwordInput?: ElementRef<HTMLIonInputElement>;

  private emailAnimation: Animation | null = null;
  private passwordAnimation: Animation | null = null;

  user = {
    email: "",
    password: ""
  };

  constructor(
    private router: Router,
    private toastController: ToastController,
    private animationCtrl: AnimationController,
    private authService: AuthService
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {
    if (this.emailInput) {
      this.emailAnimation = this.animationCtrl
        .create()
        .addElement(this.emailInput.nativeElement)
        .duration(2500)
        .iterations(1)
        .keyframes([
          { offset: 0, transform: 'scale(1.1)' },
          { offset: 0.5, transform: 'scale(1)' },
          { offset: 1, transform: 'scale(1)' },
        ]);
      this.emailAnimation.play();
    }

    if (this.passwordInput) {
      this.passwordAnimation = this.animationCtrl
        .create()
        .addElement(this.passwordInput.nativeElement)
        .duration(1500)
        .iterations(1)
        .keyframes([
          { offset: 0, transform: 'scale(1)' },
          { offset: 0.5, transform: 'scale(1.1)' },
          { offset: 1, transform: 'scale(1)' },
        ]);
      this.passwordAnimation.play();
    }
  }

  // En el método login del componente LoginPage
  async login() {
    if (this.user.email.trim() === '' || this.user.password.trim() === '') {
      await this.showToast('Por favor, completa todos los campos.');
      return;
    }

    try {
      const userData = await this.authService.login(this.user.email, this.user.password);

      if (userData.tipo_usuario === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/home']);
      }

    } catch (error: any) {
      this.showToast(error.message || 'Error al iniciar sesión');
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/inicio-sesion']);
      this.showToast('Sesión cerrada exitosamente');
    } catch (error: any) {
      this.showToast(error.message || 'Error al cerrar sesión');
    }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }
}
