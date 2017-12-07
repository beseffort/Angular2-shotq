import { Directive, OnInit, Renderer } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

const OVERFLOW_HIDDEN_URLS: string[] = [
  '/contacts'
];

@Directive({
  selector: '[bodyOverflow]'
})
export class OverflowBodyDirective implements OnInit {
  constructor(
    private router: Router,
    private renderer: Renderer
  ) { }

  ngOnInit() {
    let body = document.querySelector('body');
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        let setHidden = OVERFLOW_HIDDEN_URLS.indexOf(val.url) !== -1;
        let overflowY = setHidden ? 'hidden' : 'auto';
        this.renderer.setElementStyle(body, 'overflowY', overflowY);
      }
    });
  }

}
