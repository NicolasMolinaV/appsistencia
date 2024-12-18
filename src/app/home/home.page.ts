import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  attendanceData: { className: string; percentage: number }[] = [];
  userId: string = '';

  classNames: { [key: number]: string } = {
    1: 'Lenguaje',
    2: 'Matemáticas',
    4: 'Ed. Física',
    3: 'Historia',
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    console.log('Botón presionado - Iniciando carga de datos'); 
  
    try {
      // Limpiar los datos previos
      this.attendanceData = [];
      
      // Obtener el usuario actual
      const user = await this.authService.getCurrentUser();
      if (user && user.uid) {
        this.userId = user.uid;
  
        // Obtener los porcentajes de asistencia
        const percentages = await this.authService.getAttendancePercentages(this.userId);
  
        // Mapear IDs a nombres y preparar los datos
        this.attendanceData = percentages.map(item => ({
          className: this.classNames[item.classId], 
          percentage: parseFloat(item.percentage.toFixed(1)), 
        }));
  
        console.log('Datos actualizados:', this.attendanceData); 
      }
    } catch (error) {
      console.error('Error al cargar los datos de asistencia:', error); 
    }
  }
  
  

  getImage(className: string): string {
    switch (className) {
      case 'Lenguaje':
        return 'lenguaje.png';
      case 'Matemáticas':
        return 'matematicas.png';
      case 'Historia':
        return 'historia.png';
      case 'Ed. Física':
        return 'edfisica.png';
      default:
        return 'default.png'; 
    }
  }
}
