const appointment = require('../models/appointmentModel')
const service = require('../models/serviceModel')
const asyncHandler = require('express-async-handler')
const fs = require('fs')
const moment = require("moment")
const nbrAttr = 3

const  sortByTimeApp= (a, b)=>{
	if (a.time_appointment < b.time_appointment) {
    return -1;
  }
  if (a.time_appointment > b.time_appointment) {
    return 1;
  }
  return 0;
}

const  sortByTimeCreation= (a, b)=>{
	if (a.time_creation < b.time_creation) {
    return -1;
  }
  if (a.time_creation > b.time_creation) {
    return 1;
  }
  return 0;
}

function splitArray(array) {
  const result = [[],[],[],[],[]];
  for (let i = 0; i < array.length; i ++) {
    if(array[i].vehicule_type==="compact"){
    	result[0].push(array[i])
    }else if(array[i].vehicule_type==="class 2 truck"){
    	result[1].push(array[i])
    }else if(array[i].vehicule_type==="full-size"){
    	result[2].push(array[i])
    }else if(array[i].vehicule_type==="medium"){
    	result[3].push(array[i])
    }else if(array[i].vehicule_type==="class 1 truck"){
    	result[4].push(array[i])
    }
  }
  return result;
}

function splitArrayByDay(array) {
  const result = [];
  let currentDay = null;
  let currentChunk = [];

  array.forEach(item => {
    const itemDate = item.time_appointment
    const dateToCompare = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

    // Check if the day has changed
    if (currentDay === null || (dateToCompare.getFullYear() === currentDay.getFullYear() && dateToCompare.getMonth() === currentDay.getMonth() &&
    	dateToCompare.getDate() === currentDay.getDate())) {
      currentChunk.push(item);
      currentDay = dateToCompare;
    } else {
      result.push(currentChunk);
      currentChunk = [item];
      currentDay = dateToCompare;
    }
  });

  // Push the last chunk if it's not empty
  if (currentChunk.length > 0) {
    result.push(currentChunk);
  }

  return result;
}

const rejectAppointment = async(appointments) =>{

	const chunkedArrays = splitArray(appointments, 5);
	for(let i = 0; i < chunkedArrays.length; i++){
		chunkedArrays[i] = chunkedArrays[i].sort(sortByTimeApp)
	}
	for(let i = 0; i < chunkedArrays.length; i++){
		chunkedArrays[i] = splitArrayByDay(chunkedArrays[i])
	}
	for(let i = 0; i < chunkedArrays.length; i++){
		for(let j = 0; j < chunkedArrays[i].length; j++){
			chunkedArrays[i][j] = chunkedArrays[i][j].sort(sortByTimeCreation)
		}
	}
	const memoriseChosenApp = []
	const carsType = new Map([
  ["compact", 30],
  ["class 2 truck", 120],
  ["full-size", 30],
  ["medium", 30],
  ["class 1 truck", 60]
]);

	for(let i = 0; i < chunkedArrays.length; i++){
		for(let j = 0; j < chunkedArrays[i].length; j++){
			for(let k = 0; k < chunkedArrays[i][j].length; k++){
				

				if(memoriseChosenApp.length == 0){
					memoriseChosenApp.push(chunkedArrays[i][j][k])
					continue
				}
				var borneSuperior = moment(memoriseChosenApp[memoriseChosenApp.length -1].time_appointment).add(carsType.get(chunkedArrays[i][j][k].vehicule_type), 'm').toDate();
				var borneInferior = memoriseChosenApp[memoriseChosenApp.length -1].time_appointment
				if(borneSuperior >= chunkedArrays[i][j][k].time_appointment && borneInferior <= chunkedArrays[i][j][k].time_appointment ){
					chunkedArrays[i][j][k].isRejected = true
				}else if(chunkedArrays[i][j][k].time_appointment.getMonth() >= 10 && chunkedArrays[i][j][k].time_appointment.getMonth()<=11 && (chunkedArrays[i][j][k].time_appointment.getHours() >= 7 && chunkedArrays[i][j][k].time_appointment.getMinutes()>=0 && chunkedArrays[i][j][k].time_appointment.getSeconds() >=0) && chunkedArrays[i][j][k].time_appointment.getHours() < 19 ){
					chunkedArrays[i][j][k].isRejected = true
				}else{
					memoriseChosenApp.push(chunkedArrays[i][j][k])
				}
			}
		}
	}


	return chunkedArrays
}

const getAppointments = async(req, res) =>{
	try{
		const appointments = await appointment.find({})
		const newAppointment= await rejectAppointment(appointments)
		return res.status(200).json(newAppointment)

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