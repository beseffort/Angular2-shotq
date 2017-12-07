import * as _ from 'lodash';

export interface FilteredCategory {
  id?: number;
  name?: string;
  is_fake?: boolean;
  filter_params?: Object;
}

const allCategory: FilteredCategory = {
  id: 0,
  name: 'All',
  is_fake: true,
  filter_params: {status: 'active'}
};
const uncategorizedCategory: FilteredCategory = {
  id: -1,
  name: 'Uncategorized',
  is_fake: true,
  filter_params: {status: 'active', categories_count: 0}
};
const archivedCategory: FilteredCategory = {
  id: -2,
  name: 'Archived',
  is_fake: true,
  filter_params: {status: 'archived'}
};

export function addSpecialCategoriesAndFillFilters(response, countFieldName: string) {
  let categories = response.results;
  categories.forEach((c) => {
    c.is_fake = false;
    c.filter_params = {status: 'active', category: c.id};
  });

  let allCategoryInstance = _.cloneDeep(allCategory);
  allCategoryInstance[countFieldName] = response.stats.all_count;
  categories.unshift(allCategoryInstance);

  let uncategorizedCategoryInstance = _.cloneDeep(uncategorizedCategory);
  uncategorizedCategoryInstance[countFieldName] = response.stats.uncategorized;
  let archivedCategoryInstance = _.cloneDeep(archivedCategory);
  archivedCategoryInstance[countFieldName] = response.stats.archived;
  return categories.concat([uncategorizedCategoryInstance, archivedCategoryInstance]);
}
