const appointment = require('../models/appointmentModel')
const asyncHandler = require('express-async-handler')
const fs = require('fs')
const nbrAttr = 3

const getAppointments = async(req, res) =>{
	//const dateNoGreater = req.query.dateBefore
	try{
		const appointments = await appointment.find({})
		return res.status(200).json(appointments)

	}catch(err){
		return res.status(500).json({error: err.message})
	}
}

const createAppointments = async(req, res) =>{
	try{

		if (!req.file) {
    	return res.status(400).json({ error: 'No file uploaded' });
  	}
  	let newListAppointment = []
		let data= fs.readFileSync( `./upload/${req.file.filename}`, 'utf-8')
		const listAppointments = data.toString().split("\r\n")
		for (let i =0; i < listAppointments.length; i ++){
			appoint = listAppointments[i].split(",")
			if(appoint.length == nbrAttr){
	  		newListAppointment.push({time_creation:appoint[0],
			  time_appointment:appoint[1],
			  vehicule_type:appoint[2]})
			}
		}
		const newappointments = await appointment.create(newListAppointment)
		fs.unlinkSync(`./upload/${req.file.filename}`)
		return res.status(200).json({message:"Appointments is created", appointement: newappointments})


	}catch(err){
		return res.status(500).json({error: err.message})
	}
}

module.exports = {getAppointments, createAppointments}