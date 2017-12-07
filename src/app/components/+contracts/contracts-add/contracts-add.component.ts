import { Component, ElementRef } from '@angular/core';
import { ModalService } from '../../../services/modal/modal.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { Router } from '@angular/router';
import { BreadcrumbService } from '../../shared/breadcrumb/components/breadcrumb.service';
import { Contact } from '../../../models/contact';
import { JobService } from '../../../services/job/job.service';
import { Job } from '../../../models/job';
import { FormControl } from '@angular/forms';
import { Subscription, Observable, Subject } from 'rxjs';
import { JobTypeService } from '../../../services/job-type/job-type.service';
import { ContactService } from '../../../services/contact/contact.service';
import { ContractTemplate } from '../../../models/contract-template.model';
import { ContractTemplateService } from '../../../services/contract-template/contract-template.service';
import { GeneralFunctionsService } from '../../../services/general-functions/general-functions.service';
import { Contract } from '../../../models/contract';
import { ContractService } from '../../../services/contract/contract.service';
import { Signature } from '../../../models/signature.model';
import { SignatureService } from '../../../services/signature/signature.service';
import { TemplateVariable } from '../../../models/template-variable.model';

import * as _ from 'lodash';
import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from 'single-angular-modal';

type step = {
  name: string,
  title: string,
  enabled: boolean,
  activate?: () => void,
  finalize?: () => void
  index?: number,
};

export type modalConfig = {
  contract?: Contract,
  enabledSteps?: string[],
  next?: (id: number) => (string | number)[];
  errorsNext?: (id: number) => (string | number)[];
  showOnErrors?: boolean;
};


export class ContractAddModalContext extends BSModalContext {
  contract?: Contract;
  enabledSteps?: string[];
  next?: (id: number) => (string | number)[];
  errorsNext?: (id: number) => (string | number)[];
  showOnErrors?: boolean;
}

@Component({
  selector: 'contracts-add',
  templateUrl: 'contracts-add.component.html',
  styleUrls: ['contracts-add.component.scss'],
  providers: [
    JobTypeService,
    GeneralFunctionsService,
    ContractService,
    ContractTemplateService
  ]
})
export class ContractsAddModalComponent implements ModalComponent<ContractAddModalContext> {

  contacts: Contact[] = [];
  jobs: Job[] = [];
  templates: ContractTemplate[] = [];
  contract = new Contract();
  addingContact: boolean = false;
  newContact: any = {
    name: '',
    email: '',
  };
  onContractCreate: Subject<Contract> = new Subject<Contract>();

  steps: Array<step> = [
    {
      name: 'template',
      title: 'Select template',
      enabled: true,
      activate: this.activateTemplateStep,
      finalize: this.finalizeTemplateStep
    },
    {
      name: 'job',
      title: 'Associate with a Job',
      enabled: true,
      activate: this.activateJobStep,
      finalize: this.finalizeJobStep,
    },
    {
      name: 'contact',
      title: 'Select contact',
      enabled: true,
      activate: this.activateContactStep,
      finalize: this.finalizeContactStep
    },
    {
      name: 'errors',
      title: 'Errors',
      enabled: false
    }
  ];

  jobTypes = [];
  jobOrderingTypes = [
    {key: 'name', name: 'ALL'},
    {key: '-modified', name: 'RECENT'},
  ];
  contactOrderingTypes = [
    {key: 'ordering=first_name', name: 'ALL'},
    {key: 'ordering=-created', name: 'RECENT'},
  ];

  contactTypes = [];

  jobFilter = {
    ordering: this.jobOrderingTypes[0].key,
    status: 'opportunity,booked',
    job_type: '',
    search: ''
  };

  contactFilter = {
    contact_types: '',
    order: this.contactOrderingTypes[0].key,
    search: '',
  };

  currentStep: step = this.steps[0];

  private modalInstance = null;
  private componentRef;
  private isLoading = true;

  private searchTerm: string = '';
  private searchTermControl = new FormControl();
  private searchSub$: Subscription;
  private templateUpdateSub$: Subscription;
  private showStepIndicator = true;
  private showTemplateStep = true;
  private config: modalConfig;
  private showOnErrors: boolean = false;
  private context: ContractAddModalContext;


