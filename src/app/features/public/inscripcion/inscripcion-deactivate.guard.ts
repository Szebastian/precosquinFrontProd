import { CanDeactivateFn } from '@angular/router';
import { InscripcionPageComponent } from './inscripcion.page';

export const inscripcionDeactivateGuard: CanDeactivateFn<InscripcionPageComponent> = (component) => {
  if (component.submitted()) return true;
  if (component.currentStep() <= 1 && !component.data.fullName) return true;
  return window.confirm('¿Salir? Se perderán los datos no guardados.');
};
