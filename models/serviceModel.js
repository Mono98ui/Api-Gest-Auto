const mongoose = require('mongoose')
const serviceSchema = new mongoose.Schema({
  type_car: {
    type: String,
    required: true,
  },
  time_service: {
    type: Number,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
})
module.exports = mongoose.model('Service', serviceSchema);