  constructor(public dialog: DialogRef<ContractAddModalContext>,
              private breadcrumbService: BreadcrumbService,
              private functions: GeneralFunctionsService,
              private flash: FlashMessageService,
              private modalService: ModalService,
              private jobService: JobService,
              private jobTypeService: JobTypeService,
              private contactService: ContactService,
              private contractService: ContractService,
              private signatureService: SignatureService,
              private contractTemplateService: ContractTemplateService,
              private elRef: ElementRef,
              private router: Router) {
    breadcrumbService.addFriendlyNameForRoute('/contacts/add', 'Add');
    this.context = this.dialog.context;
  }

  ngOnInit() {
    setTimeout(() => {
      jQuery(this.elRef.nativeElement)
        .parents('.modal-dialog')
        .addClass('modal-dialog_wide');
    });
    this.initializeData(this.context);
    // this.activateTemplateStep();
  }

  get activeSteps() {
    return this.steps.filter(step => step.enabled);
  }

  resetToDefaults() {
    this.contract = new Contract();

    this.steps.map(step => {
      step.enabled = true;
    });
    this.steps[this.steps.length - 1].enabled = false;


  }

  initializeData(config) {
    this.resetToDefaults();

    this.config = config;

    this.showOnErrors = config.showOnErrors;

    if (config.contract)
      this.contract = config.contract;

    if ('enabledSteps' in config) {

      this.steps.map(step => {
        step.enabled = config.enabledSteps.indexOf(step.name) >= 0;
      });

      if (config.enabledSteps.length > 0) {
        this.showStepIndicator = config.enabledSteps.length !== 1;
      } else {
        this.getContacts(() => {
          this.finalizeContactStep();
        });

      }
    }

    let ind = 0;
    this.steps.map(step => {
        if (step.enabled) {
          step.index = ind;
          ind++;
        }
      }
    );

    let firstStep = this.steps.find(step => step.enabled);
    if (firstStep)
      this.activateStep(firstStep.name);
  }

  getContactTypes() {
    this.contactTypes = [
      {
        value: '',
        label: 'All Contact Types',
      },
      ...this.contactService.getContactTypes().map(item => ({value: item.id, label: item.name}))
    ];
  }

  getContacts(callback?) {
    this.isLoading = true;
    setTimeout(() => {
      this.contactService.getContactList(this.contactFilter)
        .subscribe(res => {
          this.contacts = res.page;
          if (this.contract.contacts) {
            this.contacts.map((item: any) => {
              item._selected = this.contract.contacts.findIndex(i => i === item.id) >= 0;
              return item;
            });
          }
          this.isLoading = false;
          if (callback) callback();
        });

    });

  }

  activateStep(stepName) {
    let stepIndex = this.steps.findIndex(item => item.name === stepName);
    let step = this.steps[stepIndex];
    this.currentStep = step;
    if (step.activate)
      step.activate.bind(this)();
  }

  activateJobStep() {
    this.getJobTypes();
    this.getJobs();

    this.searchSub$ = this.searchTermControl.valueChanges
      .distinctUntilChanged()
      .debounceTime(400)
      .subscribe((val) => {
        if (this.currentStep.name === 'job') {
          this.jobFilter.search = val;
          this.getJobs();
        } else if (this.currentStep.name === 'contact') {
          this.contactFilter.search = val;
          this.getContacts();
        }
      });
  }

  finalizeJobStep() {
    return Observable.create(observer => {
      // this.searchSub$.unsubscribe();
      observer.next(true);
      observer.complete();
    });
  }

  activateContactStep() {
    let step = this.steps.find(item => item.name === 'contact');
    if (step.enabled) {
      this.getContactTypes();
      this.getContacts();
    } else {
      this.finalizeContactStep();
    }
  }

