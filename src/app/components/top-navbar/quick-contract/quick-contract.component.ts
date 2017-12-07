import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Contact } from '../../../models/contact';
import { ContactService } from '../../../services/contact/contact.service';
import { Observable } from 'rxjs';
import { JobService } from '../../../services/job/job.service';
import { Job } from '../../../models/job';
import { JobTypeService } from '../../../services/job-type/job-type.service';
import { JobType } from '../../../models/job-type';
import { ContractTemplateService } from '../../../services/contract-template/contract-template.service';
import { ContractTemplate } from '../../../models/contract-template.model';

import { BSModalContext } from 'single-angular-modal/plugins/bootstrap/index';

import { DialogRef, Modal, ModalComponent, overlayConfigFactory } from 'single-angular-modal';
import {
  ContractAddModalContext, ContractsAddModalComponent,
  modalConfig
} from '../../+contracts/contracts-add/contracts-add.component';
import { ContactSetOrCreateComponent } from '../../+contacts/contact-set-or-create/contact-set-or-create.component';

export class QuickContractWindowData extends BSModalContext {
  public job?: any;
}


@Component({
  selector: 'app-quick-contract',
  templateUrl: './quick-contract.component.html',
  styleUrls: [
    './quick-contract.component.scss'
  ],
  providers: [
    ContactSetOrCreateComponent,
    JobTypeService,
  ]
})
export class QuickContractComponent implements ModalComponent<QuickContractWindowData> {

  clientName: string = '';
  contact: Contact;
  form: FormGroup;
  clientSuggestions: Observable<string[]>;

  private jobName: string;
  private jobSuggestions: Observable<string[]>;
  private job: Job;
  private jobType: number;
  private jobInitialized: boolean = false;
  private isLoading: boolean = false;
  private showFormErrors: boolean = false;
  private jobTypes: JobType[] = [];
  private contractTemplates: any[] = [];
  private contractTemplate: ContractTemplate;
  private contractTemplateId: number;
  @ViewChild(ContactSetOrCreateComponent) private childContactSetOrCreateComponent: ContactSetOrCreateComponent;

  constructor(private fb: FormBuilder,
              private modal: Modal,
              private contactService: ContactService,
              private jobService: JobService,
              private jobTypeService: JobTypeService,
              private contractTemplateService: ContractTemplateService,
              public dialog: DialogRef<QuickContractWindowData>) {
    this.clientSuggestions = Observable
      .create((observer: any) => {
        observer.next(this.clientName);
      })
      .switchMap(value => this.contactService.searchContact(value))
      .map(data => (data.contacts || []).map(contact => {
        contact.full_name = `${contact.first_name} ${contact.last_name}`;
        return contact;
      }));

    this.jobSuggestions = Observable
      .create((observer: any) => {
        observer.next(this.jobName);
      })
      .switchMap(value => this.jobService.getList({search: value}))
      .map(data => (data.jobs || []));

  }

  ngOnInit() {
    this.isLoading = true;
    this.clearForm();
    this.job = this.dialog.context['job'];
    if (this.job) {
      this.jobInitialized = true;
      this.jobName = this.job.name;
      this.jobType = this.job.job_type;
    }
  }

  ngAfterViewInit() {
    this.initData();
  }

  initData() {
    Observable.forkJoin([
      this.getJobTypes(),
      this.contractTemplateService.getList(),
      this.childContactSetOrCreateComponent.initData()
    ]).finally(() => {
      this.isLoading = false;
    })
      .subscribe(([jobTypesResp, contractTemplatesResp, ...nill]: [JobType[], any, null]) => {
        this.jobTypes = [...jobTypesResp];
        this.contractTemplates = contractTemplatesResp['results'].filter(
          result => result.status !== 'archived');
      });
  }

  onJobSelect(selectedData) {
    this.job = selectedData.item;
    this.jobType = this.job.job_type;
  }

  clearForm() {
    this.jobName = '';
    this.jobType = null;
    this.job = null;
    this.clientName = '';
    this.contact = null;
    this.contractTemplate = null;
    this.contractTemplateId = null;
  }

  getJobTypes() {
    return this.jobTypeService.getList().map(
      res => res.results.map(item => ({value: item.id, label: item.name}))
    );
  }

  saveContact() {
    return Observable.create(observer => {
      this.childContactSetOrCreateComponent.getValue().subscribe((contactID) => {
          observer.next(contactID);
          observer.complete();
        }
      );
    });
  }

  saveJob(contactId: number | null) {
    return Observable.create(observer => {
      if (this.job) {
        observer.next(this.job);
        observer.complete();
      } else if (this.jobName) {
        this.jobService.create({
          name: this.jobName,
          job_type: this.jobType,
          external_owner: contactId
        }).subscribe(res => {
          observer.next(res);
          observer.complete();
        });
      } else {
        observer.next();
        observer.complete();
      }
    });
  }

  save() {
    this.saveContact().subscribe((contactId) => {
      this.saveJob(contactId).subscribe(job => {
        this.close();
        this.modal
          .open(ContractsAddModalComponent,
            overlayConfigFactory({
              contract: {
                contacts: [contactId],
                template: this.contractTemplate.id,
                contents: this.contractTemplate.contents,
                title: this.contractTemplate.name,
                job: job ? job.id : null
              },
              enabledSteps: [],
              showOnErrors: true
            }, ContractAddModalContext))
          .then(dialogRef => {
            dialogRef.result
              .then(result => {
                // Catching close event with result data from modal
                // console.log(result)
              })
              .catch(() => {
                // Catching dismiss event with no results
                // console.log('rejected')
              });
          });
      });
    });
  }


  valid() {
    return !!this.contractTemplate && this.childContactSetOrCreateComponent.isValid();
  }

  close() {
    this.dialog.dismiss();
    // On safari modal-open(which hide scrollbar) class not removed from body tag
    document.querySelector('body').classList.remove('modal-open');
  }

}
