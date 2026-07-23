const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const Quote = require("./models/Quote");
const app = express();

app.use(express.static("public"));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/quote", async (req, res) => {
  try {
    const response = await axios.get("https://api.quotable.io/random");
    const quote = response.data;
    const newQuote = new Quote({
      content: quote.content,
      author: quote.author
    });
    await newQuote.save();
    res.json(newQuote);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quote" });
  }
});

app.get("/history", async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching history" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