  createSignFromContact(contact: Contact) {
    let sig = new Signature();
    sig.legal_document = this.contract.id;
    sig.contact = contact.id;
    sig.name = this.functions.getContactFullName(contact);
    sig.email = typeof contact.default_email === 'string' ? contact.default_email : contact.emails[0].address;
    return sig;
  }


  finalizeContactStep() {

    this.onContactCheck();

    if (this.addingContact) {
      this.addNewContact()
        .subscribe((res: any) => {
          if (!!res) {
            this.addingContact = false;
            res._selected = true;
            this.contacts[0] = res;
            this.contract.contacts.push(res.id);
            this.save();
          }
        });
    } else {
      this.save();
    }
  }

  saveSignatures() {
    return this.signatureService.getList({legal_document: this.contract.id})
      .map(res => res.results.filter(sig => !sig.worker))
      .switchMap((signList: Signature[]) => {
        let selectedContacts = this.contacts.filter((contact: any) => contact._selected);
        let createSigns = selectedContacts
          .filter(contact => !signList.find(sign => sign.contact === contact.id))
          .filter(contact => {
            if (!contact.default_email) {
              this.flash.error(`Sorry! Contact "${contact.first_name} ${contact.last_name}" won't be added
                  as signee to contract due to empty email`);
              return false;
            }
            return true;
          });
        let deleteSigns = signList.filter(sign => !selectedContacts.find(contact => contact.id === sign.contact));

        return Observable.zip(
          ...createSigns.map(contact => this.signatureService.create(this.createSignFromContact(contact))),
          ...deleteSigns.map(sign => this.signatureService.delete(sign.id)),
          Observable.create(obs => {
            obs.next(true);
            obs.complete();
          }),
        );
      });
  }

  save() {
    let isNew = !this.contract.id;
    this.contractService.save(this.contract)
      .switchMap(res => {
        this.onContractCreate.next(res);
        this.flash.success(`Contract ${isNew ? 'created' : 'saved' } successfully`);
        this.contract = res;
        return this.saveSignatures();
      })
      .subscribe(() => {
        if (isNew) {
          this.contractService.checkForErrors(this.contract)
            .subscribe((errors: TemplateVariable[]) => {
              if (errors.length > 0) {
                this.activateErrorsStep();
              } else {
                this.modalClose(this.contract);
                this.goToContract(true);
              }
            });
        } else {
          this.modalClose(this.contract);

        }

      });
  }

  goToContract(skipErrors) {

    this.modalClose(this.contract);
    if (skipErrors) {
      setTimeout(() => {
        this.router.navigate(!!this.config.next ? this.config.next(this.contract.id) : ['/contracts', this.contract.id, 'send']);
      }, 300);
    } else {
      if (!!this.config.errorsNext) {
        let next = this.router.createUrlTree(this.config.errorsNext(this.contract.id)).toString();
        setTimeout(() => {
          this.router.navigate(['/contracts', this.contract.id], {queryParams: {next: next}});
        }, 300);
      } else {
        setTimeout(() => {
          this.router.navigate(['/contracts', this.contract.id]);
        }, 300);
      }

    }

  }


  onContactCheck() {
    setTimeout(() => {
      this.contract.contacts = this.contacts
        .filter((item: any) => item._selected)
        .map(item => item.id);
    });
  }

  activateTemplateStep() {
    this.isLoading = true;

    this.contractTemplateService.getList()
      .subscribe(res => {
        this.templates = res.results;
        this.showTemplateStep = this.templates.length !== 0;
        this.isLoading = false;
      });
  }

  activateErrorsStep() {

    // if (this.showOnErrors)
    //   this.modalService.showModal();
    this.currentStep = this.steps.find(step => step.name === 'errors');
    this.currentStep.enabled = true;
    this.showStepIndicator = false;
  }

  finalizeTemplateStep() {
    let selectedTemplate = this.templates.find(item => item.id === this.contract.template);
    this.contract.contents = selectedTemplate.contents;
    this.contract.title = selectedTemplate.name;
  }

  selectTempate(template: ContractTemplate) {
    this.contract.template = template.id;
  }

