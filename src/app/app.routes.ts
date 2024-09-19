import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EnrollmentGuideComponent } from './components/enrollment-guide/enrollment-guide.component';
import { ScheduleSimulationComponent } from './components/schedule-simulation/schedule-simulation.component';
import { EnrollmentComponent } from './components/enrollment/enrollment.component';
import { OfficialScheduleComponent } from './components/official-schedule/official-schedule.component';

export const routes: Routes = [
  // Ruta de inicio de sesión
  { path: 'login', component: LoginComponent },

  // Ruta del dashboard (una vez autenticado)
  { path: 'dashboard', component: DashboardComponent },

  // Ruta para la guía de matrícula
  { path: 'enrollment-guide', component: EnrollmentGuideComponent },

  // Ruta para la simulación de horarios
  { path: 'schedule-simulation', component: ScheduleSimulationComponent },

  // Ruta para el proceso de matrícula
  { path: 'enrollment', component: EnrollmentComponent },

  // Ruta para consultar el horario oficial (después de la matrícula)
  { path: 'official-schedule', component: OfficialScheduleComponent },

  // Redireccionar a /login si no hay ruta coincidente
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' } // Ruta wildcard para manejar rutas inválidas
];