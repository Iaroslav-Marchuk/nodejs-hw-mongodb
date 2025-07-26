import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: false,
    },

    isFavourite: {
      type: Boolean,
      required: false,
      default: false,
    },

    contactType: {
      type: String,
      enum: ['work', 'home', 'personal'],
      required: true,
      default: 'personal',
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },

  {
    timestamps: true,
    versionKey: false,
  },
);

export const ContactsCollection = mongoose.model('Contact', contactSchema);
