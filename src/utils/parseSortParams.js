import { SORT_ORDER } from '../constants/index.js';

function parseSortBy(sortBy) {
  const keysOfContact = ['name'];

  if (keysOfContact.includes(sortBy)) return sortBy;
  return '_id';
}

function parseSortOrder(sortOrder) {
  const isKnownOrder = [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder);

  if (isKnownOrder) return sortOrder;
  return SORT_ORDER.ASC;
}

function parseSortParams(query) {
  const { sortBy, sortOrder } = query;

  const parsedSortBy = parseSortBy(sortBy);
  const parsedSortOrder = parseSortOrder(sortOrder);

  return {
    sortBy: parsedSortBy,
    sortOrder: parsedSortOrder,
  };
}

export default parseSortParams;
