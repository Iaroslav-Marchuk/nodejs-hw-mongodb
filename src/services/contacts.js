import { ContactsCollection } from '../models/contactModel.js';
import calculatePaginationData from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page,
  perPage,
  sortBy,
  sortOrder,
  filter,
  userId,
}) => {
  const limitValue = perPage;
  const skipValue = page > 0 ? (page - 1) * perPage : 0;

  const contactQuery = ContactsCollection.find({ userId });

  if (filter.contactType) {
    contactQuery.where('contactType').equals(filter.contactType);
  }

  if (filter.isFavourite !== undefined) {
    contactQuery.where('isFavourite').equals(filter.isFavourite);
  }

  const [totalCount, contacts] = await Promise.all([
    ContactsCollection.find().merge(contactQuery).countDocuments(),

    contactQuery
      .sort({ [sortBy]: sortOrder })
      .skip(skipValue)
      .limit(limitValue),
  ]);

  const paginationData = calculatePaginationData(totalCount, page, perPage);

  return { data: contacts, ...paginationData };
};

export const getContactById = async ({ contactId, userId }) => {
  const contact = await ContactsCollection.findOne({ _id: contactId, userId });
  return contact;
};

export const createContact = async (payload) => {
  const contact = await ContactsCollection.create(payload);
  return contact;
};

export const updateContact = async ({ contactId, userId }, payload) => {
  const contact = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    { new: true },
  );
  return contact;
};

export const deleteContact = async ({ contactId, userId }) => {
  const contact = await ContactsCollection.findOneAndDelete({
    _id: contactId,
    userId,
  });
  return contact;
};
