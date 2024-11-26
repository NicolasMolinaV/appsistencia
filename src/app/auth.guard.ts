//Abre tu terminal y ejecuta el siguiente comando: ionic generate guard auth


import { CanActivateFn } from '@angular/router'; // Importa la interfaz para el guard
import { inject } from '@angular/core'; // Importa la función para inyectar dependencias
import { Router } from '@angular/router'; // Importa Router para redirigir

// Define el guard como una función que implementa CanActivateFn
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router); // Inyecta el router para poder redirigir al usuario

  /*
La inyección de dependencias es un patrón de diseño que se utiliza en la programación para mejorar la modularidad y la testabilidad del código. En el contexto de Angular (y también en Ionic), se utiliza para gestionar la creación y el uso de instancias de servicios y otras dependencias dentro de tus componentes, directivas, pipes y otros elementos.

  constructor(private authService: AuthService) { // Inyección de AuthService
    // Ahora puedes usar this.authService para acceder a sus métodos
  }

  */




  const isAuthenticated = checkIfUserIsAuthenticated(); // Llama a la función para verificar autenticación

  if (!isAuthenticated) { // Si no está autenticado
    router.navigate(['/login']); // Redirige a la página de inicio de sesión
    return false; // Bloquea el acceso a la ruta protegida
  }
  
  return true; // Permite el acceso a la ruta si está autenticado
};

// Función que verifica si el usuario está autenticado
function checkIfUserIsAuthenticated(): boolean {
  const token = localStorage.getItem('token'); // Obtiene el token del localStorage
  console.log(token); // Muestra el contenido del token en la consola
  return !!token; // Devuelve true si hay un token, false si no
}
