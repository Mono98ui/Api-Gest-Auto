const service = require('../models/serviceModel')
const asyncHandler = require('express-async-handler')

const getServices = async(req, res) =>{
	try{
		const services = await service.find({})
		return res.status(200).json(services)

	}catch(err){
		return res.status(500).json({error: err.message})
	}
}

const createServices = async(req, res) =>{
	try{
		const listServices = req.body
		for (let i = 0; i < listServices.length; i++) {
	  	const serviceFound = await service.findOne({type_car:listServices[i].type_car, 
	  		time_service:listServices[i].time_service,
	  		cost:listServices[i].cost})
	  	if(serviceFound){
	  		return res.status(404).json({message:"Services already existed"})
	  	}
		} 
		const services = await service.create(listServices)
		return res.status(200).json({message:"Services is created", services: listServices})

	}catch(err){
		return res.status(500).json({error: err.message})
	}
}
module.exports = {getServices, createServices}