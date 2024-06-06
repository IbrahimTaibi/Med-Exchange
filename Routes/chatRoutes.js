const express = require("express");
const router = express.Router();
const ChatMessage = require("../Models/chatMessage");
const chatController = require("../Controllers/chatController");
const mongoose = require("mongoose");
// Middleware to validate ObjectIds
const validateObjectId = (req, res, next) => {
  const { sender, receiver, userId } = req.params;
  const { sender: bodySender, receiver: bodyReceiver } = req.body;

  if (
    (sender && !mongoose.Types.ObjectId.isValid(sender)) ||
    (receiver && !mongoose.Types.ObjectId.isValid(receiver)) ||
    (userId && !mongoose.Types.ObjectId.isValid(userId)) ||
    (bodySender && !mongoose.Types.ObjectId.isValid(bodySender)) ||
    (bodyReceiver && !mongoose.Types.ObjectId.isValid(bodyReceiver))
  ) {
    return res.status(400).send("Invalid ObjectId");
  }
  next();
};

router.use(validateObjectId);
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

router.get("/chats/:userId", async (req, res) => {
  const { userId } = req.params;

  // Validate the user ID format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  try {
    const chats = await Chat.find({ users: userId }).populate("users").exec();
    res.json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Server error fetching chats" });
  }
});

module.exports = router;
