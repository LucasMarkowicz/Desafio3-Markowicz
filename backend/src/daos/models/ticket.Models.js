const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
  },
  purchase_datetime: {
    type: Date,
    default: Date.now,
  },
  purchaser: {
    type: String,
    required: true,
  },
  products: {
    type: Object,
    required: true,
  },
});

const Ticket = mongoose.model('ticket', ticketSchema);

module.exports = Ticket;
