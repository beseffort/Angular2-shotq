import { ContractsListComponent } from './contracts-list/contracts-list.component';
import { ContractEditComponent } from './contract-edit/contract-edit.component';
import { ContractSendComponent } from './contract-send';


export const CONTRACTS_ROUTES = [
  {path: '', component: ContractsListComponent},
  {path: ':id', children: [
    {path: '', component: ContractEditComponent},
    {path: 'send', component: ContractSendComponent},
  ]},
];
