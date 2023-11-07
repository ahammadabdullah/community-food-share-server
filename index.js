const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3500;
const app = express();
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.h7hr6qr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
app.get("/", async (req, res) => {
  res.send("server is running");
});
app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});

// {
//     "_id": "65484c59b6454146f1868ba8",
//     "foodImage": "https://cdn.discordapp.com/attachments/796439138403352596/1170901646067372092/635636837767888108-Pizza-crowd.png",
//     "foodName": "Pizza",
//     "donatorImage": "https://cdn.discordapp.com/attachments/796439138403352596/1170902707062718654/user-icon.png",
//     "donatorName": "John Doe",
//     "foodQuantity": 4,
//     "pickupLocation": "123 Main Street, Anytown, CA 91234",
//     "expiredDateTime": "2023-12-06",
//     "additionalNotes": "This pizza is still hot and fresh!",
//     "donerEmail": "doner@gmail.com",
//     "status": "available"
//   }
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const availableFoodCollection = client
      .db("community-food-service")
      .collection("availableFoodCollection");
    const requestedFoodCollection = client
      .db("community-food-service")
      .collection("requestedFood");
    app.get("/availablefoods", async (req, res) => {
      const { sort } = req.query;
      let result = [];
      if (sort) {
        result = await availableFoodCollection
          .find()
          .sort({ expiredDateTime: 1 })
          .toArray();
        res.send(result);
        return;
      }
      result = await availableFoodCollection.find().toArray();
      res.send(result);
    });
    app.get("/myfoods", async (req, res) => {
      const email = req.query.email;
      const query = { donerEmail: email };
      const result = await availableFoodCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/myfoods", async (req, res) => {
      const id = req.query.id;
      const query = { _id: new ObjectId(id) };
      const result = await availableFoodCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/availablefoods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await availableFoodCollection.findOne(query);
      res.send(result);
    });
    app.post("/request/food", async (req, res) => {
      const data = req.body;
      const result = await requestedFoodCollection.insertOne(data);
      res.send(result);
    });
    app.post("/addfood", async (req, res) => {
      const data = req.body;
      const result = await availableFoodCollection.insertOne(data);
      res.send(result);
    });
    app.put("/updatefood", async (req, res) => {
      const id = req.query.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedFood = {
        $set: {
          foodImage: data.foodImage,
          foodName: data.foodName,
          donatorImage: data.donatorImage,
          donatorName: data.donatorName,
          foodQuantity: data.foodQuantity,
          pickupLocation: data.pickupLocation,
          expiredDateTime: data.expiredDateTime,
          additionalNotes: data.additionalNotes,
          donerEmail: data.donerEmail,
          status: data.status,
        },
      };
      result = await availableFoodCollection.updateOne(filter, updatedFood);
      res.send(result);
    });
    app.get("/requestedfood", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { userEmail: email };
      const result = await requestedFoodCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/requestedfood", async (req, res) => {
      const id = req.query.id;
      const query = { _id: new ObjectId(id) };
      const result = await requestedFoodCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/managerequest", async (req, res) => {
      const foodName = req.query.foodName;
      const query = { foodName: foodName };
      const result = await requestedFoodCollection.find(query).toArray();
      res.send(result);
    });
    app.put("/requestedfood/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const data = req.body;
      const filter = { uid: id };
      const updatedData = {
        $set: {
          status: data.status,
        },
      };
      const priResult = await availableFoodCollection.updateOne(
        filter,
        updatedData
      );
      const result = await requestedFoodCollection.updateOne(
        filter,
        updatedData
      );

      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
