import { CommonModule } from '@angular/common'; // Para usar ngIf, ngFor, etc.
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component'; // Importar componente de la barra de navegación
import { FooterComponent } from './layout/footer/footer.component'; // Importar componente del pie de página


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MatriculaUPC';

  // Inyectamos el servicio Router para poder acceder a la URL actual
  constructor(public router: Router) {}
}
