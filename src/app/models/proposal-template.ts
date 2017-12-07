import { BaseProposal } from './base-proposal';

export interface ProposalTemplate extends BaseProposal {
  settings_template?: number;
  job_count?: number;
}
