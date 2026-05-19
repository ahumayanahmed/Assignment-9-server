const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

const uri = process.env.MONGODB_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("assignment9");

    const bookingCollection = db.collection("booking");
   app.post("/booking", async (req, res) => {
      const bookingData = req.body;
      console.log(bookingData);
      const result = await bookingCollection.insertOne(bookingData);
      res.json(result);
    });

app.get("/booking/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const query = {
      ownerEmail: email,
    };

    const result = await bookingCollection
      .find(query)
      .toArray();

    res.send(result);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Failed to fetch data",
    });
  }
});

    app.get("/booking", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.json(result);
    });

    

    await client.db("admin").command({ ping: 1 });

    console.log("MongoDB Connected");
  } finally {
  }
}

run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});