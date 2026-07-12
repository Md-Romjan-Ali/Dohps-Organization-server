import { setServers } from "node:dns";
setServers(["8.8.8.8", "8.8.4.4"]);

import { Application, Request, Response } from "express";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
const app: Application = express()
const PORT = process.env.PORT || 5000

dotenv.config();
app.use(cors());
app.use(express.json())

const uri = process.env.MONGODB_URI as string
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const db = client.db('dohps')
        const successCollection = db.collection('success')
        app.post("/api/success", async (req, res) => {
            const corsur = req.body
            const result = await successCollection.insertOne(corsur)
            res.send(result)
        })
        app.get('/api/getsuccessdata', async (req, res) => {
            const result = await successCollection.find().toArray()
            res.send(result)
        })
        app.get('/api/getsuccessdata/:id', async (req, res) => {
            const { id } = req.params
            const query = { _id: new ObjectId(id) }
            const result = await successCollection.findOne(query)
            res.send(result)
        })
        app.delete('/api/deletesuccessdata/:id', async (req, res) => {
            const { id } = req.params
            const query = { _id: new ObjectId(id) }
            const result = await successCollection.deleteOne(query)
            res.send(result)
        })
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('hellow world')
})
app.listen(PORT, () => {
    console.log('this isdder side')
})