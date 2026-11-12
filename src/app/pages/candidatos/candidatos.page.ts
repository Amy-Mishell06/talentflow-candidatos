import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  IonAvatar,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonNote,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Timestamp } from 'firebase/firestore';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  closeOutline,
  mailOutline,
  callOutline,
  peopleOutline,
  refreshOutline,
} from 'ionicons/icons';

import { CARGOS } from '../../data/opciones';
import { Candidato } from '../../models/candidato.model';
import { CandidatosService, mensajeErrorFirebase } from '../../services/candidatos.service';

type Orden = 'recientes' | 'antiguos' | 'nombre';

@Component({
  selector: 'app-candidatos',
  standalone: true,
  templateUrl: './candidatos.page.html',
  styleUrls: ['./candidatos.page.scss'],
  imports: [
    DatePipe, CurrencyPipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
    IonSearchbar, IonSelect, IonSelectOption, IonRefresher, IonRefresherContent,
    IonList, IonListHeader, IonItem, IonLabel, IonNote, IonAvatar, IonBadge, IonChip,
    IonCard, IonCardContent, IonSpinner, IonText, IonModal,
  ],
})
export class CandidatosPage {
  private readonly candidatosService = inject(CandidatosService);

  readonly cargos = CARGOS;

  candidatos: Candidato[] = [];
  cargando = false;
  error: string | null = null;

  busqueda = '';
  filtroCargo = 'todos';
  orden: Orden = 'recientes';

  seleccionado: Candidato | null = null;

  constructor() {
    addIcons({ refreshOutline, closeOutline, alertCircleOutline, peopleOutline, mailOutline, callOutline });
  }

  /** Se ejecuta cada vez que se entra a la pestaña: así aparecen los registros nuevos. */
  ionViewWillEnter(): void {
    this.cargar();
  }

  async cargar(): Promise<void> {
    if (this.cargando) return;
    this.cargando = true;
    this.error = null;
    try {
      this.candidatos = await this.candidatosService.listar();
    } catch (e) {
      console.error('Error al listar candidatos', e);
      this.error = mensajeErrorFirebase(e);
    } finally {
      this.cargando = false;
    }
  }

  async refrescar(event: CustomEvent): Promise<void> {
    await this.cargar();
    (event.target as HTMLIonRefresherElement).complete();
  }

  /** Lista visible: búsqueda por nombre + filtro por cargo + orden (bonus). */
  get filtrados(): Candidato[] {
    const texto = this.normalizar(this.busqueda);
    const lista = this.candidatos.filter(
      (c) =>
        (this.filtroCargo === 'todos' || c.cargo === this.filtroCargo) &&
        (!texto || this.normalizar(c.nombres).includes(texto)),
    );

    if (this.orden === 'nombre') {
      return [...lista].sort((a, b) => a.nombres.localeCompare(b.nombres, 'es'));
    }
    if (this.orden === 'antiguos') {
      return [...lista].reverse(); // Firestore ya entrega del más reciente al más antiguo
    }
    return lista;
  }

  abrirDetalle(c: Candidato): void {
    this.seleccionado = c;
  }

  cerrarDetalle(): void {
    this.seleccionado = null;
  }

  // ---------- Formato ----------

  iniciales(nombres: string): string {
    return nombres
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');
  }

  fechaCreacion(c: Candidato): Date | null {
    return c.creadoEn instanceof Timestamp ? c.creadoEn.toDate() : null;
  }

  fechaTexto(iso: string): string {
    if (!iso) return '—';
    const [a, m, d] = iso.split('-');
    return `${d}/${m}/${a}`;
  }

  edad(fechaNacimiento: string): number | null {
    if (!fechaNacimiento) return null;
    const [a, m, d] = fechaNacimiento.split('-').map(Number);
    const hoy = new Date();
    let edad = hoy.getFullYear() - a;
    if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) edad--;
    return edad;
  }

  colorModalidad(m: string): string {
    return m === 'Remota' ? 'success' : m === 'Híbrida' ? 'tertiary' : 'primary';
  }

  private normalizar(s: string): string {
    return (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }
}
