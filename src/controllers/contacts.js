import createHttpError from 'http-errors';
import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
  updateContact,
} from '../services/contacts.js';

export const getContactsController = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  } = req.query;

  const filters = { userId: req.user._id };
  if (type) filters.contactType = type;
  if (isFavourite !== undefined) filters.isFavourite = isFavourite === 'true';

  const result = await getAllContacts({
    page: Number(page),
    perPage: Number(perPage),
    sortBy,
    sortOrder,
    filters,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: result,
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId, req.user._id);
  if (!contact) throw createHttpError(404, 'Contact not found');

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const contact = await createContact({ ...req.body, userId: req.user._id });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact',
    data: contact,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await deleteContact(contactId, req.user._id);
  if (!contact) throw createHttpError(404, 'Contact not found');
  res.status(204).send();
};

export const patchContactController = async (req, res) => {
  const { contactId } = req.params;
  const updatedContact = await updateContact(contactId, req.body, req.user._id);
  if (!updatedContact) throw createHttpError(404, 'Contact not found');

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updatedContact,
  });
};
