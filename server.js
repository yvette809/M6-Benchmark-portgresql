const express = require("express")
const db = require ('./src/db')
const prodRouter = require('./src/routes/products')
const cors = require("cors")
const dotenv = require("dotenv")
const reviewsRouter = require("./src/routes/reviews")

dotenv.config()


const server = express()
server.use(cors())
server.use(express.json())
const port = process.env.PORT || 3005


server.use('/products', prodRouter)
 server.use('/reviews',reviewsRouter)



server.listen(port, ()=>{
    console.log(`server running on port ${port}`)
})