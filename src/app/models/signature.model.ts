export class Signature {
  id: number;
  name: string;
  email: string;
  account: number;

  legal_document: number;
  sig_type: string;
  sig_requirement: string;
  role: number;
  contact: number;
  worker: number;
  autograph: number;
  sig_style?: string;
  completed?: boolean;
}
