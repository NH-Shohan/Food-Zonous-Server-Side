const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = process.env.URL;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("online_food");
    const itemsCollection = database.collection("items");
    const orderCollection = database.collection("orders");

    // ADDING FOOD
    app.post("/addItem", (req, res) => {
      const foodName = req.body.foodName;
      const description = req.body.description;
      const image = req.body.image;

      itemsCollection
        .insertOne({ foodName, description, image })
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
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(items, result);
    });
    // Use POST to get data by keys
    app.post("/items/byKeys", async (req, res) => {
      const keys = req.body;
      const query = { key: { $in: keys } };
      const items = await itemsCollection.find(query).toArray();
      res.send(items);
    });

    // ADDING Food to database
    app.post("/addOrders", (req, res) => {
      const name = req.body.name;
      const email = req.body.email;
      const address = req.body.address;
      const number = req.body.number;
      const message = req.body.message;
      const itemName = req.body.itemName;

      orderCollection
        .insertOne({ name, email, address, number, message, itemName })
        .then((result) => {
          res.send(result.insertedCount > 0);
        });
    });

    // GET ORDERS
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };

      const cursor = orderCollection.find({});
      const queryCursor = orderCollection.find(query);
      const queryOrders = await queryCursor.toArray();
      const orders = await cursor.toArray();
      res.json({ orders, queryOrders });
    });

    // DELETE ORDER
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });

    // Status
    app.patch("/addStatus/:id", (req, res) => {
      const status = req.body.status;
      orderCollection
        .updateOne({ _id: ObjectId(req.params.id) }, { $set: { status } })
        .then((result) => {
          res.send(result.insertedCount > 0);
        });
    });
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
