const express = require("express");
const dontenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dontenv.config();

const uri = process.env.MONGODB_URL;

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());





// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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

    const db = client.db("assignment9");
    const bookingCollection = db.collection("booking");

app.get("/booking", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.json(result);
    });
   
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
