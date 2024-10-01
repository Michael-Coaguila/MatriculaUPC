import { Component } from '@angular/core';
import { UserService } from '../../services/user.service'; // Importar el servicio de usuario
import { Router } from '@angular/router'; // Para redirigir después de login
import { FormsModule } from '@angular/forms'; // Para usar ngModel en el formulario
import { CommonModule } from '@angular/common';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  Correo: string = ''; // Nombre de usuario
  Contrasena: string = ''; // Contraseña
  errorMessage: string | null = null; // Mensaje de error

  constructor(private userService: UserService, private router: Router) {}

  // Método que se ejecuta al hacer clic en "Iniciar Sesión"
  loginUser() {
    if (this.Correo && this.Contrasena) {
      this.userService.login(this.Correo, this.Contrasena).subscribe(
        (response) => {
          console.log('Respuesta completa de la API:', response); // Verificar la estructura de la respuesta
  
          if (response.isSuccess) {
            const estudiante = response.data;
            console.log('Datos del estudiante:', estudiante); // Verificar los datos del estudiante
            console.log(estudiante.codigo);
  
            // Asegúrate de que el ID y los demás campos existen
            if (estudiante && estudiante.estudianteID !== undefined && estudiante.nombre && estudiante.codigo && estudiante.foto) {
              console.log('ID del estudiante recibido de la API:', estudiante.estudianteID);
  
              // Almacenar el ID y otros datos del estudiante en sessionStorage
              sessionStorage.setItem('estudianteID', estudiante.estudianteID.toString()); // Convertimos el ID a string
              /* sessionStorage.setItem('estudianteNombre', estudiante.nombre);
              sessionStorage.setItem('estudianteCodigo', estudiante.codigo);
              sessionStorage.setItem('estudianteFoto', estudiante.foto);
              sessionStorage.setItem('estudianteEstaMatriculado', estudiante.estaMatriculado); */
  
              console.log('ID del estudiante almacenado en sessionStorage:', sessionStorage.getItem('estudianteID'));
              /* console.log('Nombre del estudiante almacenado en sessionStorage:', sessionStorage.getItem('estudianteNombre'));
              console.log('Código del estudiante almacenado en sessionStorage:', sessionStorage.getItem('estudianteCodigo'));
              console.log('Foto del estudiante almacenada en sessionStorage:', sessionStorage.getItem('estudianteFoto'));
              console.log('¿Está matriculado el estudiante?', sessionStorage.getItem('estudianteEstaMatriculado')); */
  
              // Redirigir al dashboard
              this.router.navigate(['/dashboard']);
            } else {
              console.error('Algunos datos del estudiante están faltando o son undefined');
            }
          } else {
            this.errorMessage = response.errorMessage || 'Error en la autenticación.';
          }
        },
        (error) => {
          this.errorMessage = 'Ocurrió un error al intentar iniciar sesión. Por favor, inténtalo de nuevo.';
          console.error('Error en el login:', error);
        }
      );
    } else {
      this.errorMessage = 'Por favor, complete ambos campos.';
    }
  }
  
}  