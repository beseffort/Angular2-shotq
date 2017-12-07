import { Component,
  Directive,
  ComponentFactory,
  ComponentFactoryResolver,
  Input,
  ReflectiveInjector,
  ViewContainerRef,
  Output,
  EventEmitter,
  SimpleChanges,
  Compiler } from '@angular/core';

@Directive({
    selector: 'dynamic-modal-content',
})
export class DynamicModalContent {
  @Input('component') componentObject;
  @Input('moduleTemplate') moduleTemplate;
  @Input() modalRef;
  @Input() updateContent;
  @Output() updateChange = new EventEmitter();
  @Output() changeTemplate = new EventEmitter();
  @Output() closeModal = new EventEmitter();
  private viewRef;

  constructor(private vcRef: ViewContainerRef, private compiler: Compiler) {}

  ngOnChanges() {
    this.updateModalContent();
  }

  public updateModalContent() {
    // Add the component dynamically
    if (this.moduleTemplate !== undefined) {
      // Get dynamic module name and replace to get the template component name
      // in order to can find it inside of the ComponentFactory array
      let name = String(this.moduleTemplate.name);
      name = name.replace('Module', 'Component');
      this.compiler.compileModuleAndAllComponentsAsync(this.moduleTemplate)
        .then(moduleWithComponentFactory => {
          this.vcRef.clear();
          // get the proper componentFactory
          const compFactory = moduleWithComponentFactory.componentFactories
            .find(x => x.componentType.name === name);
          // Add dynamically the component to the View and get the created component instance
          const cmpRef: any = this.vcRef.createComponent(compFactory, 0).instance;
          // Check if the insance has the closeModal property, this is the eventEmitter that
          // that emits when the component want to be closed
          if (cmpRef.hasOwnProperty('closeModal')) {
            cmpRef.closeModal.subscribe(event => {
              this.modalRef.hide();
            });
          }
          // Emit the 'changeTemplate' event in order to alert that the template has changed
          this.changeTemplate.emit({instance: cmpRef});
      });
    }
  }
}
