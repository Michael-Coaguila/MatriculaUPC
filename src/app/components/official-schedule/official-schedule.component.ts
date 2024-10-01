import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentService } from '../../services/student.service'; // Importar el servicio para obtener datos del estudiante
import { Router } from '@angular/router';

interface Curso {
  nombre: string;
  seccion: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  sede?: string;
}

interface Matricula {
  cursos: Curso[];
}

@Component({
  selector: 'app-official-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './official-schedule.component.html',
  styleUrls: ['./official-schedule.component.css'],
})
export class OfficialScheduleComponent implements OnInit {
  matricula: Matricula = { cursos: [] }; // Inicializamos vacía
  coloresCursos: { [key: string]: string } = {};
  bloqueado: { [key: string]: number } = {};
  colores = [
    'rgba(52, 73, 94, 0.9)', // Azul oscuro
    'rgba(41, 128, 185, 0.9)', // Azul
    'rgba(39, 174, 96, 0.9)', // Verde
    'rgba(192, 57, 43, 0.9)', // Rojo
    'rgba(243, 156, 18, 0.9)', // Naranja
    'rgba(127, 140, 141, 0.9)', // Gris oscuro
  ];

  constructor(
    private renderer: Renderer2,
    private readonly ss: StudentService, // Inyectamos el servicio del estudiante
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener los datos de la matrícula desde la API y transformarlos
    this._getStudentAndLoadSchedule();

    // Evento para el botón de descargar PDF
    const downloadBtn = this.renderer.selectRootElement('#downloadPdfBtn', true);
    this.renderer.listen(downloadBtn, 'click', () => {
      this.generarPdfHorario();
    });
  }

