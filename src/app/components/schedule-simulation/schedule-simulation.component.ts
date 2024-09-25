import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-schedule-simulation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-simulation.component.html',
  styleUrls: ['./schedule-simulation.component.css'],
})
export class ScheduleSimulationComponent implements OnInit {
  creditosSeleccionados: number = 0;
  horariosSeleccionados: any = {}; // Guardará los horarios seleccionados por curso
  cursos: any[] = []; // Aquí guardaremos los datos dinámicos de cursos y horarios

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
      // Agrega más ciclos y cursos aquí
    ];
  }

  onSectionSelected(
    event: any,
    curso: string,
    dia: string,
    horaInicio: string,
    horaFin: string
  ): void {
    // Convertir horas a formato de 24 horas (números)
    const horaInicioNum = this.convertirHoraA24(horaInicio);
    const horaFinNum = this.convertirHoraA24(horaFin);

    // Si se está deseleccionando el horario, simplemente lo eliminamos y actualizamos los créditos
    if (!event.target.checked) {
      delete this.horariosSeleccionados[curso]; // Eliminar el curso si se deselecciona
      this.actualizarCreditos();
      return;
    }

    // Si se está seleccionando un horario, validamos los cruces
    for (let cursoSeleccionado in this.horariosSeleccionados) {
      const horario = this.horariosSeleccionados[cursoSeleccionado];
      if (
        horario.dia === dia &&
        this.horasSeCruzan(
          horario.horaInicio,
          horario.horaFin,
          horaInicioNum,
          horaFinNum
        )
      ) {
        // Hay un cruce de horarios, mostrar alerta
        this.mostrarAlertaConflicto();
        event.target.checked = false; // Desmarcar la selección
        return;
      }
    }

    // No hay conflicto, procedemos a deseleccionar otros horarios del mismo curso
    this.deseleccionarOtrosHorarios(curso, event.target);

    // Guardar la nueva selección
    this.horariosSeleccionados[curso] = {
      dia,
      horaInicio: horaInicioNum,
      horaFin: horaFinNum,
    };
    this.ocultarAlertaConflicto();
    this.actualizarCreditos();
  }

  // Nueva función para deseleccionar otros horarios del mismo curso
  deseleccionarOtrosHorarios(curso: string, checkboxActual: any): void {
    const checkboxes = document.getElementsByName(`horario${curso}`);
    checkboxes.forEach((checkbox: any) => {
      if (checkbox !== checkboxActual) {
        checkbox.checked = false; // Deseleccionar todos los otros checkboxes
      }
    });
  }

  convertirHoraA24(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas + minutos / 60; // Convertir a un número decimal (7:30 -> 7.5)
  }

  horasSeCruzan(
    horaInicio1: number,
    horaFin1: number,
    horaInicio2: number,
    horaFin2: number
  ): boolean {
    return horaInicio1 < horaFin2 && horaFin1 > horaInicio2; // Verificar si los horarios se superponen
  }

  mostrarAlertaConflicto(): void {
    const alerta = document.getElementById('horarioConflictoAlert');
    if (alerta) {
      alerta.classList.remove('d-none');
      alerta.classList.add('show'); // Mostrar con animación
  
      // Ocultar automáticamente después de unos segundos (opcional)
      setTimeout(() => {
        this.ocultarAlertaConflicto();
      }, 3000); // Duración visible de 3 segundos
    }
  }
  
  ocultarAlertaConflicto(): void {
    const alerta = document.getElementById('horarioConflictoAlert');
    if (alerta) {
      alerta.classList.remove('show'); // Comenzar a ocultar con animación
      setTimeout(() => {
        alerta.classList.add('d-none'); // Ocultar completamente después de la animación
      }, 500); // Duración de la animación de salida
    }
  }

  // Ahora suma los créditos dinámicamente según los cursos seleccionados
  actualizarCreditos(): void {
    this.creditosSeleccionados = 0;

    // Sumar los créditos de cada curso seleccionado
    for (let curso in this.horariosSeleccionados) {
      const cursoSeleccionado = this.cursos
        .flatMap(ciclo => ciclo.cursos)
        .find(c => c.nombre === curso);

      if (cursoSeleccionado) {
        this.creditosSeleccionados += cursoSeleccionado.creditos;
      }
    }

    // Actualizar el elemento visualmente
    document.getElementById('creditos-seleccionados')!.textContent =
      this.creditosSeleccionados.toString();
  }

  simulateEnrollment(): void {
    if (this.creditosSeleccionados === 0) {
      alert('Debes seleccionar al menos un curso.');
    } else {
      alert(
        `Simulación de matrícula completa con ${this.creditosSeleccionados} créditos seleccionados.`
      );
      // Lógica adicional para guardar la simulación
    }
  }
}
