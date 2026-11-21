import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { addDoc, collection, doc, onSnapshot, runTransaction, serverTimestamp, Timestamp, Unsubscribe } from 'firebase/firestore';
import { AuthService } from '../../../core/auth';
import { firestoreDb } from '../../../core/firebase.config';
import { ProposalDialog, ProposalDraft } from './proposal-dialog';

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
  selector: 'app-polls',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatProgressBarModule,
    MatRadioModule
  ],
  templateUrl: './polls.html',
  styleUrl: './polls.scss'
})
export class Polls {
  readonly canManage = input(false);
  readonly roleLoading = input(false);
  readonly roleError = input<string | null>(null);

  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly polls = signal<Poll[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly voteError = signal<string | null>(null);
  readonly createError = signal<string | null>(null);
  readonly createSuccess = signal<string | null>(null);
  readonly creating = signal(false);

  private readonly voteSubscriptions = new Map<string, Unsubscribe>();
  private voteSubscriptionUserId: string | null = null;

  constructor() {
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
        this.loading.set(false);
        this.error.set(invalidProposal
          ? 'Algunas propuestas no se muestran porque sus datos no son válidos.'
          : null);
      },
      error => {
        console.error('Error al cargar las propuestas desde Firestore:', error);
        this.loading.set(false);
        this.error.set('No se pudieron cargar las propuestas. Comprueba los permisos de Firestore.');
      }
    );

    effect(() => this.syncVoteSubscriptions(this.authService.currentUser()?.uid ?? null));
    inject(DestroyRef).onDestroy(() => {
      unsubscribe();
      this.voteSubscriptions.forEach(stop => stop());
      this.voteSubscriptions.clear();
    });
  }

  openProposalDialog(): void {
    this.createError.set(null);
    this.createSuccess.set(null);
    this.dialog.open(ProposalDialog, {
      width: 'min(600px, 95vw)',
      maxWidth: '95vw'
    }).afterClosed().subscribe(draft => {
      if (draft) void this.createProposal(draft);
    });
  }

  async submitVote(pollId: string): Promise<void> {
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
    return poll.options.reduce((total, option) => total + option.votes, 0);
  }

  getPercentage(votes: number, total: number): number {
    return total === 0 ? 0 : Math.round((votes / total) * 100);
  }

  private async createProposal(draft: ProposalDraft): Promise<void> {
    const user = this.authService.currentUser();
    if (!user || !this.canManage()) return;

    this.creating.set(true);
    this.createError.set(null);
    this.createSuccess.set(null);
    try {
      await addDoc(collection(firestoreDb, 'proposals'), {
        ...draft,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });
      this.createSuccess.set('La propuesta se creó correctamente.');
    } catch (error) {
      console.error('Error al crear la propuesta en Firestore:', error);
      this.createError.set('No se pudo crear la propuesta. Comprueba tu rol y las reglas de Firestore.');
    } finally {
      this.creating.set(false);
    }
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
}
