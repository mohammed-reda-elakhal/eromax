const mongoose = require("mongoose");

// Define the NoteColis Schema
const NoteColisSchema = new mongoose.Schema({
    colis: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colis',
        required: true,  // Reference to the Colis model (required)
    },
    clientNote: {
        note: {
            type: String,  // The note or remark from the client
            required: function () {
                return this.client ? true : false;  // If clientId is provided, noteClient is required
            },
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',  // Track the user who created the note (Client)
            required: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,  // Timestamp for when the note was created
        },
    },
    livreurNote: {
        note: {
            type: String,  // The note or remark from the livreur
            required: function () {
                return this.livreur ? true : false;  // If livreurId is provided, noteLivreur is required
            },
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Livreur',  // Track the user who created the note (Livreur)
            required: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,  // Timestamp for when the note was created
        },
    },
    adminNotes: [{
        note: {
            type: String,  // The note or remark from the admin
            required: true,  // Admin note is required
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',  // Track the admin who created the note
            required: true,  // Admin reference is required
        },
        createdAt: {
            type: Date,
            default: Date.now,  // Timestamp for when the note was created
        },
    }]
}, { timestamps: true });

// Create the NoteColis model
const NoteColis = mongoose.model("NoteColis", NoteColisSchema);

module.exports = { NoteColis };
