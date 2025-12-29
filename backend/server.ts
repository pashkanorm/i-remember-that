import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";

type Item = {
  id: string;
  title: string;
  description?: string;
  type: "movies" | "games" | "books";
};

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage
let finishedList: Item[] = [];

// Get all items
app.get("/items", (req, res) => {
  res.json(finishedList);
});

// Add new item
app.post("/items", (req, res) => {
  const { title, description, type } = req.body;
  if (!title || !type) {
    return res.status(400).json({ message: "Missing title or type" });
  }

  const newItem: Item = {
    id: uuidv4(),
    title,
    description: description || "",
    type,
  };

  finishedList.push(newItem);
  res.status(201).json(newItem);
});

// Remove item
app.delete("/items/:id", (req, res) => {
  const { id } = req.params;
  finishedList = finishedList.filter((item) => item.id !== id);
  res.status(204).send();
});

// Reorder entire list
app.put("/items/reorder", (req, res) => {
  const { newList } = req.body;
  if (!Array.isArray(newList)) {
    return res.status(400).json({ message: "newList must be an array of items" });
  }

  const isValid = newList.every(
    (i) => i.id && i.title && ["movies", "games", "books"].includes(i.type)
  );
  if (!isValid) {
    return res.status(400).json({ message: "Invalid item structure in newList" });
  }

  finishedList = newList;
  res.json(finishedList);
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
