import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';
import * as jQuery from 'jquery';
import 'slick-carousel';
import { Modal } from 'single-angular-modal/plugins/bootstrap';

import { BaseTemplateService } from '../../../services/base-template/base-template.service';
import { statusArchived } from './choices.constant';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';


@Component({
  selector: 'app-base-template-list',
  templateUrl: './base-template-list.component.html',
  styleUrls: ['./base-template-list.component.scss'],
})
export class BaseTemplateListComponent<ModelClass> {
  templateService: BaseTemplateService<any>;
  modelName = '';
  inlineMode: boolean = false;
  prependAddButton: boolean = false;
  statusArchived = statusArchived;

  templates: ModelClass[] = [];

  sliderContainerId = 'templateSider';
  isSliderReinitializing: boolean = false;

  private isLoading: boolean = false;
  private isArchived: boolean = false;

  private actions = [
    {
      id: 'template-clone',
      name: 'Duplicate',
      icon: 'icon-clone',
      title: 'Duplicate',
      active: (template) => template.status !== this.statusArchived
    },
    {
      id: 'template-archive',
      name: 'Archive',
      icon: 'icon-archive',
      title: 'Archive',
      active: (template) => template.status !== this.statusArchived
    },
    {
      id: 'template-unarchive',
      name: 'Restore',
      icon: 'icon-ic-export',
      title: 'Restore',
      active: (template) => template.status === this.statusArchived
    },
    {
      id: 'template-delete',
      name: 'Delete',
      icon: 'icon-trash',
      title: 'Delete',
      active: (template) => template.status === this.statusArchived
    },
    {
      id: 'template-edit',
      name: 'Edit Contact Template',
      icon: 'icon-edit',
      title: 'Edit',
      active: (template) => template.status !== this.statusArchived
    }
  ];

  constructor(public router: Router,
              public route: ActivatedRoute,
              public flash: FlashMessageService,
              public modal: Modal) {
  }

  ngOnInit() {
    this.getTemplates();
  }

  getTemplates() {
    let args = this.isArchived ? {'status': 'archived'} :
      {'status!': 'archived'};

    this.isLoading = true;
    if (this.inlineMode) {
      this.isSliderReinitializing = true;
      this.destroySlickSlider();
    }
    this.templateService.getList(args)
      .subscribe(
        this.extractTemplates.bind(this),
        error => console.error(error),
        () => this.isLoading = false
      );
  }

  extractTemplates(result): void {
    this.templates = result.results;
    this.initSlickSlider();
  }

  filterTemplates() {
    this.isArchived = !this.isArchived;
    this.getTemplates();
  }

  getSlidesContainer() {
    return jQuery(`#${this.sliderContainerId}`).find('.template-wrap');
  }

  initSlickSlider() {
    let $parentContainer = jQuery(`#${this.sliderContainerId}`),
      $slidesContainer = this.getSlidesContainer(),
      isSlickInit,
      slideNumber,
      options;

    if (!this.inlineMode) {
      return;
    }

    if (!this.templates.length) {
      this.destroySlickSlider();
      this.isSliderReinitializing = false;
      return;
    }

    isSlickInit = $slidesContainer.hasClass('slick-initialized');
    slideNumber = Math.round($slidesContainer.width() / 220);
    // If we show Add button, we need remember it takes place too (out of slider)
    slideNumber = this.isArchived ? slideNumber : slideNumber - 1;
    options = {
      infinite: false,
      autoplay: false,
      dots: true,
      appendDots: $parentContainer,
      arrows: true,
      appendArrows: $parentContainer,
      prevArrow: '<button class="slider__arr is-left"><i class="icon-right-arrow"></i></button>',
      nextArrow: '<button class="slider__arr is-right"><i class="icon-right-arrow"></i></button>',
      centerMode: false,
      draggable: false,
      useTransform: false,
      slidesToShow: slideNumber,
      slidesToScroll: slideNumber,
      slide: '.ttemplate-slide'
    };

    setTimeout(() => {
      if (!isSlickInit) {
        $slidesContainer.slick(options);
      } else {
        $slidesContainer.slick('unslick');
        $slidesContainer.slick(options);
      }
      this.isSliderReinitializing = false;
    });
  }

  destroySlickSlider() {
    if (!this.inlineMode) {
      return;
    }

    let $slidesContainer = this.getSlidesContainer(),
      isSlickInit = $slidesContainer.hasClass('slick-initialized');

    if (isSlickInit)
      $slidesContainer.slick('unslick');
  }

  removeTemplateFromList(template) {
    let index = this.templates.indexOf(template),
      $slidesContainer = this.getSlidesContainer();

    if (this.inlineMode) {
      $slidesContainer.slick('slickRemove', index);
    }

    this.templates.splice(index, 1);
  }

  addTemplateClick() {
    this.router.navigate(['../', 'add'], {relativeTo: this.route});
  }

  openTemplate(template) {
    this.router.navigate(['../', template.id], {relativeTo: this.route});
  }

