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
    app.get("/availablefoods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await availableFoodCollection.findOne(query);
      res.send(result);
    });
    app.post("/request/food", async (req, res) => {
      const data = req.body;
      const result = await availableFoodCollection.insertOne(data);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
