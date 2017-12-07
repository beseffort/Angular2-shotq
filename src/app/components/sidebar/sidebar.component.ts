import { Component, Input } from '@angular/core';

@Component({
  selector: 'sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['sidebar.component.scss']
})
export class SidebarComponent {
  @Input() collapsed: boolean;
}
