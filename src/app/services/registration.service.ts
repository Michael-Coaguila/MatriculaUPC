import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private apiUrl = 'https://localhost:44309/api/Registration'; // Cambia esto por la URL de tu API

  constructor(private readonly http: HttpClient) {}

  // Método para registrar la matrícula
  registrarMatricula(matricula: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, matricula, { responseType: 'json' });
  }
}
