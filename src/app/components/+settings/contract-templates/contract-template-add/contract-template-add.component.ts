import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';

import { ContractTemplate } from '../../../../models/contract-template.model';
import { ContractTemplateService } from '../../../../services/contract-template/contract-template.service';
import { TemplateVariable } from '../../../../models/template-variable.model';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { CURRENT_PROFILE_ID } from '../../../../services/access/access.service';
import { TinymceComponent } from '../../../shared/tinymce-editor/tinymce-editor.component';
import { EmailTemplateAddComponent } from '../../email-templates/email-template-add/email-template-add.component';
import { EmailTemplatePreviewComponent } from '../../email-templates/email-template-preview/email-template-preview.component';


declare let tinymce: any;


@Component({
  selector: 'app-contract-template-add',
  moduleId: 'contractsAdd',
  templateUrl: './contract-template-add.component.html',
  styleUrls: ['./contract-template-add.component.scss'],

})
export class ContractTemplateAddComponent {
  @ViewChild('emailPreviewModal') emailPreviewModal: EmailTemplatePreviewComponent;
  @ViewChild('emailAddModal') emailAddModal: EmailTemplateAddComponent;

  @ViewChild(TinymceComponent) tinymceEditor: TinymceComponent;

  template: ContractTemplate | any = {};
  initialTemplate: ContractTemplate | any = {};
  tempContents: string = '';
  variablesList: TemplateVariable[] = [];
  isLoading: boolean = true;
  private noteBodyValue: string = '';

  constructor(private contractTemplateService: ContractTemplateService,
              private flash: FlashMessageService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    type routeParams = { id: string };
    this.route.params
      .switchMap((params: routeParams) => {
        if (params.id) {
          return this.contractTemplateService.get(parseInt(params.id, 10));
        } else {
          return Observable.create(observer => {
            observer.next({account: CURRENT_PROFILE_ID});
            this.isLoading = false;
            observer.complete();
          });
        }
      })
      .subscribe((template: ContractTemplate) => {
          this.isLoading = false;
          this.persistTemplate(template);
        },
        error => {
          let res = error.json();
          this.flash.error(res.detail || res.message);
          this.router.navigate(['/settings', 'templates', 'contract']);
        }
      );


    this.contractTemplateService.variables().subscribe((result) => {
      this.variablesList = result;
    });
  }

  persistTemplate(template: ContractTemplate) {
    this.template = template;
    this.initialTemplate = Object.assign({}, template);
    this.tempContents = template.contents;
  }

  save() {
    this.template.contents = this.tinymceEditor.getContents();
    this.isLoading = true;

    let method = !!this.template.id ? this.contractTemplateService.save : this.contractTemplateService.create;
    method.bind(this.contractTemplateService)(this.template)
      .subscribe((template: ContractTemplate) => {
        this.isLoading = false;
        this.persistTemplate(template);
        this.flash.success('Template saved successfully');
        this.router.navigate(['/settings', 'templates', 'contract']);
      }, error => {
        this.isLoading = false;
        this.flash.error('Error saving template');
      }, () => this.isLoading = false);
  }

  close() {
    this.router.navigate(['/settings', 'templates', 'contract']);
  }

  hasChanges() {
    this.template.contents = this.tinymceEditor.getContents();
    return (
      this.initialTemplate.name !== this.template.name ||
      this.initialTemplate.contents !== this.template.contents ||
      this.initialTemplate.contents !== this.tempContents
    );
  }

  onContentsChange(val: string) {
    this.tempContents = val;
  }
}
