import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:44309/api/User'; // Cambia esta URL a la de tu API

  constructor(private http: HttpClient) {}

  // Método para enviar las credenciales de login
  login(Correo: string, Contrasena: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Aseguramos que el formato sea JSON
    });
  
    const body = { Correo: Correo, Contrasena: Contrasena }; // Enviar la contraseña sin hashear
  
    console.log('Solicitud HTTP:', body);
  
    return this.http.post(`${this.apiUrl}/Login`, body, { headers });
  }
}
