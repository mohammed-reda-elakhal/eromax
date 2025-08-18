const mongoose = require('mongoose');
const Joi = require('joi');

// Define the status enum
const WITHDRAWAL_STATUS = {
    WAITING: 'waiting',           // Initial state when user creates withdrawal
    SEEN: 'seen',                 // Admin has seen the request
    CHECKING: 'checking',         // Admin is reviewing the request
    ACCEPTED: 'accepted',         // Admin approved the request
    REJECTED: 'rejected',         // Admin rejected the request
    PROCESSING: 'processing',     // Payment is being processed
    DONE: 'done'                  // Withdrawal completed successfully
};

// Status History Schema
const StatusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        enum: Object.values(WITHDRAWAL_STATUS),
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    note: {
        type: String,
        trim: true
    }
});

// Withdrawal Schema
const WithdrawalSchema = new mongoose.Schema({
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payement',
        required: true
    },
    montant: {
        type: Number,
        required: true,
        min: 0
    },
    frais: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: Object.values(WITHDRAWAL_STATUS),
        default: WITHDRAWAL_STATUS.WAITING,
        required: true
    },
    statusHistory: [StatusHistorySchema],
    verment_preuve: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png",
            publicId: null,
        }
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
WithdrawalSchema.index({ wallet: 1, status: 1 });
WithdrawalSchema.index({ payment: 1 });
// Prevent duplicate active withdrawals (waiting/seen/checking/accepted/processing) for same wallet+payment+montant
WithdrawalSchema.index(
    { wallet: 1, payment: 1, montant: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: { $in: [
                WITHDRAWAL_STATUS.WAITING,
                WITHDRAWAL_STATUS.SEEN,
                WITHDRAWAL_STATUS.CHECKING,
                WITHDRAWAL_STATUS.ACCEPTED,
                WITHDRAWAL_STATUS.PROCESSING
            ] }
        }
    }
);

// Create the model
const Withdrawal = mongoose.model('Withdrawal', WithdrawalSchema);

// Joi Validation Schema
function validateWithdrawal(obj) {
    const schema = Joi.object({
        wallet: Joi.string().required(),
        payment: Joi.string().required(),
        montant: Joi.number().min(0).required(),
        frais: Joi.number().min(0).required(),
        status: Joi.string().valid(...Object.values(WITHDRAWAL_STATUS)),
        verment_preuve: Joi.object({
            url: Joi.string(),
            public_id: Joi.string()
        })
    });
    return schema.validate(obj);
}

module.exports = {
    Withdrawal,
    validateWithdrawal,
    WITHDRAWAL_STATUS
};