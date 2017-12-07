import * as _ from 'lodash';

export const OWNER = 'owner';
export const ADMIN = 'admin';
export const MANAGER = 'manager';
export const CONTRACTOR = 'contractor';
export const EMPLOYEE = 'employee';

export const OWNER_CHOICE = {value: OWNER, label: 'Owner', description: ''};
export const ADMIN_CHOICE = {value: ADMIN, label: 'Admin', description: ''};
export const MANAGER_CHOICE = {value: MANAGER, label: 'Studio Manager', description: "Has access to most ShootQ settings,but can't view or alter billing/subscription settings."};
export const CONTRACTOR_CHOICE = {value: EMPLOYEE, label: 'Employee', description: 'Restricted access to settings. Can view shoots and manage relationships.'};
export const EMPLOYEE_CHOICE = {value: CONTRACTOR, label: 'Contractor', description: 'TBD'};

export const NO_ROLE = '';
export const PHOTOGRAPHER = 'photographer';
export const VIDEOGRAPHER = 'videographer';
export const CUSTOMIZE = 'customize';

export const NO_ROLE_CHOICE = {value: NO_ROLE, label: 'No role'};
export const PHOTOGRAPHER_CHOICE = {value: PHOTOGRAPHER, label: 'Photographer'};
export const VIDEOGRAPHER_CHOICE = {value: VIDEOGRAPHER, label: 'Videographer'};
export const CUSTOMIZE_CHOICE = {value: CUSTOMIZE, label: 'Customize...'};

export const roleChoices = [
  ADMIN_CHOICE,
  MANAGER_CHOICE,
  CONTRACTOR_CHOICE,
  EMPLOYEE_CHOICE,
];

export const roleChoicesAll = _.concat(_.clone(roleChoices), OWNER_CHOICE);

export const jobRoleChoices = [
  NO_ROLE_CHOICE,
  PHOTOGRAPHER_CHOICE,
  VIDEOGRAPHER_CHOICE,
  CUSTOMIZE_CHOICE,
];
