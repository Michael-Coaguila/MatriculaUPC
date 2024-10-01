import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../../services/student.service'; // Para obtener los cursos del estudiante
import { RegistrationService } from '../../services/registration.service'; // Para registrar la matrícula

@Component({
  selector: 'app-enrollment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './enrollment.component.html',
  styleUrls: ['./enrollment.component.css'],
})
export class EnrollmentComponent implements OnInit {
  creditosSeleccionados: number = 0;
  horariosSeleccionados: any = {}; // Guardará los horarios seleccionados por curso
  matriculaConfirmada: any = null; // Variable para almacenar la matrícula después de la confirmación
  cursos: any[] = []; // Aquí guardaremos los datos dinámicos de cursos y horarios
  student: any = {}; // Variable para almacenar los datos del estudiante

  constructor(
    private readonly ss: StudentService,
    private readonly rs: RegistrationService, // Inyectamos el nuevo servicio de registro
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener los cursos del estudiante desde la API
    this._getStudentAndTransformCourses();
  }

  // Método para obtener el estudiante y transformar los cursos disponibles
  _getStudentAndTransformCourses(): void {
    this.ss.getStudents().subscribe((response: any) => {
      const studentData = response.data;

      // Recuperar el ID del estudiante desde sessionStorage
      const studentId = sessionStorage.getItem('estudianteID');
      if (studentId) {
        const numericId = Number(studentId);
        const estudiante = studentData.find(
          (e: any) => e.estudianteID === numericId
        );

        if (estudiante) {
          this.student = estudiante;
          this.cursos = this.transformCourses(estudiante.cursosDisponibles);
          console.log('Cursos transformados para matrícula:', this.cursos);
        } else {
          console.error('Estudiante no encontrado con el ID:', numericId);
          this.router.navigate(['/login']);
        }
      } else {
        console.error('No se encontró el ID del estudiante en sessionStorage');
        this.router.navigate(['/login']);
      }
    });
  }

  // Método para confirmar la matrícula y enviar los datos a la API de registro
  confirmEnrollment(): void {
    if (this.creditosSeleccionados === 0) {
      alert('Debes seleccionar al menos un curso.');
    } else {
      // Crear el objeto de matrícula con el seccionID correcto
      const matricula = {
        estudianteID: this.student.estudianteID, // Asegúrate de que tienes el estudianteID correcto
        cursosMatriculados: Object.keys(this.horariosSeleccionados).map(
          (cursoNombre) => {
            const curso = this.getCursoByName(cursoNombre);
            return {
              cursoID: curso.cursoID, // Debes obtener el ID del curso
              seccionID: this.horariosSeleccionados[cursoNombre].seccionID, // Asegúrate de que seccionID sea un número
            };
          }
        ),
      };

      console.log('Matrícula a registrar:', matricula);

      // Llamar al servicio de registro para enviar la matrícula
      this.rs.registrarMatricula(matricula).subscribe(
        (response) => {
          console.log('Matrícula registrada con éxito:', response);
          this.matriculaConfirmada = matricula;

          // Mostrar modal de confirmación
          const confirmModal = new (window as any).bootstrap.Modal(
            document.getElementById('confirmModal')
          );
          confirmModal.show();
        },
        (error) => {
          console.error('Error al registrar la matrícula:', error);
          alert('Hubo un error al registrar la matrícula.');
        }
      );
    }
  }

  // Método auxiliar para obtener el curso por nombre
  getCursoByName(cursoNombre: string): any {
    return this.cursos
      .flatMap((ciclo: any) => ciclo.cursos)
      .find((c: any) => c.nombre === cursoNombre);
  }

  // Transformar los cursos a la estructura requerida por el frontend
  transformCourses(cursosDisponibles: any[]): any[] {
    const cursosPorCiclo: any = {};
    cursosDisponibles.forEach((curso) => {
      const ciclo = `Ciclo ${curso.ciclo}`;
      if (!cursosPorCiclo[ciclo]) {
        cursosPorCiclo[ciclo] = { ciclo, cursos: [] };
      }
      const cursoTransformado = {
        nombre: curso.nombreCurso,
        cursoID: curso.cursoID,
        creditos: curso.creditos,
        horarios: curso.secciones.map((seccion: any) => ({
          seccion: seccion.seccion,
          seccionID: seccion.seccionID,
          docente: seccion.docente,
          dia: seccion.horarios[0]?.dia || '',
          horaInicio: seccion.horarios[0]?.horaInicio || '',
          horaFin: seccion.horarios[0]?.horaFin || '',
          sede: seccion.sede,
          modalidad: 'Presencial',
          vacantes: seccion.vacantesOriginales,
          libre: seccion.vacantesRestantes,
        })),
      };
      cursosPorCiclo[ciclo].cursos.push(cursoTransformado);
    });

    // Ordenamos los ciclos por el número que está después de "Ciclo "
    const ciclosOrdenados = Object.values(cursosPorCiclo).sort(
      (a: any, b: any) => {
        const cicloA = parseInt(a.ciclo.split(' ')[1], 10);
        const cicloB = parseInt(b.ciclo.split(' ')[1], 10);
        return cicloA - cicloB; // Ordenar de menor a mayor
      }
    );

    return ciclosOrdenados;
  }

  // Otros métodos (onSectionSelected, convertirHoraA24, horasSeCruzan, etc.) permanecen igual

  // Maneja la selección de horarios con validación de cruces
  onSectionSelected(
    event: any,
    curso: string,
    dia: string,
    horaInicio: string,
    horaFin: string,
    seccionID: number
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
        this.horasSeCruzan(
          horario.horaInicio,
          horario.horaFin,
          horaInicioNum,
          horaFinNum
        )
      ) {
        this.mostrarAlertaConflicto();
        event.target.checked = false; // Desmarcar la selección
        return;
      }
    }

    // Deseleccionamos otros horarios del mismo curso
    this.deseleccionarOtrosHorarios(curso, event.target);

    // Guardamos el nuevo horario seleccionado con su sección
    this.horariosSeleccionados[curso] = {
      dia,
      horaInicio: horaInicioNum,
      horaFin: horaFinNum,
      seccionID, // Asegúrate de que el seccionID está almacenado aquí
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
    console.log(
      'Horario seleccionado para matricula:',
      this.horariosSeleccionados
    );
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
  /* confirmEnrollment(): void {
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
  } */

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
