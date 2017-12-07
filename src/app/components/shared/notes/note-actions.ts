import { Action } from '../dropdown/dropdown.component';

export const ChangeNoteAction = new Action('notes-edit', 'Edit Note', 'icon-edit');
export const DeleteNoteAction = new Action('notes-delete', 'Delete Note', 'icon-trash');

export const NoteActions = [ChangeNoteAction, DeleteNoteAction];
