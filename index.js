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
    const bookingsCollection = db.collection("bookings");

   app.post("/booking", async (req, res) => {
      const bookingData = req.body;
      console.log(bookingData);
      const result = await bookingCollection.insertOne(bookingData);
      res.json(result);
    });

app.get("/booking/:email", async (req, res) => {

  const email = req.params.email;

  const query = {
    ownerEmail: email,
  };

  const result = await bookingCollection
    .find(query)
    .toArray();

  res.send(result);
});

    app.get("/booking", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.json(result);
    });

    

app.post("/bookings", async (req, res) => {
  try {
    const booking = req.body;

    if (!booking.date || !booking.time) {
      return res.status(400).send({ message: "Invalid data" });
    }

    const result = await bookingsCollection.insertOne(booking);

    res.send({
      success: true,
      message: "Booking saved successfully",
      insertedId: result.insertedId,
    });
  } catch (err) {
    res.status(500).send({ success: false, error: err.message });
  }
});
app.get("/bookings", async (req, res) => {
      const result = await bookingsCollection.find().toArray();
      res.json(result);
    });


const { ObjectId } = require("mongodb");

app.delete("/booking/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await bookingCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send({
      success: true,
      message: "Booking deleted",
      result,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      error: err.message,
    });
  }
});



app.patch("/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await bookingsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "cancelled",
        },
      }
    );

    res.send({
      success: true,
      message: "Booking cancelled",
      result,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      error: err.message,
    });
  }
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