import { Component } from '@angular/core';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-restablecer',
  templateUrl: './restablecer.page.html',
  styleUrls: ['./restablecer.page.scss'],
})
export class RestablecerPage {
  email: string = '';

  constructor(private alertController: AlertController) {}

  async resetPassword() {
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, this.email);
      this.presentAlert('Éxito', 'Se ha enviado un correo de restablecimiento de contraseña.');
    } catch (error) {
      let errorMessage: string;

      // Verificar si error es una instancia de Error
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as any).message; 
      } else {
        errorMessage = 'Ocurrió un error desconocido'; 
      }

      this.presentAlert('Error', 'Error al enviar el correo de restablecimiento de contraseña');
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
