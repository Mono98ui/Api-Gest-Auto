const express = require('express')
const router = express.Router()
const{getServices, createServices} = require('../controllers/serviceController')

router.get('/',getServices)
router.post('/',createServices)


module.exports = router
