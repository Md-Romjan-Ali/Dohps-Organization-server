import { setServers } from "node:dns";
setServers(["8.8.8.8", "8.8.4.4"]);

import { Application, NextFunction, Request, Response } from "express";
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
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeaders = req.headers.authorization
    if (!authHeaders) {
        return res.status(404).send({ message: 'unAuthorized' })
    }
    const token = authHeaders.split(' ')[1]
    console.log(token, 'from backend');
    if (!token) {
        return res.status(404).send({ message: 'unAuthorized' })
    }
    next()

}
async function run() {
    try {
        await client.connect();
        const db = client.db('dohps')
        const successCollection = db.collection('success')
        app.post("/api/success", verifyToken, async (req, res) => {
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
        app.delete('/api/deletesuccessdata/:id', verifyToken, async (req, res) => {
            const { id } = req.params
            const query = { _id: new ObjectId(id as string) }
            const result = await successCollection.deleteOne(query)
            res.send(result)
        })
        app.patch('/api/updatesuccess/:id', verifyToken, async (req, res) => {
            const { id } = req.params
            const query = { _id: new ObjectId(id as string) }
            const update = req.body
            const result = await successCollection.updateOne(
                query,
                {
                    $set: update
                }
            )
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