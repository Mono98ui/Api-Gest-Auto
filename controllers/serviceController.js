const service = require('../models/serviceModel')
const asyncHandler = require('express-async-handler')

const getServices = async(req, res) =>{
	try{
		const services = service.find({})
		res.status(200).send(services)

	}catch(err){
		res.status(500).send({error: err.message})
	}
}
module.exports = {getServices}