import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
/* export class NavbarComponent {

} */

export class NavbarComponent implements OnInit {

  alumno: any;

  constructor() { }

  ngOnInit(): void {
    // Simulación de datos del alumno
    this.alumno = {
      nombre: 'Michael Coaguila',
      id: 'U202220780',
      foto: 'https://www.kindpng.com/picc/m/25-254714_graduation-ceremony-vector-graphics-graduate-university-student-icon.png'
    };
  }

}
