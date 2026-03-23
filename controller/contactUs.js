const contactUsModel = require('../models/contactUs');
const { checkAccess } = require('../middleware/helperMiddleware')

const createContactUs = async (req, res) => {
  try {
    const { name, emailId, phone, message } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({
        message: "Name, phone and message are required"
      });
    }

    const contact = await contactUsModel.create({
      name,
      emailId,
      phone,
      message
    });

    return res.status(201).json({
      message: "Contact message submitted successfully",
      data: contact
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};
    
const getAllContactUs = async (req, res) => {
  try {
    if (!checkAccess(req, res, ["Admin"])) return;

    const contacts = await contactUsModel.find();

    return res.status(200).json({
      message: "All contact messages fetched successfully",
      data: contacts
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

const deleteContactUs = async (req, res) => {
  try {
    if (!checkAccess(req, res, ["Admin"])) return;

    const { contactId } = req.query;

    if (!contactId) {
      return res.status(400).json({
        message: "contactId is required in query"
      });
    }

    const contact = await contactUsModel.findById(contactId);
    if (!contact) {
      return res.status(404).json({
        message: "Contact not found"
      });
    }

    await contactUsModel.findByIdAndDelete(contactId);

    return res.status(200).json({
      message: "Contact deleted successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = { createContactUs, getAllContactUs, deleteContactUs }
