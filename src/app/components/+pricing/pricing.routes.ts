import { ItemListComponent }               from './item/item-list';
import { ItemEditComponent } from './item/item-edit';
import { PackageEditComponent }            from './package/package-edit';
import { OpenModalByUrlComponent }         from '../shared/open-modal-by-url';

export const PRICING_ROUTES = [
  {path: 'items',                          component: ItemListComponent},
  {path: 'items/add',                      component: ItemEditComponent},
  {path: 'items/edit/:id',                 component: ItemEditComponent},
  {path: 'packages/edit/:id',              component: PackageEditComponent},
];
