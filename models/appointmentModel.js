const mongoose = require('mongoose')
const appointmentSchema = new mongoose.Schema({
  time_creation: {
    type: Date,
    required: true,
  },
  time_appointment: {
    type: Date,
    required: true,
  },
  vehicule_type:{
    type: String,
    required: true,
  },
  isRejected:{
    type:Boolean,
    require:false,
    default:false
  }
})
module.exports = mongoose.model('Appointment', appointmentSchema);