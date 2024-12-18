import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, Platform, AlertController } from '@ionic/angular';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';
import { LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { Geolocation } from '@capacitor/geolocation';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-camara',
  templateUrl: './camara.page.html',
  styleUrls: ['./camara.page.scss'],
})
export class CamaraPage implements OnInit {
  scanResult = '';
  userLatitude: number = 0;
  userLongitude: number = 0;

  private targetLatitude = -33.598914087532926; 
  private targetLongitude = -70.70569490856572; 
  private allowedDistance = 500; 

  constructor(
    private loadingController: LoadingController,
    private platform: Platform,
    private modalController: ModalController,
    private alertController: AlertController,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.checkLocationPermission();
  }

  async checkLocationPermission() {
    const permission = await Geolocation.checkPermissions();
    if (permission.location !== 'granted') {
      const request = await Geolocation.requestPermissions();
      if (request.location !== 'granted') {
        console.error('Permiso de ubicación denegado.');
        return;
      }
    }

    await this.getCurrentLocation();
  }

  async getCurrentLocation() {
    const position = await Geolocation.getCurrentPosition();
    this.userLatitude = position.coords.latitude;
    this.userLongitude = position.coords.longitude;

    if (!this.isWithinAllowedRange()) {
      console.error('Estás fuera del rango permitido.');
      this.presentAlert(); 
    }
  }

  isWithinAllowedRange(): boolean {
    const distance = this.calculateDistance(
      this.userLatitude,
      this.userLongitude,
      this.targetLatitude,
      this.targetLongitude
    );
    return distance <= this.allowedDistance;
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const earthRadius = 6371e3; 

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c; 
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Ubicación no permitida',
      subHeader: 'Acceso restringido',
      message: 'No puedes acceder a la cámara desde esta ubicación.',
      buttons: ['OK'], 
    });

    await alert.present();
  }

  async startScan() {
    if (!this.isWithinAllowedRange()) {
      console.error('No puedes acceder a la cámara desde esta ubicación, Tienes que encontrarte en DuocUC');
      this.presentAlert(); 
      return;
    }

    const modal = await this.modalController.create({
      component: BarcodeScanningModalComponent,
      cssClass: 'barcode-scanning-modal',
      showBackdrop: false,
      componentProps: {
        formats: [],
        LensFacing: LensFacing.Back,
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      console.log('Información escaneada:', data);
      if (data?.barcode) {
        this.scanResult = data?.barcode?.displayValue;
        console.log('Valor del QR:', this.scanResult);
        await this.confirmAttendance();
      } else {
        console.error('No se pudo leer el código de barras correctamente');
      }
    } else {
      console.log('No se escaneó ningún código.');
    }
  }

  async confirmAttendance() {
    const alert = await this.alertController.create({
      header: 'Registrar Asistencia',
      message: `¿Deseas registrar tu asistencia`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: async () => {
            try {
              const currentUser = await this.authService.getCurrentUser();
              if (currentUser && currentUser.uid) {
                await this.authService.addStudentToList(this.scanResult, currentUser.uid);
                console.log('Asistencia registrada correctamente.');
              } else {
                console.error('No se pudo obtener el usuario actual.');
              }
            } catch (error) {
              console.error('Error al registrar la asistencia:', error);
            }
          },
        },
      ],
    });
  
    await alert.present();
  }

}
