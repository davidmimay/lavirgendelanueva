export interface Pray {
  id?: string;
  churchId?: string;
  userId?: string;
  ask?: string;
  // date?: any;
}
export interface Prayer {
  id?: string;
  userId?: string;
  prayId?: string;
  prayed?: number;
}
/*
export interface Ask {
  description?: string;
  label?: '🙏 ask' | '🤗 thank' | '🙌 thanks' | '🤲 offer' | 'red' | 'gray';
}
*/