  getJobs() {
    setTimeout(() => {
      this.isLoading = true;
      let queryParams = this.jobFilter;
      this.jobService.getList(queryParams)
        .subscribe(res => {
          this.jobs = res.jobs;
          this.isLoading = false;
        });
    });

  }

  getJobTypes() {
    this.jobTypeService.getList()
      .map(res => res.results.map(item => ({value: item.id, label: item.name})))
      .subscribe(res => {
        this.jobTypes = [
          {
            value: '',
            label: 'All Job Types',
          },
          ...res
        ];
      });
  }

  nextStep(skip = false) {
    if (skip || this.canGoNext()) {
      let curStepIndex = this.steps.findIndex(item => item.name === this.currentStep.name);
      let curStep = this.steps[curStepIndex];
      let nextStep = curStepIndex < this.steps.length - 1 ? this.steps[curStepIndex + 1] : null;

      if (curStep.finalize) {
        let obs = curStep.finalize.bind(this)();
        if (obs) {
          obs.first().subscribe(res => {
            if (res) {
              if (nextStep)
                this.activateStep(nextStep.name);
            }
          });
        } else {
          if (nextStep)
            this.activateStep(nextStep.name);
        }
      } else {
        if (nextStep)
          this.activateStep(nextStep.name);
      }
    }
  }

  canGoNext() {
    if (this.currentStep.name === 'template') {
      return !!this.contract.template;
    } else if (this.currentStep.name === 'job') {
      return !!this.contract.job;
    } else if (this.currentStep.name === 'contact') {
      let newContactValid = true;
      let selectedContactsValid = this.contract.contacts && this.contract.contacts.length > 0;
      if (this.addingContact && (
        !this.newContact.first_name || !this.newContact.last_name || !this.newContact.email)) {
        newContactValid = false;
      }
      return this.addingContact && newContactValid || !this.addingContact && selectedContactsValid;
    }
    return true;
  }


  jobOrderingChange(item) {
    this.jobFilter.ordering = item.key;
    this.getJobs();
  }

  contactOrderingChange(item) {
    this.contactFilter.order = item.key;
    this.getContacts();
  }

  /**
   * Set parent component ref
   * @param {[type]} ref [reference od parent component object]
   */
  public setComponentRef(ref) {
    this.componentRef = ref;
  }

  /**
   * Function to close current choose contact modal.
   */
  public modalClose(contract?) {
    if (this.templateUpdateSub$) {
      this.templateUpdateSub$.unsubscribe();
    }
    if (contract) {
      this.dialog.close(contract);
    } else {
      this.dialog.dismiss();
    }
  }

  public addNewContact(): Observable<null | Contact> {
    return Observable.create(observer => {
      let newContact = {
        'first_name': this.newContact.first_name,
        'last_name': this.newContact.last_name,
        'account': 1,
        'emails': [{
          'address': this.newContact.email,
          'email_type': 1
        }]
      };
      this.isLoading = true;

      this.contactService.create(newContact)
        .subscribe(data => {
            this.flash.success('The contact has been created.');
            observer.next(data);
          },
          err => {
            this.flash.error('An error has occurred creating the contact, please try again later.');
            observer.next(null);
          },
          () => {
            this.isLoading = false;
            observer.complete();
          }
        );
    });


  }


  private watchTemplateChanges(template: ContractTemplate) {
    if (this.templateUpdateSub$) {
      this.templateUpdateSub$.unsubscribe();
    }

    this.templateUpdateSub$ = Observable
      .interval(2000)
      .timeInterval()
      .switchMap(() => this.contractTemplateService.get(template.id))
      .filter((newTemplate: ContractTemplate) => template.modified !== newTemplate.modified)
      .subscribe((newTemplate: ContractTemplate) => {
        let ind = _.findIndex(this.templates, {id: newTemplate.id});

        if (ind >= -1) {
          this.templates[ind] = newTemplate;
        }
        this.templateUpdateSub$.unsubscribe();
      });

  }

  private openTemplate(template) {
    let url = this.router.createUrlTree(['/settings/templates/contract', template.id]).toString();
    this.watchTemplateChanges(template);
    window.open(`/#${url}`, '_blank');
  }


}
