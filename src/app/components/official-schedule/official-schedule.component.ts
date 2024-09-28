import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Definimos la estructura de los cursos y horarios
interface Curso {
  nombre: string;
  seccion: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  sede?: string; // Agregamos la propiedad 'sede' como opcional
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
  matricula!: Matricula; // Usamos el operador '!' para indicar que se inicializará más tarde
  coloresCursos: { [key: string]: string } = {}; // Objeto para almacenar el color de cada curso
  bloqueado: { [key: string]: number } = {}; // Registro de celdas bloqueadas para evitar duplicación

  // Lista de colores más serios y con leve transparencia
  colores = [
    'rgba(52, 73, 94, 0.9)', // Azul oscuro
    'rgba(41, 128, 185, 0.9)', // Azul
    'rgba(39, 174, 96, 0.9)', // Verde
    'rgba(192, 57, 43, 0.9)', // Rojo
    'rgba(243, 156, 18, 0.9)', // Naranja
    'rgba(127, 140, 141, 0.9)', // Gris oscuro
  ];

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    // Simulamos los datos de matrícula para probar el componente
    this.matricula = {
      cursos: [
        {
          nombre: 'Matemáticas Avanzadas',
          seccion: 'A32B',
          dia: 'Lun',
          horaInicio: '10:00',
          horaFin: '12:00',
          sede: 'Campus Monterrico',
        },
        {
          nombre: 'Física General',
          seccion: 'B21A',
          dia: 'Jue',
          horaInicio: '07:00',
          horaFin: '10:00',
          sede: 'Campus San Isidro',
        },
        {
          nombre: 'Química',
          seccion: 'C12B',
          dia: 'Mié',
          horaInicio: '14:00',
          horaFin: '16:00',
          sede: 'Campus Villa',
        },
        // Puedes añadir más cursos si lo necesitas
      ],
    };

    // Asignar colores dinámicamente a cada curso
    this.asignarColoresCursos();

    // Generar la tabla del horario
    this.crearHorarioGrafico();

    // Evento para el botón de descargar PDF usando Renderer2
    const downloadBtn = this.renderer.selectRootElement(
      '#downloadPdfBtn',
      true
    );
    this.renderer.listen(downloadBtn, 'click', () => {
      this.generarPdfHorario();
    });
  }

  // Función para asignar un color a cada curso con tipado correcto
  asignarColoresCursos(): void {
    this.matricula.cursos.forEach((curso: Curso, index: number) => {
      // Asignamos un color basado en el índice, reutilizando colores si se acaban
      const colorIndex = index % this.colores.length;
      this.coloresCursos[curso.nombre] = this.colores[colorIndex];
    });
  }

  // Función para crear la tabla del horario en la página
  crearHorarioGrafico(): void {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const scheduleBody = this.renderer.selectRootElement('#scheduleBody', true);
    this.renderer.setProperty(scheduleBody, 'innerHTML', ''); // Limpiar el contenido previo

    // Crear filas para cada hora de 7:00 a 23:00
    for (let hora = 7; hora <= 23; hora++) {
      const fila = this.renderer.createElement('tr');
      const celdaHora = this.renderer.createElement('td');
      this.renderer.setProperty(
        celdaHora,
        'textContent',
        `${hora}:00 - ${hora + 1}:00`
      );
      this.renderer.appendChild(fila, celdaHora);

      dias.forEach((dia) => {
        let celdaDia = this.renderer.createElement('td');
        let cursoEncontrado = false;

        // Verificar si ya se bloqueó la celda en una hora anterior
        const claveBloqueo = `${dia}-${hora}`;
        if (this.bloqueado[claveBloqueo] && this.bloqueado[claveBloqueo] > 0) {
          this.bloqueado[claveBloqueo]--;
          return; // Salir si la celda está bloqueada
        }

        // Recorrer los cursos seleccionados y verificar si alguno pertenece a este día y hora
        for (let curso of this.matricula.cursos) {
          const horaInicioNum = this.convertirHoraA24(curso.horaInicio);
          const horaFinNum = this.convertirHoraA24(curso.horaFin);

          if (curso.dia === dia && horaInicioNum <= hora && horaFinNum > hora) {
            cursoEncontrado = true;

            // Determinar cuántas horas abarca el curso para el rowspan
            const duracionHoras = horaFinNum - horaInicioNum;
            celdaDia = this.renderer.createElement('td');
            this.renderer.setAttribute(
              celdaDia,
              'rowspan',
              duracionHoras.toString()
            );

            // Bloquear las siguientes celdas correspondientes a la duración del curso
            for (let i = 1; i < duracionHoras; i++) {
              const claveSiguiente = `${dia}-${hora + i}`;
              this.bloqueado[claveSiguiente] =
                (this.bloqueado[claveSiguiente] || 0) + 1;
            }

            // Aplicar color dinámico para el curso
            const colorCurso = this.coloresCursos[curso.nombre];
            this.renderer.setStyle(celdaDia, 'background-color', colorCurso);
            this.renderer.setStyle(celdaDia, 'color', '#fff');
            this.renderer.setProperty(
              celdaDia,
              'innerHTML',
              `<strong>${curso.seccion}</strong><br>${curso.nombre}`
            );

            break;
          }
        }

        // Añadir celda vacía si no hay curso en este horario
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

  // Genera un PDF con el horario seleccionado
  generarPdfHorario(): void {
    const doc = new jsPDF('landscape');

    // Añadir un título al PDF
    doc.setFontSize(18);
    doc.text('Horario Oficial de Clases', 10, 10);
    doc.setFontSize(12);
    doc.text(
      'Este es tu horario oficial, generado el ' +
        new Date().toLocaleDateString(),
      10,
      20
    );

    // Crear las filas del horario
    const rows = [];
    const dias = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ];

    // Crear una estructura de filas similar a la visualización de la tabla en la página
    for (let hora = 7; hora <= 23; hora++) {
      const fila = [`${hora}:00 - ${hora + 1}:00`];

      dias.forEach((dia) => {
        let celdaDia = '';

        // Recorrer los cursos seleccionados y verificar si alguno pertenece a este día y hora
        for (let curso of this.matricula.cursos) {
          const horaInicioNum = this.convertirHoraA24(curso.horaInicio);
          const horaFinNum = this.convertirHoraA24(curso.horaFin);

          if (
            curso.dia === dia.slice(0, 3) &&
            horaInicioNum <= hora &&
            horaFinNum > hora
          ) {
            celdaDia = `${curso.nombre} (${curso.seccion})`;
            break;
          }
        }
        fila.push(celdaDia);
      });

      rows.push(fila);
    }

    // Usar autoTable para crear la tabla de horarios en el PDF
    autoTable(doc, {
      head: [['Hora', ...dias]], // Añadir encabezados de columna
      body: rows, // Añadir filas generadas
      styles: {
        fontSize: 10, // Tamaño de la fuente para la tabla
        halign: 'center', // Alineación horizontal
        valign: 'middle', // Alineación vertical
        cellPadding: 4,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [53, 62, 72], // Color de fondo para los encabezados (oscuro)
        textColor: [255, 255, 255], // Color de texto para los encabezados (blanco)
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Color alternativo para las filas (gris claro)
      },
      tableLineColor: [189, 195, 199], // Color para las líneas de la tabla
      margin: { top: 30 }, // Margen superior
    });

    // Guardar el PDF
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
