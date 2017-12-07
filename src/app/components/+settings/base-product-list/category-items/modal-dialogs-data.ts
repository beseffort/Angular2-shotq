export const PRODUCT_CONFIRMATION_DATA = {
  archive: {
    body: '<p>Archived items and packages will be listed under the Archived category.</p>\
          <p>Once archived, items and packages can be permanently deleted unless they have been previously sold or presented in an online booking.</p>',
    action: 'CONFIRM'
  },
  continue: {
    body: '<p>Restored  items and packages will be show in their previous categories and under \'All\' section.<p>',
    action: 'CONFIRM'
  },
  delete: {
    body: '<p>Deleting items is a permanent action that cannot be reversed<p>\
          <p>Items and packages that have been previously sold or presented in an online booking cannot be permanently deleted. They will be archived instead</p>',
    action: 'CONFIRM'
  }
};
