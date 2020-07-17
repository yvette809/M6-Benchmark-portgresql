const express = require("express")
const db = require ("../../db")


const reviewsRouter = express.Router()

// get all reviews
reviewsRouter.get("/", async (req,res)=>{
   
    const response = await db.query('SELECT * FROM "reviews"')
   
    res.send(response.rows)
})
// get a specific review
reviewsRouter.get('/:_id', async(req,res)=>{
    const response = await db.query(`SELECT _id,comment,rate,productId,createdAt FROM "reviews" WHERE _id=$1`,
                                               [req.params._id])
      if (response.rowCount ===0)  {
          return res.status(404).send("not found")
      }   else{
          res.send(response.rows[0])
      }                                    

})

// update a specific review
reviewsRouter.put("/:_id", async (req, res)=> {
    try {
        let params = []
        let query = 'UPDATE "reviews" SET '
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

// create a review
reviewsRouter.post('/', async(req,res)=>{
    const response = await db.query(`INSERT INTO "reviews"(_id,comment,rate,productId,createdAt)
    values($1,$2,$3,$4,$5)
     RETURNING *`,
      [req.body._id,req.body.comment,req.body.rate,req.body.productId,req.body.createdAt])
console.log(response)
res.send(response.rows[0])        
})

//delete review

reviewsRouter.delete('/:_id', async(req,res)=>{
    const response = await db.query(`DELETE FROM "reviews" WHERE _id =$1`, [req.params._id])
    if(response.rowCount=== 0){
        return res.status(404).send ("not found")
    }else{
        res.send('Deleted')
    }
})


module.exports = reviewsRouter