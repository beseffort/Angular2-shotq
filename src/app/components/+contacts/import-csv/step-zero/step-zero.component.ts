/**
 * Component StepZeroComponent
 */
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild }                   from '@angular/core';
import { Router }                       from '@angular/router';
import { ImportCSVComponent }      from '../';
import { GeneralFunctionsService } from '../../../../services/general-functions';
import { ContactService }          from '../../../../services/contact/contact.service';
import { FlashMessageService }     from '../../../../services/flash-message';

@Component({
    selector: 'step-zero',
    templateUrl: './step-zero.component.html',
    styleUrls: ['./step-zero.component.scss'],
    providers: [GeneralFunctionsService, FlashMessageService]
})
export class StepZeroComponent {
  @ViewChild('inputFile') inputFile: any;
  @Output() closeModal = new EventEmitter();
  private csvFile: any;

  private functions;
  private router: Router;

  private importCSVComponentRef: ImportCSVComponent;

  constructor(
    private generalFunctionsService: GeneralFunctionsService,
    private contactService: ContactService,
    private flash: FlashMessageService,
    _router: Router
    ) {
    this.router = _router;
    this.functions = generalFunctionsService;
  }
  /**
   * [ngOnInit description]
   */
  public ngOnInit() {}
  /**
   * setComponentRef
   * @param {[type]} ref [description]
   */
  public setComponentRef(ref) {
    this.importCSVComponentRef = ref;
  }
  /**
   * Close modal without saving modifications
   *
   */
  public cancel() {
    this.router.navigate(['contacts']);
    this.closeModal.emit({action: 'close-modal'});
  }
  /**
   * importNewCSV component ref
   */
  private importNewCSV() {
    this.importCSVComponentRef.restart();
    this.closeModal.emit({action: 'modal-close'});
  }
  /**
   * Function to redirect to contact list.
   */
  private goToContactList() {
    this.functions.navigateTo('contacts');
    this.closeModal.emit({action: 'modal-close'});
  }
  /**
   * handle when a file is selected
   */
  private fileSelected(event) {
    this.csvFile = event.target.files[0];
    let type = event.target.files[0].type;
    let extension: string = event.target.files[0].name;
    extension = extension.substring(extension.length - 4);

    // check file extension and valid csv Mime types from http://filext.com/file-extension/CSV
    // Added type === '' because Chrome running on windows 10 set csv mime type to ""
    if (extension === '.csv' && (type === 'text/csv' || type === 'text/comma-separated-values'
      || type === 'application/csv' || type === 'application/excel' || type === 'application/vnd.ms-excel'
      || type === 'application/vnd.msexcel' || type === 'text/anytext') || type === '') {
      this.contactService.setFile(this.csvFile);
      this.functions.navigateTo('contacts/import-csv');
      this.closeModal.emit({action: 'modal-close'});

    } else {
      this.flash.error('Wrong file type. The file must be a .csv file');
    }
  }
  /**
   * open the dialog box to load the csv file
   * @param {any} e [description]
   */
  private openDialog(e: any) {
    document.getElementById('input-file-0').click();
  }
}
