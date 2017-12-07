import { OpenModalByUrlComponent } from '../shared/open-modal-by-url/open-modal-by-url.component';
import { ContactProfileComponent } from './contact-profile/contact-profile.component';
import { ContactsListComponent } from './contacts-list/contacts-list.component';
import { ImportCSVComponent } from './import-csv/import-csv.component';

export const CONTACTS_ROUTES = [
  {path: '', component: ContactsListComponent},
  {path: 'import-csv', component: ImportCSVComponent},
  {path: 'merge/:id1/:id2', component: OpenModalByUrlComponent},
  {path: 'profile/:id', component: ContactProfileComponent},
];
