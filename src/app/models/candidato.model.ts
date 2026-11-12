import { FieldValue, Timestamp } from 'firebase/firestore';

export type Modalidad = 'Presencial' | 'Híbrida' | 'Remota';

/**
 * Documento de la colección `candidatos` en Cloud Firestore.
 * Cada campo se guarda como atributo independiente (consultable), no como un JSON en texto.
 */
export interface Candidato {
  id?: string;                 // ID del documento (no se guarda dentro del documento)

  // Datos personales
  nombres: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;     // 'YYYY-MM-DD'

  // Perfil profesional
  cargo: string;
  nivelAcademico: string;
  experienciaAnios: number;    // entero 0–50
  modalidad: Modalidad;
  habilidades: string[];

  // Disponibilidad
  fechaDisponibilidad: string; // 'YYYY-MM-DD'
  aspiracionSalarial: number;  // USD, > 0

  // Resumen y consentimiento
  resumen: string;
  consentimiento: boolean;

  // Metadatos
  creadoEn?: Timestamp | FieldValue | null; // serverTimestamp() al crear
}

/** Datos que envía el formulario (sin id ni fecha de creación). */
export type NuevoCandidato = Omit<Candidato, 'id' | 'creadoEn'>;
