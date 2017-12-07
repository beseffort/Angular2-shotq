import * as _ from 'lodash';
import * as textClipper from 'text-clipper';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChangeNoteAction, DeleteNoteAction, NoteActions } from './note-actions';
import { FlashMessageService } from '../../../services/flash-message';
import { GeneralFunctionsService } from '../../../services/general-functions';
import { Action } from '../dropdown/dropdown.component';
import { BaseNote } from '../../../models/notes';
import { BaseUserProfile } from '../../../models/user';

const ORIGINAL_PROPERTY_NAME = '$original';
const TRUNCATED_TEXT_INDICATOR = '&hellip;';
const DEFAULT_MAX_LINES_COUNT = 5;
const DEFAULT_MAX_WORDS_COUNT = 40;

@Component({
  selector: 'notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  providers: [FlashMessageService, GeneralFunctionsService]
})
export class NotesComponent {
  @Input() notesLoading: boolean = false;
  //noinspection JSUnusedGlobalSymbols
  @Input() requestRes: boolean = false;
  @Input() pagination;
  @Input() maxWords = DEFAULT_MAX_WORDS_COUNT;
  @Input() maxLines = DEFAULT_MAX_LINES_COUNT;
  @Output() onDeleteNotes = new EventEmitter<BaseNote[]>();
  @Output() optionSelected = new EventEmitter();
  @Output() onNoteChanged = new EventEmitter();
  public noteChangeBuffer: BaseNote = BaseNote.Empty;
  public name: string;
  public show: boolean = false;
  private _notes: any[];
  //noinspection JSUnusedLocalSymbols
  private noteActions = NoteActions;

  @Input()
  get notes(): BaseNote[] {
    return this._notes;
  }

  set notes(values: BaseNote[]) {
    this._notes = _.map(values || [] as BaseNote[], this.resetNote.bind(this));
  }

  constructor(private flash: FlashMessageService,
              private generalFunctions: GeneralFunctionsService) {
  }

  private resetNote(note: BaseNote): BaseNote {
    let lines = note.body.toLocaleLowerCase().replace(/<br>/g, '\n').split('\n');
    let words = _.words(this.generalFunctions.removeHtmlTags(note.body));
    let maxCharCount = _.take(words, this.maxWords).join(' ').length;
    note['$isLongNote'] = words.length > this.maxWords || lines.length > this.maxLines;
    note['$isExpanded'] = !note['$isLongNote'];
    note['$body'] = note.body;
    note['$truncatedBody'] = textClipper(note.body, maxCharCount,
      {html: true, indicator: TRUNCATED_TEXT_INDICATOR, maxLines: this.maxLines});
    note['$modifiedByDisplayName'] = note.last_modified_by_data.name;
    note['$createdByDisplayName'] = note.created_by_data.name;
    return note;
  }

  //noinspection JSUnusedLocalSymbols,JSMethodCanBeStatic
  private toggleNote($event, note) {
    $event.preventDefault();
    $event.stopPropagation();
    note['$isExpanded'] = !note['$isExpanded'];
  }

  private saveNote(note: BaseNote) {
    this.onNoteChanged.emit(new BaseNote(note.id, note.subject, note.body));
  }

  // <editor-fold desc="Changing the note">

  private startChanges(note: BaseNote) {
    this.stopChanges();
    if (_.isNull(note)) {
      // Add some whitespace to the `body` so the tinymce
      // component could see some content
      note = new BaseNote(0, '', ' ');
      let currentUserStub = Object.assign(new BaseUserProfile(), {name: 'N/A'});
      note.created_by_data = currentUserStub;
      note.last_modified_by_data = currentUserStub;
    }
    this.noteChangeBuffer = _.cloneDeep(note);
    // keep a reference to the original object, so we can update it on commit
    this.noteChangeBuffer[ORIGINAL_PROPERTY_NAME] = note;
  }

  private validateChanges(note: BaseNote): boolean {
    note.subject = note.subject.trim();
    note.body = note.body.trim();
    if (!note.subject || !note.body) {
      this.flash.error(
        'Note name and body should be completed before you can post a note.'
      );
      return false;
    }
    return true;
  }

  //noinspection JSUnusedLocalSymbols
  private commitChanges() {
    if (this.noteChangeBuffer === BaseNote.Empty)
      return;
    let original = this.noteChangeBuffer[ORIGINAL_PROPERTY_NAME];
    if (!this.validateChanges(this.noteChangeBuffer))
      return;
    let hasChanged =
      this.noteChangeBuffer.subject !== original.subect ||
      this.noteChangeBuffer.body !== original.body;
    if (hasChanged) {
      delete this.noteChangeBuffer[ORIGINAL_PROPERTY_NAME];
      // save the changes to the local copy
      this.resetNote(this.noteChangeBuffer);
      Object.assign(original, this.noteChangeBuffer);
      this.onNoteChanged.emit(this.noteChangeBuffer);
    }
    this.stopChanges();
  }

  private stopChanges() {
    this.noteChangeBuffer = BaseNote.Empty;
  }

  // </editor-fold>

  // <editor-fold desc="Event handlers">

  //noinspection JSUnusedLocalSymbols
  private onNoteTitleChange(note: BaseNote, value: string) {
    let newNote = new BaseNote(note.id, value, note.body);
    if (this.validateChanges(newNote) && note.subject !== newNote.subject) {
      // save the current value to the local copy until the new value is arrived
      note.subject = newNote.subject;
      this.saveNote(newNote);
    }
  }

  //noinspection JSUnusedLocalSymbols
  private onNoteBodyChanged(value: string) {
    this.noteChangeBuffer.body = value;
  }

  //noinspection JSUnusedLocalSymbols
  private onNoteActionClicked(note: BaseNote, action: Action) {
    switch (action.id) {
      case DeleteNoteAction.id:
        this.onDeleteNotes.emit([note]);
        break;
      case ChangeNoteAction.id:
        this.startChanges(note);
        break;
      default:
    }
  }

  // </editor-fold>
}
