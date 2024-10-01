import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Para la redirección al logout
import { StudentService } from '../../services/student.service'; // Importar el servicio de estudiante

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  studentData: any = {}; // Almacenar la respuesta completa de la API
  student: any = {}; // Almacenar el estudiante seleccionado
  alumno: any = {
    nombre: '',
    id: '',
    codigo: '',
    foto: '',
    estaMatriculado: false
  }; // Almacenar los datos del alumno

  constructor(private readonly ss: StudentService, private router: Router) {}

  // Método para obtener todos los estudiantes
  _getStudents() {
    this.ss.getStudents().subscribe((response: any) => {
      this.studentData = response.data; // Asumimos que `data` es donde están los estudiantes
      console.log('Todos los estudiantes:', this.studentData);

      // Recuperar el ID del estudiante desde sessionStorage
      const studentId = sessionStorage.getItem('estudianteID');

      if (studentId) {
        const numericId = Number(studentId); // Convertimos el id a número

        // Recorrer la lista de estudiantes y encontrar el estudiante cuyo `estudianteID` coincida
        for (let i = 0; i < this.studentData.length; i++) {
          if (this.studentData[i].estudianteID === numericId) {
            this.student = this.studentData[i];
            this.alumno = {
              nombre: this.student.nombre,
              id: this.student.estudianteID,
              codigo: this.student.codigo,
              foto: this.student.foto,
              estaMatriculado: this.student.estaMatriculado
            }
            this.ss.setStudent(this.student); // Almacenar el estudiante en el servicio
            console.log('Estudiante encontrado:', this.student);
            break;
          }
        }

        // Si no se encuentra el estudiante
        if (!this.student.estudianteID) {
          console.error('Estudiante no encontrado con el ID:', numericId);
        }
      } else {
        console.error('No se encontró el ID del estudiante en sessionStorage');
        this.router.navigate(['/login']); // Redirigir al login si no hay ID en sessionStorage
      }
    });
  }

  ngOnInit(): void {
    if (this.isBrowser()) {
      this._getStudents(); // Obtener todos los estudiantes
    }
  }

  // Método para verificar si estamos en el navegador
  isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  }

  // Método para desconectar al usuario
  logout() {
    this.ss.clearStudent(); // Limpiar los datos del estudiante en el servicio
    if (this.isBrowser()) {
      /// Eliminar los datos del alumno del localStorage
      sessionStorage.removeItem('estudianteID');
    }
    /// Redirigir al login
    this.router.navigate(['/login']);
  }
}

  /* student: any = {}; // Almacenar los datos del estudiante

  constructor(private readonly ss:StudentService, private router: Router) {}

  ngOnInit(): void {
    if (this.ss.hasStudent()) {
      this.student = this.ss.getStudent(); // Obtener los datos del estudiante
      console.log('Datos del estudiante en Navbar:', this.student);
    } */

    /* /// Verificar si estamos en un entorno de navegador antes de usar localStorage
    if (this.isBrowser()) {
      /// Extraer los datos del alumno desde localStorage
      const nombre = sessionStorage.getItem('estudianteNombre');
      const id = sessionStorage.getItem('estudianteID');
      const codigo = sessionStorage.getItem('estudianteCodigo');
      const foto = sessionStorage.getItem('estudianteFoto');
      const estaMatriculado = sessionStorage.getItem('estudianteEstaMatriculado') === 'true';

      /// Si hay datos en el localStorage, los asignamos al objeto alumno
      if (nombre && id && foto) {
        this.alumno = {
          nombre,
          id,
          codigo,
          foto,
          estaMatriculado
        };
      }
    } */
  //}

  // Método para desconectar al usuario
/*   logout() {
      if (this.isBrowser()) {
      /// Eliminar los datos del alumno del localStorage
      sessionStorage.removeItem('estudianteNombre');
      sessionStorage.removeItem('estudianteID');
      sessionStorage.removeItem('estudianteCodigo');
      sessionStorage.removeItem('estudianteFoto');
      sessionStorage.removeItem('estudianteEstaMatriculado'); 
    } 
    /// Redirigir al login
    this.router.navigate(['/login']);
  }

  /// Método para verificar si estamos en el navegador
    isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  } 
} */


