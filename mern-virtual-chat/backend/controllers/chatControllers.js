const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// @desc    Create or fetch one-to-one chat
// @route   POST /api/chat
// @access  Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "UserId not provided" });
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    users: { $all: [req.user._id, userId] },
  })
    .populate("users", "name email pic")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name email pic",
  });

  if (isChat.length > 0) {
    return res.send(isChat[0]);
  }

  const chatData = {
    chatName: "sender",
    isGroupChat: false,
    users: [req.user._id, userId],
  };

  const createdChat = await Chat.create(chatData);

  const fullChat = await Chat.findById(createdChat._id).populate(
    "users",
    "name email pic"
  );

  res.status(200).json(fullChat);
});

// @desc    Fetch all chats for logged-in user
// @route   GET /api/chat
// @access  Protected
const fetchChats = asyncHandler(async (req, res) => {
  let chats = await Chat.find({
    users: { $elemMatch: { $eq: req.user._id } },
  })
    .populate("users", "name email pic")
    .populate("groupAdmin", "name email pic")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  chats = await User.populate(chats, {
    path: "latestMessage.sender",
    select: "name email pic",
  });

  res.status(200).send(chats);
});

// @desc    Create group chat
// @route   POST /api/chat/group
// @access  Protected
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  const users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .json({ message: "At least 2 users required" });
  }

  users.push(req.user._id);

  const groupChat = await Chat.create({
    chatName: req.body.name,
    users,
    isGroupChat: true,
    groupAdmin: req.user._id,
  });

  const fullGroupChat = await Chat.findById(groupChat._id)
    .populate("users", "name email pic")
    .populate("groupAdmin", "name email pic");

  res.status(200).json(fullGroupChat);
});

// @desc    Rename group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "name email pic")
    .populate("groupAdmin", "name email pic");

  if (!updatedChat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  res.json(updatedChat);
});

// @desc    Add user to group
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "name email pic")
    .populate("groupAdmin", "name email pic");

  res.json(updatedChat);
});

// @desc    Remove user from group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "name email pic")
    .populate("groupAdmin", "name email pic");

  res.json(updatedChat);
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
