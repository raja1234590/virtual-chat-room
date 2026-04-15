const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

// @desc    Get all messages of a chat
// @route   GET /api/message/:chatId
// @access  Protected
const allMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name email pic")
    .populate("chat");

  res.json(messages);
});

// @desc    Send message (text / file)
// @route   POST /api/message
// @access  Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, fileUrl, fileName, messageType } = req.body;

  if (!chatId) {
    return res.status(400).json({ message: "ChatId missing" });
  }

  let message = await Message.create({
    sender: req.user._id,
    content: content || "",
    chat: chatId,
    messageType: messageType || "text",
    fileUrl,
    fileName,
  });

  message = await message.populate("sender", "name email pic");
  message = await message.populate("chat");
  message = await User.populate(message, {
    path: "chat.users",
    select: "name email pic",
  });

  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: message,
  });

  res.json(message);
});

module.exports = {
  allMessages,
  sendMessage,
};
