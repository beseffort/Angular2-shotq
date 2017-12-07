export const BulkEnableActions = [
  {
    id: 'enable',
    name: 'Enable Selected',
  },
  {
    id: 'disable',
    name: 'Disable Selected',
  }
];

export const ExportActions = [
  {
    id: 'csv',
    name: 'Export CSV',
  },
  {
    id: 'vcard',
    name: 'Export vCard',
  }
];

export const SingleActions = {
  enabledContact: [
    {
      id: 'contacts-edit',
      name: 'Edit Contact',
      icon: 'icon-edit',
      title: 'Edit'
    },
    {
      id: 'disable',
      name: 'Disable Contact',
      icon: 'icon-disable-contact',
      title: 'Enable/Disable'
    },
  ],
  disabledContact: [
    {
      id: 'contacts-edit',
      name: 'Edit Contact',
      icon: 'fa fa-edit',
      title: 'Edit'
    },
    {
      id: 'enable',
      name: 'Enable Contact',
      icon: 'icon-disable-contact',
      title: 'Enable/Disable'
    },
  ]
};

export const ContactTypeActions = [
  {
    name: 'Prospect',
    href: '#'
  },
  {
    name: 'Lead',
    href: '#'
  },
  {
    name: 'Client',
    href: '#'
  },
  {
    name: 'Vendor',
    href: '#'
  },
  {
    name: 'Other',
    href: '#'
  }
];

export const NewContactButton = {
  name: 'Create New Contact',
  class: 'btn btn-success',
  href: '/contact/add',
  actions: [
    {
      id: 'csv',
      name: 'Import CSV',
    }
  ]
};

export const FilterOptions = [
  {
    id: 'all',
    value: 'all',
    name: 'All contacts',
    checked: true,
    active: true
  },
  {
    id: 'clients',
    value: 'clients',
    name: 'Clients',
    checked: false,
    active: true
  },
  {
    id: 'vendors',
    value: 'vendors',
    name: 'Vendors',
    checked: false,
    active: true
  },
  {
    id: 'role',
    value: 'role',
    name: 'By Role',
    checked: false,
    active: false
  },
  {
    id: 'referrers',
    value: 'referrers',
    name: 'Referrers',
    checked: false,
    active: true
  },
  {
    id: 'inactive',
    value: 'inactive',
    name: 'Inactive',
    checked: false,
    active: false
  },
  {
    id: 'last',
    value: 'last',
    name: 'Last Import',
    checked: false,
    active: false
  },
  {
    id: 'groups',
    value: 'groups',
    name: 'Groups',
    checked: false,
    active: false
  },
];
