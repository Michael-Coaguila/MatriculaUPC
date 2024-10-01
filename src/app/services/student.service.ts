import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { response } from 'express';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'https://localhost:44309/api/student'; // Cambia esto por la URL de tu API
  private student: any = {}; // Variable para almacenar los datos del estudiante

  constructor(private readonly http: HttpClient) {}

  // Método para obtener los datos del estudiante por ID
  getStudentById(id: number) {
    return this.http.get(`${this.apiUrl}/obtener?id=${id}`, {responseType: 'json'});
  }

  getStudents() {
    return this.http.get(`${this.apiUrl}/listar`, {responseType: 'json'});
  }

  // Método para almacenar los datos del estudiante en el servicio
  setStudent(data: any): void {
    this.student = data;
    console.log('Datos del estudiante almacenados en el servicio:', this.student);
    this.getStudent()
  }

  // Método para obtener los datos del estudiante almacenados en el servicio
  getStudent(): any {
    console.log('Datos del estudiante en el get:', this.student);
    return this.student;
  }

  // Método para verificar si hay un estudiante almacenado
  hasStudent(): boolean {
    console.log('Estudiante almacenado, comprob en hasStudent:', this.student);
    return this.student !== null;
  }

  // Método para limpiar los datos del estudiante (logout, etc.)
  clearStudent(): void {
    this.student = null;
  }
}


