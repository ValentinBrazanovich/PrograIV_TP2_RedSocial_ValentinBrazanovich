import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rango',
  standalone: true
})
export class RangoPipe implements PipeTransform {
  transform(likes: number): string {
    // si no hay likes empieza en 0
    const total = likes || 0;

    if (total >= 3) return '🔥 Post Legendario'; // 50
    if (total >= 2) return '⚡ Post Viral'; // 20
    if (total >= 1) return '✨ Destacado'; // 5
    
    return '';
  }
}