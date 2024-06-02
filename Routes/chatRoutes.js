const express = require("express");
const router = express.Router();
const ChatMessage = require("../Models/chatMessage");
const chatController = require("../Controllers/chatController");

// Fetch chat messages between two users
router.get("/:sender/:receiver", async (req, res) => {
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
router.post("/", async (req, res) => {
  const { sender, receiver, message } = req.body;
  const newMessage = new ChatMessage({ sender, receiver, message });
  try {
    const savedMessage = await newMessage.save();
    // Update the chat document with the latest message
    await Chat.findOneAndUpdate(
      { users: { $all: [sender, receiver] } },
      { latestMessage: savedMessage._id },
      { upsert: true, new: true },
    );
    res.status(201).send(savedMessage);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/chats/:userId", chatController.getChatsForUser);

module.exports = router;
