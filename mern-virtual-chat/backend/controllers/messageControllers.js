const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

// GET ALL MESSAGES
const allMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name pic email")
    .populate("chat");

  res.json(messages);
});

// SEND MESSAGE (TEXT / FILE)
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, fileUrl, fileName, messageType } = req.body;

  if (!chatId) return res.sendStatus(400);

  const newMessage = {
    sender: req.user._id,
    content: content || "",
    chat: chatId,
    messageType: messageType || "text",
    fileUrl,
    fileName,
  };

  let message = await Message.create(newMessage);

  message = await message.populate("sender", "name pic email");
  message = await message.populate("chat");
  message = await User.populate(message, {
    path: "chat.users",
    select: "name pic email",
  });

  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: message,
  });

  res.json(message);
});

module.exports = { allMessages, sendMessage };
