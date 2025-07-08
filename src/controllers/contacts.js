import {
  createContactService,
  getAllContactsService,
  getContactByIdService,
  updateContactService,
  deleteContactService,
  countContactsService,
} from '../services/contacts.js';
import createHttpError from 'http-errors';

export const getAllContactsController = async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;

  const [contacts, totalItems] = await Promise.all([
    getAllContactsService(userId, page, perPage),
    countContactsService(userId),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: {
      data: contacts.map(
        ({
          _id,
          name,
          phoneNumber,
          email,
          isFavourite,
          contactType,
          photo,
        }) => ({
          id: _id,
          name,
          phoneNumber,
          email,
          isFavourite,
          contactType,
          photo,
        }),
      ),
      page,
      perPage,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const contact = await getContactByIdService(contactId, userId);

  if (!contact) throw createHttpError(404, 'Contact not found');

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: {
      id: contact._id,
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      email: contact.email,
      isFavourite: contact.isFavourite,
      contactType: contact.contactType,
      photo: contact.photo,
    },
  });
};

export const createContactController = async (req, res) => {
  const userId = req.user?._id;
  const photo = req.file?.path || '';
  const newContact = await createContactService({ ...req.body, userId, photo });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: {
      id: newContact._id,
      name: newContact.name,
      phoneNumber: newContact.phoneNumber,
      email: newContact.email,
      isFavourite: newContact.isFavourite,
      contactType: newContact.contactType,
      photo: newContact.photo,
    },
  });
};

export const updateContactController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;

  if (req.file) {
    req.body.photo = req.file.path;
  }

  const updatedContact = await updateContactService(
    contactId,
    userId,
    req.body,
  );

  if (!updatedContact) throw createHttpError(404, 'Contact not found');

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: {
      id: updatedContact._id,
      name: updatedContact.name,
      phoneNumber: updatedContact.phoneNumber,
      email: updatedContact.email,
      isFavourite: updatedContact.isFavourite,
      contactType: updatedContact.contactType,
      photo: updatedContact.photo,
    },
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const deletedContact = await deleteContactService(contactId, userId);

  if (!deletedContact) throw createHttpError(404, 'Contact not found');

  res.status(204).send();
};
