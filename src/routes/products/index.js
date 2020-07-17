const express = require("express")
const db = require ("../../db")


const prodRouter = express.Router()

// get all products
prodRouter.get("/", async (req,res)=>{
   
    const response = await db.query('SELECT * FROM "products"')
   
    res.send(response.rows)
})
// get a specific product
prodRouter.get('/:_id', async(req,res)=>{
    const response = await db.query(`SELECT _id,name,description,brand,imageUrl,price,category,createdAt,updatedAt FROM "products" WHERE _id=$1`,
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

        // const result = await db.query(`UPDATE "Books" 
        //                             SET Category = $1,
        //                             Img = $2,
        //                             Title = $3,
        //                             Price = $4
        //                             WHERE ASIN = $5
        //                             RETURNING *`,
        //                             [ req.body.category, req.body.img, req.body.title, req.body.price, req.params.asin])
        
        if (result.rowCount === 0) //if no element match the specified _id=> 404
            return res.status(404).send("Not Found")

        res.send(result.rows[0]) //else, return the updated version
    }
    catch(ex) {
        console.log(ex)
        res.status(500).send(ex)
    }
})

// create a product
prodRouter.post('/', async(req,res)=>{
    const response = await db.query(`INSERT INTO "projects"(_id,name,description,brand,imageUrl,price,category,createdAt,updatedAt)
    values($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
      [req.body._id,req.body.name,req.body.description,req.body.brand,req.body.imageUrl,req.body.price,req.body.category,req.body.createdAt.req.body.updatedAt])
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





//  INSERT INTO products (name, description,brand, "imageUrl",price,category,"createdAt", "updatedAt")
// 	VALUES ('galaxy s5','very affordable','samsung','https://www.telia.se/dam/jcr:1e43df8f-b28e-41ad-8d7c-e0c673282a60/galaxys10_front_white-252x540.png','350','smartphones','now()','now()')







module.exports = prodRouter