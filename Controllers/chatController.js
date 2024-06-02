const mongoose = require("mongoose");
const Chat = require("../Models/chatSchema");

exports.getChatsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid user ID",
      });
    }
    const chats = await Chat.find({ users: [userId] })
      .populate("users", "username")
      .populate("latestMessage");
    res.status(200).json({
      status: "success",
      results: chats.length,
      chats,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
