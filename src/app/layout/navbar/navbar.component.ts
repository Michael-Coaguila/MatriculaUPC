import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Para la redirección al logout

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  alumno: any = {
    nombre: '',
    id: '',
    codigo: '',
    foto: ''
  };

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Extraer los datos del alumno desde localStorage
    const nombre = localStorage.getItem('estudianteNombre');
    const id = localStorage.getItem('estudianteID');
    const codigo = localStorage.getItem('estudianteCodigo');
    const foto = localStorage.getItem('estudianteFoto');

    // Si hay datos en el localStorage, los asignamos al objeto alumno
    if (nombre && id && foto) {
      this.alumno = {
        nombre,
        id,
        codigo,
        foto
      };
    }
  }

  // Método para desconectar al usuario
  logout() {
    // Eliminar los datos del alumno del localStorage
    localStorage.removeItem('estudianteNombre');
    localStorage.removeItem('estudianteID');
    localStorage.removeItem('estudianteCodigo');
    localStorage.removeItem('estudianteFoto');

    // Redirigir al login
    this.router.navigate(['/login']);
  }
}

