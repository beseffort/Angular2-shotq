import { Action } from '../dropdown/dropdown.component';

export const ChangeContactAction = new Action('contacts-edit', 'Edit Contact', 'icon-edit');
export const ArchiveContactAction = new Action('contacts-archive', 'Archive', 'icon-archive');
export const DeleteContactAction = new Action('contacts-delete', 'Delete from Job', 'icon-trash');
export const SetAsPrimaryContactAction = new Action('set-primary', 'Set as Primary', 'icon-task bold');

export const Actions = [ChangeContactAction , SetAsPrimaryContactAction, DeleteContactAction];
export const PrimaryActions = [ChangeContactAction, DeleteContactAction];
export const ArchivedActions = [DeleteContactAction];
