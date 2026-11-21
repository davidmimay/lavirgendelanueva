import { Component, signal, computed, inject, DestroyRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { addDoc, collection, doc, onSnapshot, runTransaction, serverTimestamp, Timestamp, Unsubscribe } from 'firebase/firestore';

import { AuthService } from '../../core/auth';
import { firestoreDb } from '../../core/firebase.config';
import { Login } from '../../shared/login/login';

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

function isAnnouncementTag(value: string): value is NewsItem['tag'] {
  return value === 'Cabildo' || value === 'Cultos' || value === 'Obra Social' || value === 'Aviso';
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
  submittingVote?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    Login
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  protected authService = inject(AuthService);

  // Datos combinados de la cuenta de Google + campos de hermano
  memberProfile = computed(() => {
    const user = this.authService.currentUser();

    return {
      uid: user?.uid ?? '',
      name: user?.displayName || 'Hermano/a',
      email: user?.email || 'Sin correo visible',
      photoUrl: user?.photoURL || null,
      // Valores provisionales hasta conectar con Firestore:
      memberNumber: '0418',
      role: 'Hermano/a de Número',
      feeStatus: 'Al corriente'
    };
  });

  // Datos del hermano autenticado (conectable a tu Auth/Firestore)
  member = signal<MemberProfile>({
    name: 'Carlos Mendoza Ruiz',
    memberNumber: '0418',
    sinceYear: 2012,
    role: 'Hermano de Número',
    feeStatus: 'Al corriente',
    email: 'carlos.mendoza@ejemplo.es'
  });

  news = signal<NewsItem[]>([]);
  announcementsLoading = signal(true);
  announcementsError = signal<string | null>(null);
  announcementTitle = signal('');
  announcementSummary = signal('');
  announcementTag = signal<NewsItem['tag']>('Aviso');
  creatingAnnouncement = signal(false);
  createAnnouncementError = signal<string | null>(null);
  createAnnouncementSuccess = signal<string | null>(null);

  // Votaciones activas
  polls = signal<Poll[]>([]);
  proposalsLoading = signal(true);
  proposalsError = signal<string | null>(null);
  voteError = signal<string | null>(null);
  canManageProposals = signal(false);
  roleLoading = signal(true);
  roleError = signal<string | null>(null);
  proposalTitle = signal('');
  proposalDescription = signal('');
  proposalClosingDate = signal('');
  proposalOptionLabels = signal<string[]>(['', '']);
  creatingProposal = signal(false);
  createProposalError = signal<string | null>(null);
  createProposalSuccess = signal<string | null>(null);

  private readonly voteSubscriptions = new Map<string, Unsubscribe>();
  private voteSubscriptionUserId: string | null = null;
  private roleUnsubscribe?: Unsubscribe;
  private announcementsUnsubscribe?: Unsubscribe;

  constructor() {
    this.announcementsUnsubscribe = onSnapshot(
      collection(firestoreDb, 'announcements'),
      snapshot => {
        let invalidAnnouncement = false;
        const announcements = snapshot.docs.flatMap(document => {
          const data = document.data();
          const title = data['title'];
          const summary = data['summary'];
          const tag = data['tag'];
          const date = data['date'];
          const createdAt = data['createdAt'];

          if (
            typeof title !== 'string' ||
            typeof summary !== 'string' ||
            typeof tag !== 'string' ||
            !isAnnouncementTag(tag) ||
            !(typeof date === 'string' || createdAt instanceof Timestamp)
          ) {
            console.error(`El anuncio ${document.id} tiene un formato no válido.`);
            invalidAnnouncement = true;
            return [];
          }

          return [{
            id: document.id,
            title,
            summary,
            tag,
            date: typeof date === 'string'
              ? date
              : createdAt.toDate().toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
          }];
        });

        this.news.set(announcements);
        this.announcementsLoading.set(false);
        this.announcementsError.set(invalidAnnouncement
          ? 'Algunos anuncios no se muestran porque sus datos no son válidos.'
          : null);
      },
      error => {
        console.error('Error al cargar los anuncios desde Firestore:', error);
        this.announcementsLoading.set(false);
        this.announcementsError.set('No se pudieron cargar las noticias y circulares. Comprueba los permisos de Firestore.');
      }
    );

    const unsubscribe = onSnapshot(
      collection(firestoreDb, 'proposals'),
      snapshot => {
        let invalidProposal = false;
        const existingPolls = new Map(this.polls().map(poll => [poll.id, poll]));
        const polls = snapshot.docs.flatMap(document => {
          const data = document.data();
          const title = data['title'];
          const description = data['description'];
          const closingDate = data['closingDate'];
          const rawOptions = data['options'];

          if (
            typeof title !== 'string' ||
            typeof description !== 'string' ||
            !(typeof closingDate === 'string' || closingDate instanceof Timestamp) ||
            !isRecord(rawOptions)
          ) {
            console.error(`La propuesta ${document.id} tiene un formato no válido.`);
            invalidProposal = true;
            return [];
          }

          const options = Object.entries(rawOptions).flatMap(([id, value]) => {
            if (
              !isRecord(value) ||
              typeof value['label'] !== 'string' ||
              typeof value['votes'] !== 'number' ||
              !Number.isSafeInteger(value['votes']) ||
              value['votes'] < 0
            ) {
              console.error(`La opción ${id} de la propuesta ${document.id} no es válida.`);
              invalidProposal = true;
              return [];
            }
            return [{ id, label: value['label'], votes: value['votes'] }];
          });

          const closingDateText = closingDate instanceof Timestamp
            ? closingDate.toDate().toLocaleDateString('es-ES')
            : closingDate;
          const existing = existingPolls.get(document.id);
          return [{
            id: document.id,
            title,
            description,
            closingDate: closingDateText,
            options,
            selectedOptionId: existing?.selectedOptionId,
            hasVoted: existing?.hasVoted ?? false,
            submittingVote: existing?.submittingVote ?? false
          }];
        });

        this.polls.set(polls);
        this.proposalsLoading.set(false);
        this.proposalsError.set(invalidProposal
          ? 'Algunas propuestas no se muestran porque sus datos no son válidos.'
          : null);
      },
      error => {
        console.error('Error al cargar las propuestas desde Firestore:', error);
        this.proposalsLoading.set(false);
        this.proposalsError.set('No se pudieron cargar las propuestas. Comprueba los permisos de Firestore.');
      }
    );

    effect(() => this.syncVoteSubscriptions(this.authService.currentUser()?.uid ?? null));
    effect(() => this.syncRoleSubscription(this.authService.currentUser()));
    inject(DestroyRef).onDestroy(() => {
      unsubscribe();
      this.announcementsUnsubscribe?.();
      this.voteSubscriptions.forEach(stop => stop());
      this.voteSubscriptions.clear();
      this.roleUnsubscribe?.();
    });
  }

  updateProposalOption(index: number, label: string): void {
    this.proposalOptionLabels.update(options =>
      options.map((option, optionIndex) => optionIndex === index ? label : option)
    );
  }

  addProposalOption(): void {
    if (this.proposalOptionLabels().length < 8) {
      this.proposalOptionLabels.update(options => [...options, '']);
    }
  }

  removeProposalOption(index: number): void {
    if (this.proposalOptionLabels().length > 2) {
      this.proposalOptionLabels.update(options => options.filter((_, optionIndex) => optionIndex !== index));
    }
  }

  canSubmitProposal(): boolean {
    const labels = this.proposalOptionLabels().map(option => option.trim());
    return this.canManageProposals()
      && !!this.proposalTitle().trim()
      && !!this.proposalDescription().trim()
      && !!this.proposalClosingDate()
      && labels.length >= 2
      && labels.every(Boolean)
      && new Set(labels.map(label => label.toLocaleLowerCase())).size === labels.length
      && !this.creatingProposal();
  }

  async createProposal(): Promise<void> {
    const user = this.authService.currentUser();
    if (!user || !this.canSubmitProposal()) return;

    this.creatingProposal.set(true);
    this.createProposalError.set(null);
    this.createProposalSuccess.set(null);
    try {
      const options = Object.fromEntries(
        this.proposalOptionLabels().map((label, index) => [
          `option${index + 1}`,
          { label: label.trim(), votes: 0 }
        ])
      );
      await addDoc(collection(firestoreDb, 'proposals'), {
        title: this.proposalTitle().trim(),
        description: this.proposalDescription().trim(),
        closingDate: this.proposalClosingDate(),
        options,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      this.proposalTitle.set('');
      this.proposalDescription.set('');
      this.proposalClosingDate.set('');
      this.proposalOptionLabels.set(['', '']);
      this.createProposalSuccess.set('La propuesta se creó correctamente.');
    } catch (error) {
      console.error('Error al crear la propuesta en Firestore:', error);
      this.createProposalError.set('No se pudo crear la propuesta. Comprueba tu rol y las reglas de Firestore.');
    } finally {
      this.creatingProposal.set(false);
    }
  }

  canSubmitAnnouncement(): boolean {
    return this.canManageProposals()
      && !!this.announcementTitle().trim()
      && !!this.announcementSummary().trim()
      && !this.creatingAnnouncement();
  }

  async createAnnouncement(): Promise<void> {
    const user = this.authService.currentUser();
    if (!user || !this.canSubmitAnnouncement()) return;

    this.creatingAnnouncement.set(true);
    this.createAnnouncementError.set(null);
    this.createAnnouncementSuccess.set(null);
    try {
      await addDoc(collection(firestoreDb, 'announcements'), {
        title: this.announcementTitle().trim(),
        summary: this.announcementSummary().trim(),
        tag: this.announcementTag(),
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      this.announcementTitle.set('');
      this.announcementSummary.set('');
      this.announcementTag.set('Aviso');
      this.createAnnouncementSuccess.set('La noticia o circular se publicó correctamente.');
    } catch (error) {
      console.error('Error al crear el anuncio en Firestore:', error);
      this.createAnnouncementError.set('No se pudo publicar el anuncio. Comprueba tu rol y las reglas de Firestore.');
    } finally {
      this.creatingAnnouncement.set(false);
    }
  }

  async submitVote(pollId: string) {
    const user = this.authService.currentUser();
    const poll = this.polls().find(item => item.id === pollId);
    const selectedOptionId = poll?.selectedOptionId;
    if (!user || !poll || !selectedOptionId || poll.hasVoted || poll.submittingVote) return;

    this.voteError.set(null);
    this.polls.update(list => list.map(item =>
      item.id === pollId ? { ...item, submittingVote: true } : item
    ));

    try {
      const proposalRef = doc(firestoreDb, 'proposals', pollId);
      const voteRef = doc(proposalRef, 'votes', user.uid);
      await runTransaction(firestoreDb, async transaction => {
        const [proposalSnapshot, voteSnapshot] = await Promise.all([
          transaction.get(proposalRef),
          transaction.get(voteRef)
        ]);
        if (!proposalSnapshot.exists()) throw new Error('La propuesta ya no existe.');
        if (voteSnapshot.exists()) return;

        const options = proposalSnapshot.data()['options'];
        if (!options || typeof options !== 'object' || Array.isArray(options)) {
          throw new Error('Las opciones de la propuesta no son válidas.');
        }
        const selectedOption = options[selectedOptionId];
        if (
          !selectedOption ||
          !isRecord(selectedOption) ||
          typeof selectedOption['label'] !== 'string' ||
          typeof selectedOption['votes'] !== 'number' ||
          !Number.isSafeInteger(selectedOption['votes'])
        ) {
          throw new Error('La opción seleccionada ya no está disponible.');
        }

        transaction.update(proposalRef, {
          options: {
            ...options,
            [selectedOptionId]: {
              ...selectedOption,
              votes: selectedOption['votes'] + 1
            }
          }
        });
        transaction.set(voteRef, {
          optionId: selectedOptionId,
          createdAt: serverTimestamp()
        });
      });

      this.polls.update(list => list.map(item =>
        item.id === pollId
          ? { ...item, hasVoted: true, submittingVote: false }
          : item
      ));
    } catch (error) {
      console.error('Error al guardar el voto en Firestore:', error);
      this.voteError.set('No se pudo guardar el voto. Comprueba que las reglas de Firestore estén desplegadas e inténtalo de nuevo.');
      this.polls.update(list => list.map(item =>
        item.id === pollId ? { ...item, submittingVote: false } : item
      ));
    }
  }

  getTotalVotes(poll: Poll): number {
    return poll.options.reduce((acc, opt) => acc + opt.votes, 0);
  }

  getPercentage(votes: number, total: number): number {
    return total === 0 ? 0 : Math.round((votes / total) * 100);
  }

  private syncVoteSubscriptions(userId: string | null): void {
    const polls = this.polls();
    const pollIds = new Set(polls.map(poll => poll.id));
    if (userId !== this.voteSubscriptionUserId) {
      this.voteSubscriptions.forEach(stop => stop());
      this.voteSubscriptions.clear();
      this.voteSubscriptionUserId = userId;
      this.polls.update(list => list.map(poll => ({
        ...poll,
        hasVoted: false,
        selectedOptionId: undefined
      })));
    }

    for (const [pollId, stop] of this.voteSubscriptions) {
      if (!pollIds.has(pollId)) {
        stop();
        this.voteSubscriptions.delete(pollId);
      }
    }
    if (!userId) return;

    for (const poll of polls) {
      if (this.voteSubscriptions.has(poll.id)) continue;
      const voteRef = doc(firestoreDb, 'proposals', poll.id, 'votes', userId);
      const stop = onSnapshot(
        voteRef,
        snapshot => this.polls.update(list => list.map(item => {
          if (item.id !== poll.id) return item;
          const optionId = snapshot.exists() ? snapshot.data()['optionId'] : undefined;
          return {
            ...item,
            hasVoted: snapshot.exists(),
            selectedOptionId: typeof optionId === 'string' ? optionId : undefined
          };
        })),
        error => {
          console.error('Error al comprobar el voto del usuario:', error);
          this.voteError.set('No se pudo comprobar si ya has votado.');
        }
      );
      this.voteSubscriptions.set(poll.id, stop);
    }
  }

  private syncRoleSubscription(user: ReturnType<AuthService['currentUser']>): void {
    if (user === undefined) return;

    this.roleUnsubscribe?.();
    this.roleUnsubscribe = undefined;
    this.canManageProposals.set(false);
    this.roleError.set(null);
    if (!user) {
      this.roleLoading.set(false);
      return;
    }

    this.roleLoading.set(true);
    this.roleUnsubscribe = onSnapshot(
      doc(firestoreDb, 'users', user.uid),
      snapshot => {
        const role = snapshot.data()?.['role'];
        this.canManageProposals.set(
          typeof role === 'string' &&
          ['admin', 'administrator', 'administrador', 'president', 'presidente'].includes(role)
        );
        this.roleLoading.set(false);
      },
      error => {
        console.error('Error al comprobar el rol del usuario:', error);
        this.canManageProposals.set(false);
        this.roleLoading.set(false);
        this.roleError.set('No se pudo comprobar tu rol para crear propuestas.');
      }
    );
  }
}