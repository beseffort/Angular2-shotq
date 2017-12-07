export class ValidationService {
  static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
    let config = {
      'required': 'Field is required.',
      'emailUniqueInvalid': 'This email is already in use.',
      'phone': 'Invalid phone number.',
      'minlength': `Minimum length is ${validatorValue.requiredLength} characters.`,
      'maxlength': `Max length is ${validatorValue.requiredLength} characters.`,
      'url': 'Invalid web address.',
      'email': 'Invalid email address.',
      validateEqual: 'Entered values do not match.'
    };

    return config[validatorName];
  }
}
