const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const dotenv = require('dotenv')
const cors = require('cors');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
const app = express()
const port = 5000
dotenv.config()

app.use(cors())
app.use(express.json())

const uri = process.env.SERVER_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const JWKS = createRemoteJWKSet(
      new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)  

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization
    if (!token) {
       return res.status(401).json({ message: 'unauthoeized' })
    }
    const bearer = token.split(" ")[1]
    if(!bearer){
       return res.status(401).json({ message: 'unauthoeized' })
    }
    try{
        const { payload } = await jwtVerify(bearer, JWKS)
        console.log(payload)
        next()
    }catch{
        return res.status(401).json({message: 'unauthoeized'})
    }

}
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const database = client.db('wanderlust')
        const destinations = database.collection('destination')
        const bookingDatas = database.collection('bookingData')

        app.get('/destination', async (req, res) => {
            const cursor = destinations.find()
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get('/destination/:id', verifyToken, async (req, res) => {
            const { id } = req.params
            const result = await destinations.findOne({ _id: new ObjectId(id) })
            res.send(result)
        })
        app.post('/destination', async (req, res) => {
            const destinationData = req.body
            const result = await destinations.insertOne(destinationData)
            res.send(result)
            console.log(result)
        })
        app.patch('/destination/:id', async (req, res) => {
            const { id } = req.params
            const updateData = req.body
            const result = await destinations.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            )
            res.send(result)
            console.log(result)
        })
        app.delete('/destination/:id', async (req, res) => {
            const { id } = req.params
            const result = await destinations.deleteOne({ _id: new ObjectId(id) })
            res.send(result)
        })

        app.post('/booking',verifyToken, async (req, res) => {
            const bookingData = req.body
            const result = await bookingDatas.insertOne(bookingData)
            res.send(result)
            console.log(result)
        })
        app.get('/booking/:id',verifyToken, async (req, res) => {
            const { id } = req.params
            const result = await bookingDatas.find({ id }).toArray()
            res.send(result)
            console.log(result)
        })
        app.delete('/booking/:id', async (req, res) => {
            const { id } = req.params
            const result = await bookingDatas.deleteOne({ _id: new ObjectId(id) })
            res.send(result)
        })


        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// QdHD13A8a434shzf
// warderlust-project

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
