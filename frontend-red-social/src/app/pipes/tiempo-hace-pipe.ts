import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoHace',
})
export class TiempoHacePipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    const fechaPasada = new Date(value);
    const ahora = new Date();
    // se calcula el tiempo
    const segundos = Math.floor((ahora.getTime() - fechaPasada.getTime()) / 1000);
    // si pasaron menos de 60 segundos
    if (segundos < 60){
      return 'Hace un momento';
    }
    // si pasó menos de una hora
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60){
      return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    }
    // si pasó menos de un día
    const horas = Math.floor(minutos / 60);
    if(horas < 24){
      return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    }
    // si pasó al menos un día
    const dias = Math.floor(horas / 24);
    return `Hace ${dias} dia${dias > 1 ? 's' : ''}`;
  }
}
