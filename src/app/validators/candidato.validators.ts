import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const pad = (n: number) => String(n).padStart(2, '0');

/** Fecha local de hoy en formato 'YYYY-MM-DD'. */
export function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Fecha de hoy menos N años, 'YYYY-MM-DD'. */
export function haceAniosISO(anios: number): string {
  const d = new Date();
  return `${d.getFullYear() - anios}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** ion-datetime puede devolver '2026-11-11T20:51:00'; nos quedamos con la parte de fecha. */
export function soloFecha(valor: string | null | undefined): string {
  return valor ? String(valor).substring(0, 10) : '';
}

/** Texto obligatorio con longitud mínima, ignorando espacios al inicio y al final. */
export function textoMinimo(min: number): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = (c.value ?? '').toString().trim();
    if (!v) return null; // 'required' se encarga del vacío
    return v.length >= min ? null : { textoMinimo: { requerido: min, actual: v.length } };
  };
}

/** La fecha no puede estar en el futuro. */
export function noFutura(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    if (!c.value) return null;
    return soloFecha(c.value) > hoyISO() ? { fechaFutura: true } : null;
  };
}

/** Edad mínima en años (para fecha de nacimiento). */
export function edadMinima(anios: number): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    if (!c.value) return null;
    const f = soloFecha(c.value);
    if (f > hoyISO()) return null; // lo reporta noFutura
    return f <= haceAniosISO(anios) ? null : { edadMinima: { requerido: anios } };
  };
}

/** La fecha no puede ser anterior a hoy. */
export function desdeHoy(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    if (!c.value) return null;
    return soloFecha(c.value) < hoyISO() ? { fechaPasada: true } : null;
  };
}

/** Número entero (sin decimales ni signo). */
export function entero(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    if (c.value === null || c.value === undefined || c.value === '') return null;
    return /^\d+$/.test(String(c.value)) ? null : { entero: true };
  };
}

/** Número estrictamente mayor que cero. */
export function mayorQueCero(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    if (c.value === null || c.value === undefined || c.value === '') return null;
    const n = Number(c.value);
    return Number.isFinite(n) && n > 0 ? null : { mayorQueCero: true };
  };
}

/** Para controles cuyo valor es un arreglo: mínimo de elementos seleccionados. */
export function minSeleccionados(min: number): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = c.value;
    return Array.isArray(v) && v.length >= min ? null : { minSeleccionados: { requerido: min } };
  };
}
