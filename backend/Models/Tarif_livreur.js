// Tarif_livreur.js
const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const TarifLivreurSchema = new mongoose.Schema(
  {
    tarif: {
      type: Number,
      required: true,
      min: 0,
    },
    id_livreur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Livreur',
      required: true,
    },
    id_ville: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ville',
      required: true,
    },
  },
  { timestamps: true }
);

const TarifLivreur = mongoose.model('TarifLivreur', TarifLivreurSchema);

// Joi Validation for Create
const tarifLivreurValidation = (obj) => {
  const schema = Joi.object({
    tarif: Joi.number().min(0).required(),
    livreur: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/)
      .message('Invalid Livreur ID'),
    ville: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/)
      .message('Invalid Ville ID'),
  });
  return schema.validate(obj);
};

// Joi Validation for Update (all fields optional)
const tarifLivreurUpdateValidation = (obj) => {
  const schema = Joi.object({
    tarif: Joi.number().min(0).optional(),
    livreur: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .message('Invalid Livreur ID')
      .optional(),
    ville: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .message('Invalid Ville ID')
      .optional(),
  });
  return schema.validate(obj);
};

module.exports = {
  TarifLivreur,
  tarifLivreurValidation,
  tarifLivreurUpdateValidation,
};
