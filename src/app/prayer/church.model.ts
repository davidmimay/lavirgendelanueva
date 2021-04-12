import { Timestamp } from 'rxjs/internal/operators/timestamp';

export interface Church {
  id?: string;
  title?: string;
  priority?: number;
  asks?: Ask[];
}

export interface Ask {
  description?: string;
  label?: 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'gray';
}

export interface Prays {
  ask?: string;
  prayers?: number;
  stripeCustomerId?: string;
  cid?: string;
  uid?: string;
  date?: string;
}