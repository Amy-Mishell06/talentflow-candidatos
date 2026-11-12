import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AlertController,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCheckbox,
  IonContent,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonRadio,
  IonRadioGroup,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  briefcaseOutline,
  calendarOutline,
  documentTextOutline,
  personOutline,
  refreshOutline,
  saveOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';

import { CARGOS, HABILIDADES, MODALIDADES, NIVELES_ACADEMICOS } from '../../data/opciones';
import { Modalidad, NuevoCandidato } from '../../models/candidato.model';
import { CandidatosService, mensajeErrorFirebase } from '../../services/candidatos.service';
import {
  desdeHoy,
  edadMinima,
  entero,
  haceAniosISO,
  hoyISO,
  mayorQueCero,
  minSeleccionados,
  noFutura,
  soloFecha,
  textoMinimo,
} from '../../validators/candidato.validators';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonList, IonItem, IonLabel, IonNote, IonIcon,
    IonInput, IonTextarea, IonSelect, IonSelectOption,
    IonRadioGroup, IonRadio, IonSegment, IonSegmentButton, IonCheckbox,
    IonModal, IonDatetime, IonButton, IonSpinner,
  ],
})
export class RegistroPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly candidatosService = inject(CandidatosService);
  private readonly toastCtrl = inject(ToastController);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly alertCtrl = inject(AlertController);

  // Opciones de los controles
  readonly cargos = CARGOS;
  readonly niveles = NIVELES_ACADEMICOS;
  readonly habilidades = HABILIDADES;
  readonly modalidades = MODALIDADES;

  // Límites de fechas para ion-datetime
  readonly hoy = hoyISO();
  readonly maxNacimiento = haceAniosISO(18);
  readonly minNacimiento = haceAniosISO(80);
  readonly maxDisponibilidad = haceAniosISO(-2);

  enviado = false;   // se intentó guardar al menos una vez
  guardando = false;

  readonly form = this.fb.group({
    // Datos personales
    nombres: ['', [Validators.required, textoMinimo(3), Validators.maxLength(80)]],
    correo: ['', [
      Validators.required,
      Validators.email,
      Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/),
    ]],
    telefono: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
    fechaNacimiento: ['', [Validators.required, noFutura(), edadMinima(18)]],

    // Perfil profesional
    cargo: ['', Validators.required],
    nivelAcademico: ['', Validators.required],
    experienciaAnios: this.fb.control<number | string | null>(null, [
      Validators.required, entero(), Validators.min(0), Validators.max(50),
    ]),
    modalidad: this.fb.control<Modalidad | ''>('', Validators.required),
    habilidades: this.fb.control<string[]>([], minSeleccionados(1)),

    // Disponibilidad
    fechaDisponibilidad: ['', [Validators.required, desdeHoy()]],
    aspiracionSalarial: this.fb.control<number | string | null>(null, [
      Validators.required, mayorQueCero(), Validators.max(100000),
    ]),

    // Resumen y consentimiento
    resumen: ['', [Validators.required, textoMinimo(30), Validators.maxLength(1000)]],
    consentimiento: [false, Validators.requiredTrue],
  });

  /** Mensajes de error por campo y por tipo de error. */
  private readonly mensajes: Record<string, Record<string, string>> = {
    nombres: {
      required: 'Ingresa los nombres completos.',
      textoMinimo: 'Debe tener al menos 3 caracteres.',
      maxlength: 'Máximo 80 caracteres.',
    },
    correo: {
      required: 'Ingresa el correo electrónico.',
      email: 'El formato del correo no es válido (ej. nombre@dominio.com).',
      pattern: 'El formato del correo no es válido (ej. nombre@dominio.com).',
    },
    telefono: {
      required: 'Ingresa un teléfono de contacto.',
      pattern: 'Solo números, de 7 a 15 dígitos (puede iniciar con +).',
    },
    fechaNacimiento: {
      required: 'Selecciona la fecha de nacimiento.',
      fechaFutura: 'La fecha de nacimiento no puede estar en el futuro.',
      edadMinima: 'El postulante debe tener al menos 18 años.',
    },
    cargo: { required: 'Selecciona el cargo al que postula.' },
    nivelAcademico: { required: 'Selecciona el nivel académico.' },
    experienciaAnios: {
      required: 'Ingresa los años de experiencia (0 si no tiene).',
      entero: 'Debe ser un número entero, sin decimales.',
      min: 'No puede ser negativo.',
      max: 'El máximo permitido es 50 años.',
    },
    modalidad: { required: 'Selecciona una modalidad de trabajo.' },
    habilidades: { minSeleccionados: 'Selecciona al menos una habilidad técnica.' },
    fechaDisponibilidad: {
      required: 'Selecciona la fecha en la que podría empezar.',
      fechaPasada: 'La fecha de disponibilidad no puede ser anterior a hoy.',
    },
    aspiracionSalarial: {
      required: 'Ingresa la aspiración salarial.',
      mayorQueCero: 'Debe ser un valor mayor a 0.',
      max: 'Revisa el valor ingresado (máximo 100 000 USD).',
    },
    resumen: {
      required: 'Escribe un resumen profesional.',
      textoMinimo: 'El resumen debe tener al menos 30 caracteres.',
      maxlength: 'Máximo 1000 caracteres.',
    },
    consentimiento: { required: 'Debes aceptar el consentimiento para poder guardar.' },
  };

  constructor() {
    addIcons({
      personOutline, briefcaseOutline, calendarOutline, documentTextOutline,
      shieldCheckmarkOutline, saveOutline, refreshOutline,
    });
  }

  // ---------- Ayudas para la plantilla ----------

  /** Devuelve el mensaje de error del campo, o null si no hay que mostrar nada. */
  error(campo: string): string | null {
    const control = this.form.get(campo);
    if (!control || control.valid || !(control.touched || this.enviado)) return null;
    const tipo = Object.keys(control.errors ?? {})[0];
    return this.mensajes[campo]?.[tipo] ?? 'Valor no válido.';
  }

  fechaVisible(valor: string): string {
    const f = soloFecha(valor);
    if (!f) return 'Seleccionar';
    const [a, m, d] = f.split('-');
    return `${d}/${m}/${a}`;
  }

  marcarTocado(campo: string): void {
    this.form.get(campo)?.markAsTouched();
  }

  tieneHabilidad(h: string): boolean {
    return this.form.controls.habilidades.value.includes(h);
  }

  toggleHabilidad(h: string, marcado: boolean): void {
    const control = this.form.controls.habilidades;
    const actual = control.value;
    const nuevo = marcado ? [...new Set([...actual, h])] : actual.filter((x) => x !== h);
    control.setValue(nuevo);
    control.markAsTouched();
  }

  // ---------- Acciones ----------

  async guardar(): Promise<void> {
    if (this.guardando) return;
    this.enviado = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      await this.mostrarToast('Hay campos con errores. Revisa los mensajes en rojo.', 'warning');
      this.irAlPrimerError();
      return;
    }

    this.guardando = true;
    const loading = await this.loadingCtrl.create({ message: 'Guardando candidato…' });
    await loading.present();

    try {
      const candidato = this.construirCandidato();
      await this.candidatosService.crear(candidato);
      await this.mostrarToast(`${candidato.nombres} fue registrado correctamente.`, 'success');
      this.reiniciar();
    } catch (e) {
      console.error('Error al guardar candidato', e);
      await this.mostrarToast(mensajeErrorFirebase(e), 'danger');
    } finally {
      this.guardando = false;
      await loading.dismiss();
    }
  }

  async confirmarLimpiar(): Promise<void> {
    const alerta = await this.alertCtrl.create({
      header: 'Limpiar formulario',
      message: 'Se borrarán todos los datos ingresados. ¿Deseas continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Limpiar', role: 'destructive', handler: () => this.reiniciar() },
      ],
    });
    await alerta.present();
  }

  // ---------- Internos ----------

  private construirCandidato(): NuevoCandidato {
    const v = this.form.getRawValue();
    return {
      nombres: v.nombres.trim().replace(/\s+/g, ' '),
      correo: v.correo.trim().toLowerCase(),
      telefono: v.telefono.trim(),
      fechaNacimiento: soloFecha(v.fechaNacimiento),
      cargo: v.cargo,
      nivelAcademico: v.nivelAcademico,
      experienciaAnios: Number(v.experienciaAnios),
      modalidad: v.modalidad as Modalidad,
      habilidades: [...v.habilidades],
      fechaDisponibilidad: soloFecha(v.fechaDisponibilidad),
      aspiracionSalarial: Number(v.aspiracionSalarial),
      resumen: v.resumen.trim(),
      consentimiento: v.consentimiento,
    };
  }

  private reiniciar(): void {
    this.form.reset(); // NonNullableFormBuilder vuelve a los valores iniciales
    this.enviado = false;
  }

  private irAlPrimerError(): void {
    setTimeout(() => {
      document.querySelector('app-registro .error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }

  private async mostrarToast(message: string, color: 'success' | 'warning' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 3000,
      position: 'top',
      buttons: [{ text: 'OK', role: 'cancel' }],
    });
    await toast.present();
  }
}
