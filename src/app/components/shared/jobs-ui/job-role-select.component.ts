import * as _ from 'lodash';
import {
  Component, Input, forwardRef, ElementRef, EventEmitter, Output,
} from '@angular/core';
import { JobRole } from '../../../models/job-role';
import {
  NG_VALUE_ACCESSOR, NG_VALIDATORS, AbstractControl, ControlValueAccessor,
  Validator, ValidationErrors
} from '@angular/forms';
import { JobRoleService } from '../../../services/job-role/job-role.service';
import { AlertifyService } from '../../../services/alertify/alertify.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'job-role-select',
  templateUrl: './job-role-select.component.html',
  styleUrls: ['./job-role-select.component.scss'],
  host: {
    '(document:click)': 'onClick($event)',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JobRoleSelectComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => JobRoleSelectComponent),
      multi: true,
    }
  ]
})
export class JobRoleSelectComponent implements ControlValueAccessor, Validator {
  @Output() roleAdded = new EventEmitter<JobRole>();
  private _roles: JobRole[] = null;
  private isOpen: boolean = false;
  private value: any = JobRoleService.newObject();
  private isDisabled: boolean = false;

  @Input() get roles(): JobRole[] {
    return this._roles;
  }

  set roles(value: JobRole[]) {
    this._roles = value.slice();
    this.sortItems();
  }

  constructor(private _elementRef: ElementRef, private alertify: AlertifyService,
              private jobRoleService: JobRoleService) {
  }

  ngOnInit() {
  }

  writeValue(obj: any): void {
    this.value = obj ? JobRoleService.newObject(obj) : JobRole.Empty;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  validate(c: AbstractControl): ValidationErrors {
    return null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  private onChange = (obj: any) => { };
  private onTouched = (obj: any) => { };
  private onValidatorChange = (obj: any) => { };

  private onClick(event) {
    if (!this._elementRef.nativeElement.contains(event.target))
      this.isOpen = false;
  }

  //noinspection JSUnusedLocalSymbols
  private toggle() {
    this.isOpen = !this.isOpen;
  }

  private selectItem(value) {
    this.isOpen = false;
    if (value.id === this.value.id)
      return;
    this.value = value;
    if (_.isFunction(this.onChange))
      this.onChange(value);
  }

  private prompt() {
    let result = new Subject<string>();
    this.isOpen = false;
    this.alertify.prompt(
      'New role name', result.next.bind(result), result.complete.bind(result));
    return result;
  }

  //noinspection JSUnusedLocalSymbols
  private addNewRole() {
    this.prompt()
      .subscribe((result: string) => {
        let newRoleName = result.trim().toLocaleLowerCase();
        if (!newRoleName)
          return;
        let role: JobRole = _.find(this._roles,
            item => item.name.trim().toLocaleLowerCase() === newRoleName);
        if (!!role) {
          this.selectItem(role);
          return;
        }
        this.jobRoleService.create(
              JobRoleService.newObject({name: _.startCase(newRoleName)}))
          .subscribe(response => {
            role = JobRoleService.newObject(response);
            this._roles.push(role);
            this.sortItems();
            this.selectItem(role);
            this.roleAdded.emit(role);
          });
      });
  }

  private sortItems() {
    this._roles.sort((l, r) => l.name.localeCompare(r.name));
  }
}
