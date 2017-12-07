import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { Modal, Overlay, overlayConfigFactory } from 'single-angular-modal';
import { Contract, Signature } from '../../../models';
import { EmailTemplate } from '../../../models/email-template.model';
import { ContractService, SignatureService } from '../../../services';
import { ContactService } from '../../../services/contact/contact.service';
import { EventService } from '../../../services/event/event.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { MessagingUiService } from '../../shared/messaging-ui/messaging-ui.service';
import { ContractAddModalContext, ContractsAddModalComponent } from '../contracts-add/contracts-add.component';


@Component({
  selector: 'app-contract-send',
  templateUrl: './contract-send.component.html',
  styleUrls: [
    './contract-send.component.scss'
  ],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ContractSendComponent {
  isLoading: boolean;
  contract: Contract;
  signaturesSub$: Subscription;
  signatures: Signature[] = [];

  protected emailBody: string;
  protected emailSubject: string;
  private destroyed = new Subject<void>();
  private modalInstance = null;
  private emailTemplateContents = '';
  private emailTemplates: EmailTemplate[] = [];
  private emailTemplate: EmailTemplate = EmailTemplate.Empty;
  private modalHideSub$: Subscription;
  private _isDisabled: boolean;

  constructor(public messagingUi: MessagingUiService,
              public contractService: ContractService,
              private contactService: ContactService,
              private signatureService: SignatureService,
              private modal: Modal,
              public flash: FlashMessageService,
              public router: Router,
              public route: ActivatedRoute,
              private vcRef: ViewContainerRef,
              overlay: Overlay) {
    overlay.defaultViewContainer = vcRef;

  }

  get isDisabled(): boolean {
    return this._isDisabled;
  }

  set isDisabled(value: boolean) {
    this._isDisabled = value;
  }

  subscribeTemplateUpdates() {
    this.messagingUi.templates$
      .takeUntil(this.destroyed)
      .subscribe(this.resetTemplates.bind(this));
  }

  ngOnInit() {
    this.subscribeTemplateUpdates();
    this.route.params
      .switchMap((params: { id: string }) => {
        this.isLoading = true;
        return this.contractService.get(parseInt(params.id, 10));
      })
      .map(ContractService.newObject)
      .subscribe((contract: Contract) => {
        this.isLoading = false;
        this.contract = contract;
        this.emailBody = contract.email_contents;
        this.emailSubject = contract.email_subject;
        this._isDisabled = !contract.isDraft && !contract.isPending && !contract.isSent;
        // An event is required to render a message template on the server side,
        // so we pass it to the service in case the user will try to create
        // a message from a template.
        if (contract.job_data && contract.job_data.main_event_details) {
          this.messagingUi.event = EventService.newObject(contract.job_data.main_event_details);
        }
        this.loadSignatures();
      });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
    if (this.signaturesSub$)
      this.signaturesSub$.unsubscribe();
  }

  save() {
    this.contract.email_subject = this.emailSubject.trim();
    this.contract.email_contents = this.emailBody;
    if (!this.contract.email_subject || !this.contract.email_contents) {
      this.flash.error('Email subject and body is required fields');
      return;
    }
    this.saveRecipients()
      .switchMap(() => this.contractService.save(this.contract))
      .switchMap(res => this.contractService.send(this.contract.id))
      .subscribe(res => {
        this.flash.success('Contract sent');
        this.router.navigate(['/contracts']);
      }, error => {
        this.flash.error('Contract send error');
      });
  }

  saveRecipients() {
    return Observable.zip(
      ...this.signatures.map(signature => this.signatureService.save(signature))
    );
  }

  loadSignatures() {
    if (this.signaturesSub$)
      this.signaturesSub$.unsubscribe();
    this.signaturesSub$ = this.signatureService.getList({legal_document: this.contract.id})
      .subscribe(res => {
        this.signatures = res.results.filter(sig => !sig.worker);
        this.postSignaturesLoad();
      });
  }

  addContactInline() {
    let signature = new Signature();

    signature.sig_type = 'full';
    signature.legal_document = this.contract.id;

    this.signatures.push(signature);
  }

  addFromContacts() {
    this.contract.contacts = this.signatures.filter(sig => !!sig.contact).map(sig => sig.contact);

    let overlayConfig = overlayConfigFactory(
      {
        contract: this.contract,
        enabledSteps: ['contact']
      },
      ContractAddModalContext
    );
    overlayConfig.viewContainer = this.vcRef;
    this.modal
      .open(ContractsAddModalComponent, overlayConfig)
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.loadSignatures();
            // Catching close event with result data from modal
            // console.log(result)
          })
          .catch(() => {
            // Catching dismiss event with no results
            // console.log('rejected')
          });
      });


  }

  postSignaturesLoad() {

  }

  protected resetTemplates(templates: EmailTemplate[]): void {
    this.emailTemplates = templates.slice();
  }

  //noinspection JSUnusedGlobalSymbols
  protected onTemplateSelected(template: EmailTemplate) {
    this.emailTemplate = template || EmailTemplate.Empty;
    this.emailSubject = this.emailTemplate.subject;
    this.messagingUi.renderTemplate(template)
      .subscribe(body => {
        this.emailBody = body;
      });
  }
}
