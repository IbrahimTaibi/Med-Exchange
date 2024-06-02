const Chat = require("../Models/chatMessage");

exports.getChatsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await Chat.find({ users: userId })
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
