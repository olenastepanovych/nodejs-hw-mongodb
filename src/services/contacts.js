import { Contact } from '../db/models/contact.js';

export const getAllContactsService = async (userId, page, perPage) => {
  const skip = (page - 1) * perPage;
  return Contact.find({ userId }).skip(skip).limit(perPage);
};

export const countContactsService = async (userId) => {
  return Contact.countDocuments({ userId });
};

export const getContactByIdService = async (id, userId) => {
  return Contact.findOne({ _id: id, userId });
};

export const createContactService = async (contactData) => {
  return Contact.create(contactData);
};

export const updateContactService = async (id, userId, updateData) => {
  return Contact.findOneAndUpdate({ _id: id, userId }, updateData, {
    new: true,
  });
};

export const deleteContactService = async (id, userId) => {
  return Contact.findOneAndDelete({ _id: id, userId });
};
