import { Directive, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appScrollAnimado]'
})
export class ScrollAnimadoDirective implements AfterViewInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entradas) => {
      entradas.forEach(entrada => {
        // si la tarjeta acaba de entrar a la pantalla
        if (entrada.isIntersecting) {
          // le agrego la clase que hace la animación
          this.renderer.addClass(this.el.nativeElement, 'animacion-visible');
          
          // deja de observarla para que no se anime cada vez que subo o bajo
          observer.unobserve(this.el.nativeElement); 
        }
      });
    }, { threshold: 0.1 }); // se dispara cuando se asoma el 10% de la tarjeta

    observer.observe(this.el.nativeElement);
  }
}