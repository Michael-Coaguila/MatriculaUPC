import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule], // Se agrega el módulo CommonModule para poder usar las directivas ngIf y ngFor
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
/* export class DashboardComponent {

} */

export class DashboardComponent implements OnInit {

  alumno: any;

  constructor() { }

  ngOnInit(): void {
    // Simulación de datos del alumno
    this.alumno = {
      nombre: 'Michael Coaguila',
      id: 'U202220780',
      turno: 'Mañana',
      tieneDeuda: false, // Cambiar a true para ver cómo se muestra con deuda
      estaMatriculado: true // Cambiar a true para ver cómo se muestra matriculado
    };
  }

}
