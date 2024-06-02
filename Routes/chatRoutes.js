const express = require("express");
const router = express.Router();
const ChatMessage = require("./models/ChatMessage");

// Fetch chat messages between two users
router.get("/messages/:sender/:receiver", async (req, res) => {
  const { sender, receiver } = req.params;
  try {
    const messages = await ChatMessage.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort("timestamp");
    res.json(messages);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Save a new chat message
router.post("/messages", async (req, res) => {
  const { sender, receiver, message } = req.body;
  const newMessage = new ChatMessage({ sender, receiver, message });
  try {
    await newMessage.save();
    res.status(201).send(newMessage);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;