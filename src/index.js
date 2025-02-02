const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
// MongoDB connection URI
const uri = process.env.MONGODB_URI;

// MongoDB client
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

connectToDatabase();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Allow requests from your frontend origin
app.use(express.json());

// Fetch jokes route
app.get("/jokes", async (req, res) => {
  try {
    const db = client.db("jokes"); // Replace with your database name
    const jokesCollection = db.collection("jokes");

    // Fetch all jokes
    const jokes = await jokesCollection.find({}).toArray();
    res.status(200).json(jokes);
  } catch (error) {
    console.error("Error fetching jokes:", error);
    res.status(500).json({ message: "Error fetching jokes" });
  }
});

// Reaction route
app.post("/jokes/:id/react", async (req, res) => {
  const { id } = req.params;
  const { reaction } = req.body;

  if (!["like", "dislike"].includes(reaction)) {
    return res.status(400).json({ message: "Invalid reaction type. Use 'like' or 'dislike'." });
  }

  try {
    const db = client.db("jokes");
    const jokesCollection = db.collection("jokes");
    const updateField = reaction === "like" ? "likes" : "dislikes";

    const result = await jokesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { [updateField]: 1 } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: `Joke ${reaction}d successfully.` });
    } else {
      res.status(404).json({ message: "Joke not found." });
    }
  } catch (error) {
    console.error(`Error updating joke ${reaction}:`, error);
    res.status(500).json({ message: `Error updating joke ${reaction}` });
  }
});

app.post("/jokes", async (req, res) => {
  const text = req.body.text;

    try {
        await client.connect();
        const db = client.db("jokes"); // Replace with your database name
        const jokesCollection = db.collection("jokes");

        const jokes = [
            {
                text: text,
                likes: 0,
                dislikes: 0,
            }
        ];

        const result = await jokesCollection.insertMany(jokes);

        res.status(200).json({message: "Your joke is added successfully"})
    } catch (error) {
        console.error("Error inserting jokes:", error);
    } 
})

// Start the server
app.listen(port, () => {
  console.log("Listening on port: " + port);
});









