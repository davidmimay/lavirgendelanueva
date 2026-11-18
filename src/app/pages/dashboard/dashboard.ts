import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface MemberProfile {
  name: string;
  memberNumber: string;
  sinceYear: number;
  role: string;
  feeStatus: 'Al corriente' | 'Pendiente';
  email: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  tag: 'Cabildo' | 'Cultos' | 'Obra Social' | 'Aviso';
  summary: string;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  closingDate: string;
  options: PollOption[];
  selectedOptionId?: string;
  hasVoted: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatRadioModule,
    MatProgressBarModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  // Datos del hermano autenticado (conectable a tu Auth/Firestore)
  member = signal<MemberProfile>({
    name: 'Carlos Mendoza Ruiz',
    memberNumber: '0418',
    sinceYear: 2012,
    role: 'Hermano de Número',
    feeStatus: 'Al corriente',
    email: 'carlos.mendoza@ejemplo.es'
  });

  // Noticias internas de la Hermandad
  news = signal<NewsItem[]>([
    {
      id: 'n1',
      title: 'Convocatoria de Cabildo General Ordinario',
      date: '15 Nov 2026',
      tag: 'Cabildo',
      summary: 'Se cita a todos los hermanos mayores de edad el próximo domingo en el salón parroquial para la aprobación de cuentas y memoria anual.'
    },
    {
      id: 'n2',
      title: 'Reparto de papeletas de sitio y túnicas',
      date: '08 Nov 2026',
      tag: 'Cultos',
      summary: 'Abierto el plazo de reserva de turno para portar andas e insignias en los próximos traslados solemnes.'
    },
    {
      id: 'n3',
      title: 'Campaña de recogida de alimentos de Navidad',
      date: '02 Nov 2026',
      tag: 'Obra Social',
      summary: 'La Diputación de Caridad inicia la recogida de productos no perecederos en la Casa Hermandad los martes y jueves.'
    }
  ]);

  // Votaciones activas
  polls = signal<Poll[]>([
    {
      id: 'p1',
      title: 'Elección del acompañamiento musical para el 8 de septiembre',
      description: 'Consulta vinculante para definir la banda que acompañará el paso de la Patrona en la procesión principal.',
      closingDate: '30 Nov 2026',
      hasVoted: false,
      options: [
        { id: 'opt1', label: 'Banda de Música Municipal', votes: 68 },
        { id: 'opt2', label: 'Agrupación Musical Santa Cecilia', votes: 45 },
        { id: 'opt3', label: 'Banda Sinfónica Nuestra Señora del Rosario', votes: 32 }
      ]
    },
    {
      id: 'p2',
      title: 'Horario de apertura de la Casa Hermandad en invierno',
      description: 'Propuesta de ajuste de horario vespertino para facilitar las gestiones de secretaría.',
      closingDate: '25 Nov 2026',
      hasVoted: true,
      selectedOptionId: 'optB',
      options: [
        { id: 'optA', label: 'Martes y jueves de 18:00 a 20:00 h', votes: 54 },
        { id: 'optB', label: 'Miércoles y viernes de 19:00 a 21:00 h', votes: 89 }
      ]
    }
  ]);

  // Registrar el voto de forma reactiva
  submitVote(pollId: string) {
    this.polls.update(list =>
      list.map(poll => {
        if (poll.id !== pollId || !poll.selectedOptionId || poll.hasVoted) {
          return poll;
        }
        return {
          ...poll,
          hasVoted: true,
          options: poll.options.map(opt =>
            opt.id === poll.selectedOptionId
              ? { ...opt, votes: opt.votes + 1 }
              : opt
          )
        };
      })
    );
  }

  getTotalVotes(poll: Poll): number {
    return poll.options.reduce((acc, opt) => acc + opt.votes, 0);
  }

  getPercentage(votes: number, total: number): number {
    return total === 0 ? 0 : Math.round((votes / total) * 100);
  }
}