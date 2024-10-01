import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../services/student.service';
import { Router } from '@angular/router';
import { log } from 'console';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  studentData: any = {}; // Almacenar la respuesta completa de la API
  student: any = {}; // Almacenar el estudiante seleccionado

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
}
