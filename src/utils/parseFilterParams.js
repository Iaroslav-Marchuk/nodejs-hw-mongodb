function parseContactType(value) {
  if (typeof value !== 'string') return undefined;

  const isContactType = (contactType) =>
    ['work', 'home', 'personal'].includes(contactType);

  if (isContactType(value)) return value;
}

function parseIsFavourite(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function parseFilterParams(query) {
  const { type, isFavourite } = query;
  const parsedContactType = parseContactType(type);
  const parsedIsFavourite = parseIsFavourite(isFavourite);

  return {
    contactType: parsedContactType,
    isFavourite: parsedIsFavourite,
  };
}

export default parseFilterParams;