  // Obtener los datos del estudiante y cargar el horario oficial
  _getStudentAndLoadSchedule(): void {
    this.ss.getStudents().subscribe((response: any) => {
      const studentData = response.data;
      const studentId = sessionStorage.getItem('estudianteID');
      if (studentId) {
        const numericId = Number(studentId);
        const estudiante = studentData.find((e: any) => e.estudianteID === numericId);
        if (estudiante) {
          this.matricula.cursos = this.transformCursosMatriculados(estudiante.cursosMatriculados);
          console.log('Cursos matriculados:', this.matricula.cursos);
          this.asignarColoresCursos();
          this.crearHorarioGrafico();
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

  // Transforma los cursos matriculados a la estructura requerida por el frontend
  transformCursosMatriculados(cursosMatriculados: any[]): Curso[] {
    return cursosMatriculados.map((curso) => ({
      nombre: curso.nombreCurso,
      seccion: curso.seccion,
      dia: curso.horario.dia,
      horaInicio: curso.horario.horaInicio,
      horaFin: curso.horario.horaFin,
      sede: curso.sede,
    }));
  }

  // Asignar colores a cada curso
  asignarColoresCursos(): void {
    this.matricula.cursos.forEach((curso: Curso, index: number) => {
      const colorIndex = index % this.colores.length;
      this.coloresCursos[curso.nombre] = this.colores[colorIndex];
    });
  }

  // Crear la tabla del horario en la página
  crearHorarioGrafico(): void {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const scheduleBody = this.renderer.selectRootElement('#scheduleBody', true);
    this.renderer.setProperty(scheduleBody, 'innerHTML', '');

    for (let hora = 7; hora <= 23; hora++) {
      const fila = this.renderer.createElement('tr');
      const celdaHora = this.renderer.createElement('td');
      this.renderer.setProperty(celdaHora, 'textContent', `${hora}:00 - ${hora + 1}:00`);
      this.renderer.appendChild(fila, celdaHora);

      dias.forEach((dia) => {
        let celdaDia = this.renderer.createElement('td');
        let cursoEncontrado = false;
        const claveBloqueo = `${dia}-${hora}`;
        if (this.bloqueado[claveBloqueo] && this.bloqueado[claveBloqueo] > 0) {
          this.bloqueado[claveBloqueo]--;
          return;
        }

        for (let curso of this.matricula.cursos) {
          const horaInicioNum = this.convertirHoraA24(curso.horaInicio);
          const horaFinNum = this.convertirHoraA24(curso.horaFin);

          if (curso.dia === dia && horaInicioNum <= hora && horaFinNum > hora) {
            cursoEncontrado = true;
            const duracionHoras = horaFinNum - horaInicioNum;
            celdaDia = this.renderer.createElement('td');
            this.renderer.setAttribute(celdaDia, 'rowspan', duracionHoras.toString());

            for (let i = 1; i < duracionHoras; i++) {
              const claveSiguiente = `${dia}-${hora + i}`;
              this.bloqueado[claveSiguiente] = (this.bloqueado[claveSiguiente] || 0) + 1;
            }

            const colorCurso = this.coloresCursos[curso.nombre];
            this.renderer.setStyle(celdaDia, 'background-color', colorCurso);
            this.renderer.setStyle(celdaDia, 'color', '#fff');
            this.renderer.setProperty(celdaDia, 'innerHTML', `<strong>${curso.seccion}</strong><br>${curso.nombre}`);
            break;
          }
        }

        this.renderer.appendChild(fila, celdaDia);
      });

      this.renderer.appendChild(scheduleBody, fila);
    }
  }

  // Convertir hora a formato de 24 horas
  convertirHoraA24(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas + minutos / 60;
  }

  // Generar un PDF del horario
  generarPdfHorario(): void {
    const doc = new jsPDF('landscape');
    doc.setFontSize(18);
    doc.text('Horario Oficial de Clases', 10, 10);
    doc.setFontSize(12);
    doc.text('Generado el ' + new Date().toLocaleDateString(), 10, 20);

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const rows = [];

    for (let hora = 7; hora <= 23; hora++) {
      const fila = [`${hora}:00 - ${hora + 1}:00`];
      dias.forEach((dia) => {
        let celdaDia = '';
        for (let curso of this.matricula.cursos) {
          const horaInicioNum = this.convertirHoraA24(curso.horaInicio);
          const horaFinNum = this.convertirHoraA24(curso.horaFin);
          if (curso.dia === dia.slice(0, 3) && horaInicioNum <= hora && horaFinNum > hora) {
            celdaDia = `${curso.nombre} (${curso.seccion})`;
            break;
          }
        }
        fila.push(celdaDia);
      });
      rows.push(fila);
    }

    autoTable(doc, {
      head: [['Hora', ...dias]],
      body: rows,
      styles: { fontSize: 10, halign: 'center', valign: 'middle' },
      headStyles: { fillColor: [53, 62, 72], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 30 },
    });

    doc.save('horario-oficial.pdf');
  }

  // Exportar el horario a un calendario dinámicamente
  exportToCalendar(): void {
    let icsCalendar = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//My Schedule//NONSGML v1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Horario de Clases
    `;

    // Recorremos los cursos y creamos eventos para cada uno
    this.matricula.cursos.forEach((curso: Curso) => {
      const diaCalendario = this.obtenerDiaCalendario(curso.dia);
      const fechaInicio = this.formatoFechaICS(diaCalendario, curso.horaInicio);
      const fechaFin = this.formatoFechaICS(diaCalendario, curso.horaFin);

      const evento = `
BEGIN:VEVENT
SUMMARY:${curso.nombre}
DTSTART:${fechaInicio}
DTEND:${fechaFin}
RRULE:FREQ=WEEKLY;BYDAY=${diaCalendario}
DESCRIPTION:Sección: ${curso.seccion}
LOCATION:${curso.sede ? curso.sede : 'UPC Campus'}
END:VEVENT
      `;
      icsCalendar += evento;
    });

    icsCalendar += '\nEND:VCALENDAR';

    const blob = new Blob([icsCalendar], { type: 'text/calendar' });
    const link = this.renderer.createElement('a');
    this.renderer.setProperty(link, 'href', URL.createObjectURL(blob));
    this.renderer.setProperty(link, 'download', 'horario.ics');
    this.renderer.appendChild(document.body, link);
    link.click();
    this.renderer.removeChild(document.body, link);
  }

  // Convertir los días abreviados a formato ICS (MO, TU, WE, etc.)
  obtenerDiaCalendario(dia: string): string {
    const diasMap: { [key: string]: string } = {
      Lun: 'MO',
      Mar: 'TU',
      Mié: 'WE',
      Jue: 'TH',
      Vie: 'FR',
      Sáb: 'SA',
      Dom: 'SU',
    };
    return diasMap[dia];
  }

  // Formatear la hora en formato ICS (YYYYMMDDTHHMMSS)
  formatoFechaICS(dia: string, hora: string): string {
    const [horas, minutos] = hora.split(':');
    const fechaBase = '20230904'; // Fecha base de ejemplo (se puede ajustar dinámicamente)
    return `${fechaBase}T${horas}${minutos}00`;
  }
}
