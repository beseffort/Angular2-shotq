import { ValidatorFn, AbstractControl } from '@angular/forms';

export function EqualValidator(equal: string, reverse: boolean = false): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => {
    const value = control.value;
    const equalControl = control.root.get(equal);

    if (equalControl && equalControl.value !== value && !reverse) {
      return {validateEqual: false};
    }

    if (equalControl && equalControl.value === value && reverse) {
      delete equalControl.errors['validateEqual'];
      if (!Object.keys(equalControl.errors).length) equalControl.setErrors(null);
    }

    if (equalControl && equalControl.value !== value && reverse) {
      equalControl.setErrors({ validateEqual: false });
    }

    return null;
  };
}