  unarchiveTemplate(template) {
    this.isLoading = true;

    this.templateService.unarchive(template)
      .subscribe(
        (data) => {
          this.removeTemplateFromList(template);
          this.flash.success('The template has been successfully restored.');
        },
        error => {
          console.error(error);
          this.isLoading = false;
          this.flash.error('Error during restoring.');
        },
        () => this.isLoading = false
      );
  }

  archiveTemplate(template) {
    this.isLoading = true;

    this.templateService.archive(template)
      .subscribe(
        (data) => {
          this.removeTemplateFromList(template);
          this.flash.success('The template has been successfully archived.');
        },
        error => {
          console.error(error);
          this.isLoading = false;
          this.flash.error('Error during archiving.');
        },
        () => this.isLoading = false
      );
  }

  deleteTemplate(template) {
    this.isLoading = true;

    this.templateService.delete(template.id)
      .subscribe(
        () => {
          this.removeTemplateFromList(template);
          this.flash.success('The template has been successfully deleted.');
        },
        error => {
          console.error(error);
          this.isLoading = false;
          this.flash.error('Error during deleting.');
        },
        () => this.isLoading = false
      );
  }

  cloneTemplate(template) {
    this.isLoading = true;

    this.templateService.clone(template.id)
      .subscribe(
        (clone) => {
          let index = _.findIndex(this.templates, template);
          this.destroySlickSlider();
          this.templates.splice(index + 1, 0, clone);
          this.initSlickSlider();
          this.flash.success('The template has been successfully cloned.');
        },
        error => {
          console.error(error);
          this.isLoading = false;
          this.flash.error('Error during cloning.');
        },
        () => this.isLoading = false
      );
  }

  editTemplate(template) {
    this.router.navigate(['../', template.id], {relativeTo: this.route});
  }

  private confirmUnarchive(template) {
    this.modal
      .confirm()
      .isBlocking(true)
      .showClose(false)
      .title(`Restore ${template.name || template.title}?`)
      .dialogClass('modal-dialog modal-confirm')
      .body(`Are you sure you want to restore ${template.name || template.title}?`)
      .okBtn('Restore')
      .okBtnClass('btn btn_xs btn_blue pull-right')
      .cancelBtnClass('btn btn_xs btn_transparent')
      .open()
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.unarchiveTemplate(template);
          })
          .catch(() => {});
      });
  }

  private confirmArchive(template) {
    this.modal
      .confirm()
      .isBlocking(true)
      .showClose(false)
      .title(`Archive ${template.name || template.title}?`)
      .dialogClass('modal-dialog modal-confirm')
      .body(`Are you sure you want to archive ${template.name || template.title}?`)
      .okBtn('Archive')
      .okBtnClass('btn btn_xs btn_red pull-right')
      .cancelBtnClass('btn btn_xs btn_transparent')
      .open()
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.archiveTemplate(template);
          })
          .catch(() => {});
      });
  }

  private confirmClone(template) {
    this.modal
      .confirm()
      .isBlocking(true)
      .showClose(false)
      .title(`Duplicate ${template.name || template.title}?`)
      .dialogClass('modal-dialog modal-confirm')
      .body(`Are you sure you want to duplicate ${template.name || template.title}?`)
      .okBtn('Duplicate')
      .okBtnClass('btn btn_xs btn_blue pull-right')
      .cancelBtnClass('btn btn_xs btn_transparent')
      .open()
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.cloneTemplate(template);
          })
          .catch(() => {});
      });
  }

  private confirmDelete(template) {
    this.modal
      .confirm()
      .isBlocking(true)
      .showClose(false)
      .title(`Delete ${template.name || template.title}?`)
      .dialogClass('modal-dialog modal-confirm')
      .body(`Are you sure you want to delete ${template.name || template.title}?<br/>
        You will not be able to use this template once deleted.`)
      .okBtn('Delete')
      .okBtnClass('btn btn_xs btn_red pull-right')
      .cancelBtnClass('btn btn_xs btn_transparent')
      .open()
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.deleteTemplate(template);
          })
          .catch(() => {});
      });
  }

  /**
   * Function that handle template list single action.
   *
   * @param {Object} action  The object with available actions to handle.
   * @param {Object} template The object with template information.
   */
  private singleTemplateAction(action, template) {
    switch (action.id) {

      case 'template-archive':
        this.confirmArchive(template);
        break;

      case 'template-delete':
        this.confirmDelete(template);
        break;

      case 'template-edit':
        this.editTemplate(template);
        break;

      case 'template-unarchive':
        this.confirmUnarchive(template);
        break;

      case 'template-clone':
        this.confirmClone(template);
        break;

      default:
        break;
    }
  }


  /**
   * Function that handle category selection and refreshes template list .
   *
   * @param {Object} category The object with category information.
   */
  private selectCategory(category) {
    this.getTemplates();
  }

  private ngOnDestroy() {
    this.destroySlickSlider();
  }

}
