import { Directive, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appEfectoTerminal]',
})
export class EfectoTerminalDirective implements AfterViewInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  // uso AfterViewInit para asegurarme de que Angular ya cargó el título real
  ngAfterViewInit() {
    // le da tiempo al navegador para que termine de renderizar
    setTimeout(() => {
      const textoOriginal = this.el.nativeElement.innerText;
      
      // vacia el elemento para que empiece el efecto
      this.renderer.setProperty(this.el.nativeElement, 'innerText', '');
      
      // esto detecta cuando el elemento entra en la pantalla
      const observer = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
          
          // si el título acaba de aparecer en la pantalla
          if (entrada.isIntersecting) {
            let i = 0;
            
            // empieza a escribir
            const intervalo = setInterval(() => {
              if (i < textoOriginal.length) {
                this.el.nativeElement.innerText += textoOriginal.charAt(i);
                i++;
              } else {
                clearInterval(intervalo);
              }
            }, 40); // tiempo que tarda en mostrar la siguiente letra

            // le indica que deje de mirar al elemento, así no escribe todo de nuevo si subo o bajo
            observer.unobserve(this.el.nativeElement);
          }
        });
      }, { threshold: 0.1 }); // se activa cuando el 10% del elemento es visible

      // observar el <h3>
      observer.observe(this.el.nativeElement);
      }, 50);
    }; 
  }
