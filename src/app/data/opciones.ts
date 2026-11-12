import { Modalidad } from '../models/candidato.model';

// IMPORTANTE: si cambias estas listas, actualiza también firestore.rules.

export const CARGOS: string[] = [
  'Desarrollador móvil',
  'Analista de datos',
  'Diseñador UX/UI',
  'Soporte TI',
  'Tester QA',
];

export const NIVELES_ACADEMICOS: string[] = [
  'Bachillerato',
  'Tecnología',
  'Tercer nivel',
  'Posgrado',
];

export const HABILIDADES: string[] = [
  'Angular',
  'Ionic',
  'JavaScript',
  'Python',
  'SQL',
  'Git',
  'Firebase',
];

// Se guarda el texto tal cual (igual que el modelo de referencia del taller).
export const MODALIDADES: Modalidad[] = ['Presencial', 'Híbrida', 'Remota'];
