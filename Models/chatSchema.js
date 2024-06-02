const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "ChatMessage" },
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
