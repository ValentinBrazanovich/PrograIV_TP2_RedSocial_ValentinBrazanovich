import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function validarRangoFecha(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const fechaSeleccionada = new Date(control.value + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const limitePasado = new Date();
    limitePasado.setFullYear(limitePasado.getFullYear() - 100);
    limitePasado.setHours(0, 0, 0, 0);

    if (fechaSeleccionada > hoy) {
      return { fechaFutura: true };
    }

    if (fechaSeleccionada < limitePasado) {
      return { fechaMuyAntigua: true };
    }

    return null;
  };
}