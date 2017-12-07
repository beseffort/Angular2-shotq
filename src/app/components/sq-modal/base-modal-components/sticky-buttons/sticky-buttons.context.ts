import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';
import { StickyButton } from './button.model';
export class StickyButtonsModalContext extends BSModalContext {
  buttons: StickyButton[] = [];
}
