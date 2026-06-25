import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncarTexto',
})
export class TruncarTextoPipe implements PipeTransform {
  transform(value: string, limite: number = 40): string {
    if (!value) return ''; // si no hay texto no hace nada
    // si el texto supera el límite entonces lo corta y le pone ...
    return value.length > limite ? value.substring(0, limite) + '...': value;
  }
}
