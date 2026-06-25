import { Directive, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[appClickAfuera]',
})

export class ClickAfueraDirective {
  @Output() appClickAfuera = new EventEmitter<void>();

  constructor(private eRef: ElementRef) {}

  // escucha todos los clics que pasan en la página
  @HostListener('document:click', ['$event.target'])
  alHacerClic(targetElement: any): void {
    // si el target es null no hace nada
    if(!targetElement) return;
    // verifica que el clic haya sido ADENTRO del elemento que tiene la directiva
    const clicAdentro = this.eRef.nativeElement.contains(targetElement);
    
    // si el click fue afuera dispara el evento
    if (!clicAdentro) {
      this.appClickAfuera.emit();
    }
  }
}
