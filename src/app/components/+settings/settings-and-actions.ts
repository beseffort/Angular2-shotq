const templatesActions = [
  {
    id: 'contracts',
    name: 'Contracts',
    linkTo: 'settings/templates/contract',
    icon: 'icon-contract-template-settings'
  },
  {
    id: 'proposals',
    name: 'Proposals',
    linkTo: 'settings/templates/proposal',
    icon: 'icon-proposals-templates-settings'
  },
  {
    id: 'emails',
    name: 'Emails',
    linkTo: 'settings/templates/email',
    icon: 'icon-email-template-settings'
  }
];

export const SettingsAndActions = [
  {
    id: 'account',
    name: 'Account',
    icon: 'icon-user-list',
    info: 'Edit your basic information, set your branding, and reset your password.',
    actions: [{
      id: 'user-profile',
      name: 'User Information',
      linkTo: 'settings/profile'
    },
    {
      id: 'company',
      name: 'Company Information',
      linkTo: 'settings/company'
    }],
    isOpen: false
  },
  // {
  //   id: 'billing',
  //   name: 'Plan & Billing',
  //   icon: 'icon-planbilling-settings',
  //   info: 'Review your ShootQ billing and subscription plan.',
  //   actions: [],
  //   isOpen: false
  // },
  // {
  //   id: 'calendar',
  //   name: 'Calendar & Email',
  //   icon: 'icon-cal-email-settings',
  //   info: 'Sync your calendar and email accounts to ShootQ.',
  //   actions: [],
  //   isOpen: false
  // },
  // {
  //   id: 'notifications',
  //   name: 'Notifications',
  //   icon: '',
  //   info: 'Manage your email and account notifications.',
  //   actions: [],
  //   isOpen: false
  // },
  {
    id: 'team',
    name: 'Team & User Roles',
    icon: 'icon-team-settings',
    info: 'View your team members, and manage their permissions.',
    linkTo: '/settings/team',
    isOpen: false
  },
  {
    id: 'jobs',
    name: 'Jobs',
    icon: 'md md-camera',
    info: 'Manage, edit, and create job types and job roles.',
    actions: [
      {
        id: 'job-types',
        name: 'Job Types',
        linkTo: 'settings/job-types',
        icon: ''
      },
      {
        id: 'job-roles',
        name: 'Job Roles',
        linkTo: 'settings/job-roles',
        icon: ''
      },
      {
        id: 'event-types',
        name: 'Event Types',
        linkTo: 'settings/event-types',
        icon: ''
      }
    ],
    isOpen: false
  },
  {
    id: 'templates',
    name: 'Templates',
    icon: 'icon-template',
    info: 'Manage, edit and create templates for emails, contracts, questionnaires and proposals.',
    actions: templatesActions,
    isOpen: false
  },
  // {
  //   id: 'workflow',
  //   name: 'Workflow & Automation',
  //   icon: 'icon-workflow',
  //   info: 'Setup automated task workflows for Sales, Jobs, and Products.',
  //   actions: [],
  //   isOpen: false
  // },
  {
    id: 'products-and-pricing',
    name: 'Products and Pricing',
    icon: 'icon-productspricing-settings',
    info: 'View your inventory of products and manage pricing and currency and taxes.',
    linkTo: '/settings/products/items',
    isOpen: false
  },
  {
    id: 'payment-and-invoices',
    name: 'Payments & Invoices',
    icon: 'icon-payment-settings',
    info: 'Manage your payment schedules, collection methods, tax settings and invoice settings.',
    linkTo: '/settings/payment-and-invoices',
    isOpen: false
  },
  // {
  //   id: 'contact',
  //   name: 'Contact Form',
  //   icon: 'icon-contact',
  //   info: 'Customize your lead contact form, and integrate your website contact form with ShootQ.',
  //   actions: [],
  //
  //   isOpen: false
  // }
];
