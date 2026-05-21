const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
} = require("mongodb");

const {
  createRemoteJWKSet,
  jwtVerify,
} = require("jose-cjs");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
       "https://assignment-9-client-eosin.vercel.app",
    ],
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

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.BETTER_AUTH_URL}/api/auth/jwks`)
);



// VERIFY TOKEN
const verifyToken = async (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({
      message: "Unauthorized Access",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send({
      message: "Unauthorized Access",
    });
  }

  try {

    const { payload } = await jwtVerify(token, JWKS);

    req.user = payload;

    next();

  } catch (error) {

    return res.status(403).send({
      message: "Forbidden Access",
    });

  }
};




async function run() {

  try {

    const db = client.db("assignment9");

    const bookingCollection = db.collection("booking");

    const bookingsCollection = db.collection("bookings");



    

    app.post("/booking", verifyToken, async (req, res) => {

      const bookingData = req.body;

      const result = await bookingCollection.insertOne(
        bookingData
      );

      res.send(result);

    });



   

    app.get("/booking", async (req, res) => {

      try {

        const {
          search,
          amenity,
          floor,
          price,
          sort,
        } = req.query;

        let query = {};

        if (search) {
          query.name = {
            $regex: search,
            $options: "i",
          };
        }

        if (amenity) {
          query.amenities = {
            $in: [amenity],
          };
        }

        if (floor) {
          query.floor = floor;
        }

        let sortOption = {};

        if (sort === "newest") {
          sortOption = { _id: -1 };
        }

        if (sort === "oldest") {
          sortOption = { _id: 1 };
        }

        if (price === "low") {
          sortOption = { hourlyRate: 1 };
        }

        if (price === "high") {
          sortOption = { hourlyRate: -1 };
        }

        const rooms = await bookingCollection
          .find(query)
          .sort(sortOption)
          .toArray();

        res.send(rooms);

      } catch (error) {

        res.status(500).send({
          error: error.message,
        });

      }

    });



    

 app.get("/booking/my/:email", verifyToken, async (req, res) => {
  try {
    const email = req.params.email;

    console.log("URL EMAIL:", email);
    console.log("TOKEN EMAIL:", req.user.email);

    const result = await bookingCollection
      .find({ ownerEmail: email })
      .toArray();

    console.log("RESULT:", result);

    res.send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


    

    app.patch("/booking/:id", verifyToken, async (req, res) => {

      try {

        const id = req.params.id;

        const updatedRoom = req.body;

        const result = await bookingCollection.updateOne(
          {
            _id: new ObjectId(id),
            ownerEmail: req.user.email,
          },
          {
            $set: {
              name: updatedRoom.name,
              image: updatedRoom.image,
              floor: updatedRoom.floor,
              capacity: updatedRoom.capacity,
              hourlyRate: updatedRoom.hourlyRate,
              description: updatedRoom.description,
              amenities: updatedRoom.amenities,
            },
          }
        );

        res.send({
          success: true,
          message: "Room updated successfully",
          result,
        });

      } catch (error) {

        res.status(500).send({
          success: false,
          error: error.message,
        });

      }

    });



    

    app.delete("/booking/:id", verifyToken, async (req, res) => {

      try {

        const id = req.params.id;

        const result = await bookingCollection.deleteOne({
          _id: new ObjectId(id),
          ownerEmail: req.user.email,
        });

        res.send({
          success: true,
          message: "Room deleted successfully",
          result,
        });

      } catch (error) {

        res.status(500).send({
          success: false,
          error: error.message,
        });

      }

    });



  

    app.post("/bookings", verifyToken, async (req, res) => {
  const booking = req.body;

  const newBooking = {
    ...booking,
    ownerEmail: req.user.email, 
  };

  const result = await bookingsCollection.insertOne(newBooking);

  res.send({
    success: true,
    insertedId: result.insertedId,
  });
});



 

 app.get("/bookings", verifyToken, async (req, res) => {
  try {
    const email = req.user.email;

    const result = await bookingsCollection
      .find({ ownerEmail: email }) // IMPORTANT
      .toArray();

    res.send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});



    

    app.patch("/bookings/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;

    const result = await bookingsCollection.updateOne(
      {
        _id: new ObjectId(id),
        ownerEmail: req.user.email, // FIXED
      },
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

  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
});



    console.log("MongoDB Connected");

  } finally {

  }

}

run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});