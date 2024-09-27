import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-enrollment',
  standalone: true,
  imports: [CommonModule], // standalone con CommonModule
  templateUrl: './enrollment.component.html',
  styleUrls: ['./enrollment.component.css'],
})
export class EnrollmentComponent implements OnInit {
  creditosSeleccionados: number = 0;
  horariosSeleccionados: any = {}; // Guardará los horarios seleccionados por curso
  matriculaConfirmada: any = null; // Variable para almacenar la matrícula después de la confirmación
  cursos: any[] = []; // Aquí guardaremos los datos dinámicos de cursos y horarios

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Inicializa los datos simulados para los cursos (esto se reemplazará por una API en el futuro)
    this.cursos = [
      {
        ciclo: 'Ciclo 3',
        cursos: [
          {
            nombre: 'Matemáticas Avanzadas',
            creditos: 3,
            horarios: [
              {
                seccion: 'A32B',
                docente: 'Hilario Padilla',
                dia: 'Jue',
                horaInicio: '07:00',
                horaFin: '10:00',
                sede: 'Monterrico',
                modalidad: 'Presencial',
                vacantes: 30,
                libre: 21,
              },
              {
                seccion: 'A34C',
                docente: 'Ana Perez',
                dia: 'Lun',
                horaInicio: '10:00',
                horaFin: '12:00',
                sede: 'Monterrico',
                modalidad: 'Presencial',
                vacantes: 28,
                libre: 15,
              },
            ],
          },
          {
            nombre: 'Física General',
            creditos: 4,
            horarios: [
              {
                seccion: 'B21A',
                docente: 'David Gonzales',
                dia: 'Jue',
                horaInicio: '07:00',
                horaFin: '10:00',
                sede: 'Monterrico',
                modalidad: 'Presencial',
                vacantes: 45,
                libre: 30,
              },
              {
                seccion: 'B22B',
                docente: 'Carlos Ramirez',
                dia: 'Vie',
                horaInicio: '14:00',
                horaFin: '16:00',
                sede: 'San Isidro',
                modalidad: 'Presencial',
                vacantes: 28,
                libre: 18,
              },
            ],
          },
        ],
      },
    ];
  }

  // Maneja la selección de horarios con validación de cruces
  onSectionSelected(
    event: any,
    curso: string,
    dia: string,
    horaInicio: string,
    horaFin: string,
    seccion: string
  ): void {
    const horaInicioNum = this.convertirHoraA24(horaInicio);
    const horaFinNum = this.convertirHoraA24(horaFin);

    if (!event.target.checked) {
      delete this.horariosSeleccionados[curso]; // Elimina el curso si se deselecciona
      this.actualizarCreditos();
      return;
    }

    // Verificamos si hay conflicto con otros horarios seleccionados
    for (let cursoSeleccionado in this.horariosSeleccionados) {
      const horario = this.horariosSeleccionados[cursoSeleccionado];
      if (
        horario.dia === dia &&
        this.horasSeCruzan(horario.horaInicio, horario.horaFin, horaInicioNum, horaFinNum)
      ) {
        this.mostrarAlertaConflicto();
        event.target.checked = false; // Desmarcar la selección
        return;
      }
    }

    // Deseleccionamos otros horarios del mismo curso
    this.deseleccionarOtrosHorarios(curso, event.target);

    // Guardamos el nuevo horario seleccionado
    this.horariosSeleccionados[curso] = {
      dia,
      horaInicio: horaInicioNum,
      horaFin: horaFinNum,
      seccion,
    };
    this.ocultarAlertaConflicto();
    this.actualizarCreditos();
  }

  // Convierte horas a formato de 24 horas
  convertirHoraA24(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas + minutos / 60;
  }

  // Verifica si las horas se cruzan
  horasSeCruzan(
    horaInicio1: number,
    horaFin1: number,
    horaInicio2: number,
    horaFin2: number
  ): boolean {
    return horaInicio1 < horaFin2 && horaFin1 > horaInicio2;
  }

  // Mostrar alerta de conflicto de horarios
  mostrarAlertaConflicto(): void {
    const alerta = document.getElementById('horarioConflictoAlert');
    if (alerta) {
      alerta.classList.remove('d-none');
      alerta.classList.add('show');
      setTimeout(() => {
        this.ocultarAlertaConflicto();
      }, 3000);
    }
  }

  // Ocultar alerta de conflicto de horarios
  ocultarAlertaConflicto(): void {
    const alerta = document.getElementById('horarioConflictoAlert');
    if (alerta) {
      alerta.classList.remove('show');
      setTimeout(() => {
        alerta.classList.add('d-none');
      }, 500);
    }
  }

  // Deselecciona los otros horarios del mismo curso
  deseleccionarOtrosHorarios(curso: string, checkboxActual: any): void {
    const checkboxes = document.getElementsByName(`horario${curso}`);
    checkboxes.forEach((checkbox: any) => {
      if (checkbox !== checkboxActual) {
        checkbox.checked = false; // Deselecciona todos los otros checkboxes
      }
    });
  }

  // Actualiza los créditos seleccionados
  actualizarCreditos(): void {
    this.creditosSeleccionados = 0;
    for (let curso in this.horariosSeleccionados) {
      const cursoSeleccionado = this.cursos
        .flatMap((ciclo) => ciclo.cursos)
        .find((c) => c.nombre === curso);
      if (cursoSeleccionado) {
        this.creditosSeleccionados += cursoSeleccionado.creditos;
      }
    }
    document.getElementById('creditos-seleccionados')!.textContent =
      this.creditosSeleccionados.toString();
  }

  // Previsualizar el horario en un modal
  previewSchedule(): void {
    if (this.creditosSeleccionados === 0) {
      alert('Debes seleccionar al menos un curso.');
    } else {
      this.crearHorarioGrafico();
      const modal = new (window as any).bootstrap.Modal(
        document.getElementById('scheduleModal')
      );
      modal.show();
    }
  }

  // Confirmar matrícula y guardar en la variable
  confirmEnrollment(): void {
    if (this.creditosSeleccionados === 0) {
      alert('Debes seleccionar al menos un curso.');
    } else {
      this.matriculaConfirmada = this.horariosSeleccionados; // Guardamos la matrícula en la variable
      console.log(this.matriculaConfirmada); // Mostramos la matrícula en la consola
      console.log('Matrícula confirmada:', this.matriculaConfirmada);

      const confirmModal = new (window as any).bootstrap.Modal(
        document.getElementById('confirmModal')
      );
      confirmModal.show();
    }
  }

  // Redirigir al componente de horario oficial
  redirectToOfficialSchedule(): void {
    const confirmModal = (window as any).bootstrap.Modal.getInstance(
      document.getElementById('confirmModal')
    );
    confirmModal.hide();

    // Redirigir al componente official-schedule
    this.router.navigate(['/official-schedule']);
  }

  // Crear el horario gráfico
  crearHorarioGrafico(): void {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const scheduleBody = document.getElementById('scheduleBody')!;
    scheduleBody.innerHTML = ''; // Limpiar el contenido anterior

    for (let hora = 7; hora <= 23; hora++) {
      const fila = document.createElement('tr');
      const celdaHora = document.createElement('td');
      celdaHora.textContent = `${hora}:00 - ${hora + 1}:00`;
      fila.appendChild(celdaHora);

      dias.forEach((dia) => {
        let celdaDia = document.createElement('td');
        let cursoEncontrado = false;

        for (let curso in this.horariosSeleccionados) {
          const horario = this.horariosSeleccionados[curso];
          if (
            horario.dia === dia &&
            horario.horaInicio <= hora &&
            horario.horaFin > hora &&
            !horario.mostrado
          ) {
            cursoEncontrado = true;
            const duracionHoras = horario.horaFin - horario.horaInicio;
            celdaDia = document.createElement('td');
            celdaDia.setAttribute('rowspan', duracionHoras.toString());
            celdaDia.innerHTML = `<strong>${horario.seccion}</strong><br>${curso}`;
            celdaDia.classList.add('bg-primary', 'text-white');
            horario.mostrado = true;
            break;
          }
        }

        fila.appendChild(celdaDia);
      });

      scheduleBody.appendChild(fila);
    }

    for (let curso in this.horariosSeleccionados) {
      this.horariosSeleccionados[curso].mostrado = false;
    }
  }
}
