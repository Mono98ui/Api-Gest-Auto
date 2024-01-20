require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
var cors = require('cors')
var serviceRoute = require('./routes/serviceRoute')

const MONGO_DB = process.env.MONGO_URL
const PORT = process.env.PORT

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get('/', (req, res)=>{
  res.send('Hello There')
})
app.use('/api/services',serviceRoute)


// Start the server
const server = app.listen(PORT, async () => {
  console.log(`Example app listening on port ${PORT}`)
  await mongoose.connect(MONGO_DB).then(()=>{
  console.log("Connectedto DB sucessfully")
  }).catch((error)=>{
  console.log(error)
  })
});

module.exports = server