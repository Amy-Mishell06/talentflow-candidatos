import { Injectable } from '@angular/core';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  Firestore,
  addDoc,
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

import { environment } from '../../environments/environment';
import { Candidato, NuevoCandidato } from '../models/candidato.model';

/**
 * Toda la lógica de Firestore vive aquí; las páginas solo llaman a crear() y listar().
 */
@Injectable({ providedIn: 'root' })
export class CandidatosService {
  private readonly db: Firestore;
  private readonly nombreColeccion = 'candidatos';
  private readonly tiempoMaximoMs = 15000;

  constructor() {
    const app = getApps().length ? getApp() : initializeApp(environment.firebase);
    this.db = getFirestore(app);
  }

  /** Crea un documento nuevo en `candidatos` con addDoc() y devuelve su ID. */
  async crear(candidato: NuevoCandidato): Promise<string> {
    const ref = await this.conLimite(
      addDoc(collection(this.db, this.nombreColeccion), {
        ...candidato,
        creadoEn: serverTimestamp(),
      }),
    );
    return ref.id;
  }

  /** Lee todos los candidatos con getDocs(), del más reciente al más antiguo. */
  async listar(): Promise<Candidato[]> {
    const q = query(collection(this.db, this.nombreColeccion), orderBy('creadoEn', 'desc'));
    const snap = await this.conLimite(getDocs(q));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Candidato, 'id'>) }));
  }

  /** Evita que la UI quede esperando indefinidamente si no hay conexión. */
  private conLimite<T>(promesa: Promise<T>): Promise<T> {
    return Promise.race([
      promesa,
      new Promise<T>((_, rechazar) =>
        setTimeout(() => rechazar({ code: 'timeout' }), this.tiempoMaximoMs),
      ),
    ]);
  }
}

/** Traduce errores de Firebase a mensajes claros para el usuario. */
export function mensajeErrorFirebase(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  switch (code) {
    case 'permission-denied':
      return 'Firestore rechazó la operación (reglas de seguridad). Revisa firestore.rules.';
    case 'unavailable':
    case 'timeout':
      return 'No se pudo contactar con Firebase. Verifica tu conexión e inténtalo de nuevo.';
    case 'invalid-argument':
      return 'Algún dato no tiene el formato esperado.';
    default:
      return 'Ocurrió un error inesperado al comunicarse con Firebase.';
  }
}
