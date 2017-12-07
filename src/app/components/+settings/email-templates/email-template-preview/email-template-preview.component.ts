import { Component, EventEmitter, ViewChild, Output } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap';

import { EmailTemplate } from '../../../../models/email-template.model';
import { EmailTemplateService } from 'app/services/email-template';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { TemplateVariable } from '../../../../models/template-variable.model';
import { TemplateVariableService } from '../../../../services/template-variable/template-variable.service';


@Component({
  selector: 'app-email-template-preview',
  templateUrl: './email-template-preview.component.html',
  styleUrls: ['./email-template-preview.component.scss'],
})
export class EmailTemplatePreviewComponent {
  @ViewChild('modal') modal: ModalDirective;
  @ViewChild('confirmModal') confirmModal: ConfirmDialogComponent;

  @Output('createConfirmed') createConfirmed = new EventEmitter();

  isLoading: boolean = false;
  isContactsActive: boolean = false;

  template: EmailTemplate;
  variants: EmailTemplate[] | any = undefined;
  tempContents: string = '';
  variablesList: TemplateVariable[] = [];
  selectedTemplate: Object;

  constructor(private templateService: EmailTemplateService) {
  }

  ngOnInit() {
    this.templateService
      .listGet('variables')
      .subscribe((result) => {
        this.variablesList = result;
      });
  }

  initTemplates() {
    this.isLoading = true;
    this.templateService
      .getList({short: true, ordering: 'name', status: 'draft'})
      .subscribe(
        (result) => {
          this.isLoading = false;
          this.variants = result.results;
          if (this.variants.length === 0) {
            this.initConfirmModal();
            this.confirmModal.show();
            return;
          }
          this.modal.show();
        },
        (errors) => {
          this.isLoading = false;
          console.error(errors);
        },
        () => this.isLoading = false
      );
  }

  loadTemplate(templateId) {
    if (!templateId) {
      this.template = undefined;
      return;
    }

    this.isLoading = true;
    this.templateService
      .get(templateId)
      .subscribe(
        (template) => {
          this.template = template;
          this.tempContents = template.contents;
          this.isLoading = false;
        },
        (errors) => {
          this.isLoading = false;
          console.error(errors);
        },
        () => this.isLoading = false
      );
  }

  onContentsChange(val: string) {
    this.tempContents = val;
  }

  show() {
    this.initTemplates();
  }

  hide() {
    this.modal.hide();
  }

  toggleContacts() {
    this.isContactsActive = !this.isContactsActive;
  }

  initConfirmModal() {
    this.confirmModal.title = 'Create Email Template?';
    this.confirmModal.body = 'You do not have any email templates. ' +
      'Would you like to create a new email template?';
    this.confirmModal.action = 'Ok';
  }

  onConfirmed() {
    this.createConfirmed.emit();
  }
}
