import { JobsComponent }            from './jobs';
import { JobInfoComponent }         from './jobs-info';
import { JobsEditComponent }        from './jobs-edit';
import { ProposalEditorComponent } from '../+proposals/proposal-editor/proposal-editor.component';
import { ProposalSendComponent } from '../+proposals/proposal-editor/proposal-send/proposal-send.component';
import { PackageEditorComponent } from '../+proposals/package/package-editor/package-editor.component';
import { JobProposalResolver } from '../+proposals/proposal-editor/job-proposal.resolver';
import { JobResolver } from './job.resolver';

export const JOBS_ROUTES = [
  {path: '', component: JobsComponent},
  {
    path: ':id',
    resolve: {
      job: JobResolver
    },
    children: [
      {path: '', component: JobInfoComponent},
      {path: 'edit', component: JobsEditComponent},
      {
        path: 'proposal',
        children: [
          {path: '', component: ProposalEditorComponent},
          {
            path: 'send', resolve: {
            proposal: JobProposalResolver
          },
            component: ProposalSendComponent
          },
          {path: 'add-package', component: PackageEditorComponent},
          {path: 'edit-package/:packageid', component: PackageEditorComponent},
        ]
      },

    ]
  },

];
