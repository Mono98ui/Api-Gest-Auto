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

function splitArrayByVehiculeType(array) {
	const resultMap = new Map()
  for (let i = 0; i < array.length; i ++) {
    if(typeof resultMap.get(array[i].vehicule_type) === 'undefined'){
    	resultMap.set(array[i].vehicule_type,[array[i]])
    }else{
    	resultMap.get(array[i].vehicule_type).push(array[i])
    }
  }
  const result = Array.from(resultMap, ([name, value]) => (value));
  return result;
}

function splitArrayByDay(array) {

  const result = [];
  let currentDay = null;
  let currentChunk = [];
  array.forEach(item => {
    const itemDate = new Date(item.time_appointment)
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

function findCarType(arrayServices, carType){
	for(let i = 0; i < arrayServices.length; i++){
		if(arrayServices[i].type_car == carType){
			return arrayServices[i]
		}
	}
}
const rejectAppointment = async(appointments, services) =>{

	const chunkedArrays = splitArrayByVehiculeType(appointments);

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
	const listOfApp = []


	for(let i = 0; i < chunkedArrays.length; i++){
		for(let j = 0; j < chunkedArrays[i].length; j++){
			for(let k = 0; k < chunkedArrays[i][j].length; k++){
				

				if(memoriseChosenApp.length == 0){
					memoriseChosenApp.push(chunkedArrays[i][j][k])
					listOfApp.push(chunkedArrays[i][j][k])
					continue
				}

				var borneSuperior = moment(new Date(memoriseChosenApp[memoriseChosenApp.length -1].time_appointment)).add(findCarType(services, chunkedArrays[i][j][k].vehicule_type).time_service, 'm').toDate();
				var borneInferior = new Date(memoriseChosenApp[memoriseChosenApp.length -1].time_appointment)
				var currentDate = new Date(chunkedArrays[i][j][k].time_appointment)

				if(borneSuperior >= currentDate && borneInferior <= currentDate){

					chunkedArrays[i][j][k].isRejected = true

				}else if((borneSuperior.getMonth() < 10 || borneSuperior.getMonth()>11) && (borneSuperior.getHours() < 7 || (borneSuperior.getHours() >= 19 &&
					 borneSuperior.getMinutes()> 0 && borneSuperior.getSeconds() > 0) ) ){

					chunkedArrays[i][j][k].isRejected = true

				}else{

					memoriseChosenApp.push(chunkedArrays[i][j][k])

				}
				listOfApp.push(chunkedArrays[i][j][k])
			}
		}
	}


	return listOfApp
}

const getAppointments = async(req, res) =>{
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
		const services = await service.find({})
		const newAppointment= await rejectAppointment(newListAppointment, services)
		const newappointments = await appointment.create(newAppointment)
		fs.unlinkSync(`./upload/${req.file.filename}`)
		return res.status(200).json({message:"Appointments is created", appointement: newappointments})


	}catch(err){
		return res.status(500).json({error: err.message})
	}
}

module.exports = {getAppointments, createAppointments}