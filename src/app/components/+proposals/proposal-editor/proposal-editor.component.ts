import * as _ from 'lodash';
import { Observable, Subject, Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import {
  Component, ViewEncapsulation, OnInit, OnDestroy, AfterViewInit, ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';

import { Proposal } from '../../../models/proposal';
import { PackageTemplate, statusArchived } from '../../../models/package-template';
import { PackageCategory } from '../../../models/package-category';
import { Package } from '../../../models/package';
import { ProposalSettingTemplate } from '../../../models/proposal-setting-template';
import { JobService } from '../../../services/job/job.service';
import { PackageTemplateService } from '../../../services/product/package-template';
import { PackageCategoryService } from '../../../services/product/package-category';
import { PackageService } from '../../../services/product/package';
import { ProposalService } from '../../../services/proposal';
import { WorkerService } from '../../../services/worker/worker.service';
import { ProposalSettingTemplatesService } from '../../../services/proposal-setting-templates';
import { Worker } from '../../../models/worker';
import { PackagesFilter } from './packages-filter';
import { ContractTemplateService } from '../../../services/contract-template/contract-template.service';
import { ContractTemplate } from '../../../models/contract-template.model';
import { Contract } from '../../../models/contract';
import { ContractService } from '../../../services/contract/contract.service';
import { AlertifyService } from '../../../services/alertify/alertify.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { step } from '../../shared/step-indicator/step-indicator.component';
import { Modal, Overlay, overlayConfigFactory } from 'single-angular-modal';
import {
  ContractAddModalContext,
  ContractsAddModalComponent
} from '../../+contracts/contracts-add/contracts-add.component';

export const PROPOSAL_SETTINGS_FIELDS: string[] = [
  'merchant_account', 'pay_with_check', 'collect_manually',
  'expire_at', 'expire_type', 'expire_days'
];

@Component({
  selector: 'proposal-editor',
  templateUrl: './proposal-editor.component.html',
  styleUrls: ['./proposal-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProposalEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('saveSettingsModal') saveSettingsModal: ModalDirective;

  proposal: Proposal;
  tabActive: number;
  optionActive = 1;
  packageTemplates: PackageTemplate[] = [];
  packages: Package[] = [];
  packageCategories: PackageCategory[] = [];
  workers: Worker[];
  workerConflicts = [];
  contractTemplates: ContractTemplate[];
  contractTemplate: number;
  contractTemplateSearch = new FormControl();
  workerSearch = new FormControl();
  showSaveSettingsForm: boolean = false;
  showSavedSettings: boolean = false;
  settingsName: string = '';
  settingTemplates: ProposalSettingTemplate[] = [];
  settingsIsChanged: boolean = false;
  selectedSettingTemplate: ProposalSettingTemplate;
  currentPackageFilter: PackagesFilter;

  steps: step[] = [
    {
      name: 'package',
      title: 'Build a Package',
      options: {
        showFooter: () => this.proposal.packages.length > 0,
        nextButtonText: 'NEXT: SETTINGS',
      },
      valid: false,
      validate: () => this.proposal.packages.length > 0,
      activate: () => {
        this.currentPackageFilter = null;
      }
    },
    {
      name: 'settings',
      title: 'Settings',
      options: {
        subSteps: {
          schedule: false,
          expiration: false,
        },
        nextButton: () => !this.showSavedSettings,
        showFooter: () => this.optionActive === 4 || this.showSavedSettings,
        nextButtonText: 'NEXT: TEAM',
      },
      valid: false,
      validate: function () {
        let valid = true;
        for (let key in this.options.subSteps) {
          if (this.options.subSteps.hasOwnProperty(key)) {
            valid = this.options.subSteps[key];
            if (!valid)
              break;
          }
        }
        return valid;
      },
      activate: () => {
        this.updateShowSavedSettings();
      },
      finalize: (nextStep) => {
        if (this.settingsIsChanged) {
          this.saveSettings(null, nextStep);
          return false;
        }
        return true;
      }
    },
    {
      name: 'team',
      title: 'Team',
      options: {},
      valid: true,
      validate: () => true,
      activate: () => {
        this.loadWorkers();
      }
    },
    {
      name: 'contract',
      title: 'Contract',
      options: {
        nextButtonText: 'NEXT: SEND PROPOSAL',
      },
      valid: false,
      validate: () => !!this.proposal.contract,
      activate: () => {
        this.loadContractTemplates();
        if (this.proposal.contract_data) {
          this.contractTemplate = this.proposal.contract_data.template;
        }
      },
    },
  ];
  currentStep = this.steps[0];
  nextStep = new Subject<step | null>();

  constructor(private router: Router,
              private alertify: AlertifyService,
              private flash: FlashMessageService,
              private route: ActivatedRoute,
              private jobService: JobService,
              private packageTemplateService: PackageTemplateService,
              private packageService: PackageService,
              private workerService: WorkerService,
              private contractService: ContractService,
              private contractTemplateService: ContractTemplateService,
              private packageCategoryService: PackageCategoryService,
              private proposalService: ProposalService,
              private modal: Modal,
              private proposalSettingTemplatesService: ProposalSettingTemplatesService,
              private overlay: Overlay,
              private vcRef: ViewContainerRef) {
    overlay.defaultViewContainer = vcRef;

  }

  ngOnInit() {
    this.proposalService.settingsChanged.subscribe((changes) => {
      this.settingsIsChanged = true;
    });
    this.packageTemplateService
      .getList({'status!': statusArchived})
      .subscribe((result) => {
        this.packageTemplates = result.results;
      });
    this.packageService.getList().subscribe(result => {
      this.packages = result.results;
    });
    this.packageCategoryService.getList().subscribe((result) => {
      this.packageCategories = result.results;
    });
    this.route.params
      .switchMap((params: Params) => this.jobService.getOrCreateProposal(+params['id']))
      .subscribe((proposal: Proposal) => {
        this.proposal = proposal;
        this.validateSteps();
        this.settingsIsChanged = false;
        this.proposalSettingTemplatesService.getList().subscribe((templates: ProposalSettingTemplate[]) => {
          this.settingTemplates = templates;
          this.updateShowSavedSettings();
        });
      });
    this.contractTemplateSearch.valueChanges
      .distinctUntilChanged()
      .debounceTime(300)
      .subscribe((value: string) => {
        this.loadContractTemplates({search: value});
      });
    this.workerSearch.valueChanges
      .distinctUntilChanged()
      .debounceTime(300)
      .subscribe((value: string) => {
        this.loadWorkers(value);
      });
  }

  ngOnDestroy() {
    let body = document.getElementsByTagName('body')[0];
    body.classList.remove('openOldModal');
    body.classList.remove('openSummary');
    document.removeEventListener('click', this.toggleOpenClass);
  }

  ngAfterViewInit() {
    document.addEventListener('click', this.toggleOpenClass);
  }

  validateSteps() {
    this.steps = this.steps.map(step => {
      if (step.validate) {
        step.valid = step.validate();
      }
      return step;
    });
  }


  toggleOpenClass($event: any) {
    let hasClass = function (el, cls) {
      return el.className && new RegExp('(\\s|^)' + cls + '(\\s|$)').test(el.className);
    };
    let closestByClass = function (el, clazz) {
      while (!hasClass(el, clazz)) {
        el = el.parentNode;
        if (!el) {
          return null;
        }
      }
      return el;
    };
    let classList = $event.target.classList;
    if (classList.contains('toggleOpen')) {
      if (closestByClass($event.target, 'open')) {
        if (classList.contains('child')) {
          if ($event.target.parentElement.classList.contains('openChild')) {
            $event.target.parentElement.classList.remove('openChild');
          } else {
            if (document.querySelectorAll('.openChild').length > 0) {
              document.querySelector('.openChild').classList.remove('openChild');
            }
            $event.target.parentElement.classList.add('openChild');
          }
        } else {
          $event.target.parentElement.classList.remove('open');
        }
      } else {
        if (document.querySelectorAll('.open').length > 0) {
          document.querySelector('.open').classList.remove('open');
        }
        $event.target.parentElement.classList.add('open');
      }
    } else {
      if (closestByClass($event.target, 'open')) {
        // Do something
      } else {
        if (document.querySelectorAll('.open').length > 0) {
          document.querySelector('.open').classList.remove('open');
        }
      }
    }
  }

  openModalOld() {
    let body = document.getElementsByTagName('body')[0];
    body.classList.add('openOldModal');
  }

  showHide($event: any) {
    let classList = $event.target.classList;
    if (classList.contains('showBlock')) {
      $event.target.classList.remove('showBlock');
    } else {
      $event.target.classList.add('showBlock');
    }
  }


  changeOption($event: any, index) {
    let classList = $event.target.classList;
    if (!classList.contains('active')) {
      this.optionActive = index;
    }
  }

  openSummary() {
    let body = document.getElementsByTagName('body')[0];
    body.classList.add('openSummary');
  }

  closeSummary() {
    let body = document.getElementsByTagName('body')[0];
    body.classList.remove('openSummary');
  }

  filterPackages(filterParams: PackagesFilter) {
    this.currentPackageFilter = _.cloneDeep(filterParams);
    let params = {
      category: filterParams.category,
      search: filterParams.searchQuery,
      'status!': 'archived'
    };
    this.packageTemplateService.getList(params)
      .subscribe((result) => {
        this.packageTemplates = result.results;
      });
  }

  addPackageToProposal(packageTemplate: PackageTemplate) {
    this.proposalService.addPackage(this.proposal, packageTemplate)
      .subscribe((proposal) => {
        this.proposal = proposal;
        this.flash.success('Package added');
        this.validateSteps();
        if (packageTemplate.$openOnEdit) {
          let packageInstance = this.proposal.packages.find(
            p => p.template === packageTemplate.id);
          this.router.navigate(['edit-package', packageInstance.id], {relativeTo: this.route});
        }
      });
  }

  deletePackageFromProposal(packageInstance: Package) {
    this.packageService.delete(packageInstance.id).subscribe(() => {
      this.jobService.getOrCreateProposal(this.proposal.job.id).subscribe((proposal) => {
        this.proposal = proposal;

        this.flash.success('Package has been deleted');
        this.validateSteps();
      });
    });
  }

  updateProposalSettings(updates, nextOption) {
    let oldSettingsValues = _.pick(this.proposal, PROPOSAL_SETTINGS_FIELDS);
    this.proposal = _.assignIn(this.proposal, updates);
    let newSettingsValues = _.pick(this.proposal, PROPOSAL_SETTINGS_FIELDS);
    this.saveProposal().subscribe((proposal) => {
      if (_.isNumber(nextOption)) {
        this.optionActive = nextOption;
      }
      if (!_.isEqual(oldSettingsValues, newSettingsValues)) {
        this.proposalService.settingsChanged.next();
      }
    });
  }

  changeStep(directionData: { tab: number, option: number }) {
    if (directionData.tab === -1 && this.currentStep._index > 0) {
      this.nextStep.next(this.steps[this.currentStep._index - 1]);
    }
    this.optionActive = directionData.option;
  }

  switchToCustomSetting() {
    this.showSavedSettings = false;
  }

  updateSelectedSettingTemplate(template: ProposalSettingTemplate) {
    this.selectedSettingTemplate = template;
  }

  saveSettings(event?: MouseEvent, nextStep?: step) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.settingsIsChanged) {
      this.saveSettingsModal.show();
      jQuery('.modal-backdrop')[0].classList.add('modal-backdrop_grey');
      this.saveSettingsModal.onHidden.subscribe(() => {
        this.settingsName = '';
        this.showSaveSettingsForm = this.settingsIsChanged = false;
        this.nextStep.next(nextStep);
      });
    } else {
      this.nextStep.next(nextStep);
    }
  }

  saveSettingsAsTemplate() {
    if (this.settingsName) {
      this.proposalService.createSettings(this.proposal.id, this.settingsName).subscribe((settings) => {
        this.settingTemplates = this.settingTemplates.concat([settings]);
        this.saveSettingsModal.hide();
      });
    }
  }

  applySettings(tab: number) {
    this.proposalService.applySettings(this.proposal.id, this.selectedSettingTemplate.id).subscribe((proposal) => {
      this.proposal = proposal;
      this.updateShowSavedSettings();
      if (_.isNumber(tab)) {
        this.optionActive = tab;
      } else {
        this.nextStep.next();
      }
    });
  }

  private saveProposal() {
    let sub$ = this.proposalService.save(this.proposal).share();
    sub$.subscribe((proposal: Proposal) => {
      this.proposal = proposal;
      this.validateSteps();
    });
    return sub$;
  }

  private sendProposal() {
    this.saveProposal().subscribe(() => {
      this.router.navigate(['send'], {relativeTo: this.route});
    });
  }


  private loadWorkers(searchTerm: string = '') {
    let workers$ = this.workerService.getList({search: searchTerm})
      .map(res => res.results);
    let conflicts$ = this.jobService.getWorkerConflicts(this.proposal.job.id);

    Observable.zip(workers$, conflicts$)
      .first()
      .subscribe(([workers, conflicts]: [Worker[], any[]]) => {
        this.workers = workers;
        this.workers = this.workers.filter(w => w.job_role !== '');
        this.workers.map((worker: any) => {
          let conflict = conflicts.find(c => c.id === worker.id);
          worker.conflicts = !!conflict ? conflict.conflicts : [];
          worker.checked = this.proposal.workers.findIndex(wId => wId === worker.id) > -1;
        });
      });
  }

  private checkWorker(worker) {
    worker.checked = !worker.checked;
    this.proposal.workers = this.workers
      .filter((w: any) => w.checked)
      .map(w => w.id);
    this.saveProposal();
  }

  private loadContractTemplates(params?: Object) {
    this.contractTemplateService.getList(params)
      .first()
      .subscribe(res => {
        this.contractTemplates = res.results
          .filter(temp => temp.status !== 'archived');
      });
  }

  private selectContractTemplate(template: ContractTemplate) {
    if (this.proposal.contract_data) {
      this.alertify.confirm(
        `This will remove current contract from proposal.<br> Do you want to continue?`,
        () => {
          let contract = this.proposal.contract_data;
          this.contractService
            .delete(contract.id)
            .first()
            .subscribe(() => {
              this.createContract(template);
            });
        });
    } else {
      this.createContract(template);
    }
  }

  private createContract(template) {
    this._createContractInModal(template)
      // .map(data => data.instance)
      // .switchMap(compRef => compRef.onContractCreate)
      .subscribe((contract: Contract) => {
        this.proposal.contract = contract.id;
        this.contractTemplate = contract.template;
        this.proposal.contract_data = contract;
        this.saveProposal();
      });
  }

  private clearContract(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.proposal.contract_data) {
      this.alertify.confirm(
        `This will remove current contract from proposal.<br> Do you want to continue?`,
        () => {
          let contract = this.proposal.contract_data;
          this.contractService
            .delete(contract.id)
            .first()
            .subscribe(() => {
              this.proposal.contract = null;
              this.saveProposal();
            });
        });
    }
  }

  private _createContractInModal(template) {
    let contacts = [];
    if (this.proposal.job.external_owner) {
      contacts.push(this.proposal.job.external_owner.id);
    }
    return Observable.create(observer => {
      this.modal
        .open(ContractsAddModalComponent,
          overlayConfigFactory({
            contract: ContractService.newObject({
              contacts: contacts,
              template: template.id,
              contents: template.contents,
              title: this.proposal.job.name,
              job: this.proposal.job.id
            }),
            next: () => ['/jobs', this.proposal.job.id, 'proposal'],
            errorsNext: (contractId) => ['/jobs', this.proposal.job.id, 'proposal', 'send'],
            enabledSteps: [],
            showOnErrors: true
          }, ContractAddModalContext))
        .then(dialogRef => {
          dialogRef.result
            .then(result => {
              observer.next(result);
              observer.complete();
              // Catching close event with result data from modal
              // console.log(result)
            })
            .catch(() => {
              observer.error();
              // Catching dismiss event with no results
              // console.log('rejected')
            });
        });
    });

  }

  private openContract() {
    let params = {
      next: this.router.createUrlTree(
        ['/jobs', this.proposal.job.id, 'proposal', 'send']
      ).toString(),
      back: this.router.createUrlTree(['/jobs', this.proposal.job.id, 'proposal']).toString()

    };
    this.router.navigate(['/contracts', this.proposal.contract_data.id], {queryParams: params});
  }

  private updateShowSavedSettings() {
    if (this.currentStep.name !== 'settings') {
      this.selectedSettingTemplate = null;
    }
    this.showSavedSettings = this.proposal && !this.proposal.settings_edited && this.settingTemplates && this.settingTemplates.length > 0;
  }

  private onStepChange($event) {
    this.optionActive = 1;
    this.currentStep = $event;
    this.updateShowSavedSettings();
  }

  private settingsValid(key, valid) {
    let settingsStep = this.steps.find(step => step.name === 'settings');
    settingsStep.options.subSteps[key] = valid;
    this.validateSteps();
  }
}
