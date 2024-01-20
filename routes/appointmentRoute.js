const express = require('express')
const router = express.Router()
const multer = require('multer');
const{getAppointments, createAppointments} = require('../controllers/appointmentController')

router.get('/',getAppointments)

const storage = multer.diskStorage({
	  destination: (req, file, cb) => {
	    cb(null, 'upload/');
	  },
	  filename: (req, file, cb) => {
	    cb(null, Date.now() + '-' + file.originalname);
	  },
	});

	const upload = multer({ storage });

router.post('/', upload.single('file'),createAppointments)

module.exports = router
