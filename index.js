const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = process.env.URL;

console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("online_food");
    const itemsCollection = database.collection("items");

    // ADDING FOOD
    app.post("/addItem", (req, res) => {
      const _id = req.body._id;
      const foodName = req.body.foodName;
      const description = req.body.description;
      const image = req.body.image;

      itemsCollection
        .insertOne({ _id, foodName, description, image })
        .then((result) => {
          res.send(result.insertedCount > 0);
        });
    });

    //GET items API
    app.get("/items", async (req, res) => {
      const cursor = itemsCollection.find({});
      const items = await cursor.toArray();

      res.send({ items });
    });

    // Use POST API
    app.post("/items", async (req, res) => {
      const keys = req.body;
      const query = { key: { $in: keys } };
      const items = await itemsCollection.find(query).toArray();
      //   res.send(items);
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });
    // Use POST to get data by keys
    app.post("/items/byKeys", async (req, res) => {
      const keys = req.body;
      const query = { key: { $in: keys } };
      const items = await itemsCollection.find(query).toArray();
      res.send(items);
    });

    // Add Orders API
    app.post("/items", async (req, res) => {});
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Food Zonous server is running");
});

app.listen(port, () => {
  console.log("Server running at port", port);
});
