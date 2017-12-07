export class BaseProposal {
  id?: number;
  created?: Date;
  updated?: Date;
  name: string;
  message?: string;
  account: number;
  workers: number[];
}
