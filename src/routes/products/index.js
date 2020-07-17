const express = require("express")
const db = require ("../../db")
const reviews = require("../reviews")
const multer = require("multer")
const fs = require("fs-extra")
const {join} = require("path")


const prodRouter = express.Router()

// get all products
prodRouter.get("/", async (req,res)=>{
   
    const response = await db.query('SELECT * FROM "products"')
   
    res.send(response.rows)
})

// get all products with filter, pagination
// prodRouter.get('/', async (req,res)=>{
//     const order = req.query.order || "asc"
//     const offset = req.query.offset || 0
//     const limit = req.query.limit|| 5

//     delete req.query.order
//     delete req.query.offset
//     delete req.query.limit

//     let query = 'SELECT * FROM "products"'
//     const params = []
//     for(queryParam in req.query){
//         params.push(req.query[queryParam])
//         if(params.length===1){
//             query += `WHERE ${queryParam} = $${params.length}`
//         }else{
//             query+= `AND ${queryParam} =$${params.length}`
//         }
//     }
//     query+= "ORDER BY Title" + order
//     params.push(limit)
//     query+= `LIMIT $${params.length } `
   
//     params.push(offset)
//     console.log(query)
//     const response = await db.query('SELECT * FROM "products"')
//     res.send(response.rows)
// })

// get a specific product
prodRouter.get('/:_id', async(req,res)=>{
    const response = await db.query(`SELECT _id,name,description,brand,"imageUrl",price,category,"createdAt","updatedAt" FROM "products" WHERE _id=$1`,
                                               [req.params._id])
      if (response.rowCount ===0)  {
          return res.status(404).send("not found")
      }   else{
          res.send(response.rows[0])
      }                                    

})

// update a specific product
prodRouter.put("/:_id", async (req, res)=> {
    try {
        let params = []
        let query = 'UPDATE "products" SET '
        for (bodyParamName in req.body) {
            query += 
                (params.length > 0 ? ", " : '') + 
                bodyParamName + " = $" + (params.length + 1) 

            params.push(req.body[bodyParamName]) 
        }

        params.push(req.params._id) 
        query += " WHERE _id = $" + (params.length) + " RETURNING *" 
        console.log(query)

        const result = await db.query(query, params) 
     
        if (result.rowCount === 0) 
            return res.status(404).send("Not Found")

        res.send(result.rows[0]) 
    }
    catch(ex) {
        console.log(ex)
        res.status(500).send(ex)
    }
})

// create a product
prodRouter.post('/', async(req,res)=>{
    const response = await db.query(`INSERT INTO "products"(name,description,brand,"imageUrl",price,category,"createdAt","updatedAt")
    values($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
      [req.body.name,req.body.description,req.body.brand,req.body.imageUrl,req.body.price,req.body.category,req.body.createdAt,req.body.updatedAt])
console.log(response)
res.send(response.rows[0])        
})

//delete product

prodRouter.delete('/:_id', async(req,res)=>{
    const response = db.query(`DELETE FROM "products" WHERE _id =$1`, [req.params._id])
    if((await response).rowCount=== 0){
        return res.status(404).send ("not found")
    }else{
        res.send('Deleted')
    }
})

// get reviews for a specific product
 prodRouter.get('/:_id/reviews', async(req,res)=>{
    const response = await db.query(`SELECT reviews._id,comment,rate,"productId",,price,reviews."createdAt FROM "reviews"
    JOIN "reviews" on products._id = "reviews"."productId"
    WHERE reviews._id = $1
    GROUP BY products._id
   `,[req.params._id]
    )
    res.send(response.rows)
 })

 // image upload
 const upload = multer({})
 const productFolderPath = join(__dirname, "./public/images")
 prodRouter.post("/upload",upload.single("avatar"),async(req,res)=>{
     try{
        await fs.writeFile(join(productFolderPath,req.file.originalname),req.file.buffer)
     }catch(error){
        res.send('error')
     }
 })




//  INSERT INTO products (name, description,brand, "imageUrl",price,category,"createdAt", "updatedAt")
// 	VALUES ('galaxy s5','very affordable','samsung','https://www.telia.se/dam/jcr:1e43df8f-b28e-41ad-8d7c-e0c673282a60/galaxys10_front_white-252x540.png','350','smartphones','now()','now()')







module.exports = prodRouter