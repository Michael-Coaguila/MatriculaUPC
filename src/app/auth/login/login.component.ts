import { Component } from '@angular/core';
import { UserService } from '../../services/user.service'; // Importar el servicio de usuario
import { Router } from '@angular/router'; // Para redirigir después de login
import { FormsModule } from '@angular/forms'; // Para usar ngModel en el formulario
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  uid: string = ''; // Nombre de usuario
  pwd: string = ''; // Contraseña
  errorMessage: string | null = null; // Mensaje de error

  constructor(private userService: UserService, private router: Router) {}

  // Método que se ejecuta al hacer clic en "Iniciar Sesión"
  loginUser() {
    if (this.uid && this.pwd) {
      console.log('Datos enviados al login:', { uid: this.uid, pwd: this.pwd });
      
      this.userService.login(this.uid, this.pwd).subscribe(
        (response) => {
          console.log('Respuesta del servidor:', response);
          if (response.isSuccess) {
            // Login exitoso
            const estudiante = response.data;
            
            // Almacenar el ID y nombre del estudiante en localStorage
            localStorage.setItem('estudianteID', estudiante.estudianteID);
            localStorage.setItem('estudianteNombre', estudiante.nombre);
            localStorage.setItem('estudianteFoto', estudiante.foto)
            
            // Redirigir al dashboard
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = response.errorMessage || 'Error en la autenticación.';
          }
        },
        (error) => {
          console.error('Error en el login:', error);
          this.errorMessage = 'Ocurrió un error al intentar iniciar sesión. Por favor, inténtalo de nuevo.';
        }
      );
    } else {
      this.errorMessage = 'Por favor, complete ambos campos.';
    }
  }
  
}