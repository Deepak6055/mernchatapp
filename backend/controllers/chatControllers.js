const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  if (!req.user) {
    console.log("req.user is undefined");
    return res.status(401).json({ message: "Not authorized, user not found" });
  }

  try {
    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    }
  } catch (error) {
    console.error("Error in accessChat:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    // Find chats where the current user is a participant
    const chats = await Chat.find({ "users.participantId": req.user._id })
      .populate({
        path: "users.participantId",
        populate: {
          path: "participantId",
          model: "User", // Populate User model
          select: "-password",
        },
      })
      .populate({
        path: "users.participantId",
        populate: {
          path: "participantId",
          model: "Lawyer", // Populate Lawyer model
          select: "-password",
        },
      })
      .populate({
        path: "groupAdmin",
        select: "-password",
      })
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    // Populate the sender of the latest message
    const results = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).send(results);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  const { users, name } = req.body;

  // Check if required fields are present
  if (!users || !name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  let parsedUsers;
  try {
    // Parse the users array
    parsedUsers = typeof users === "string" ? JSON.parse(users) : users;
  } catch (err) {
    return res.status(400).send({ message: "Invalid users format" });
  }

  // Validate users array
  if (!Array.isArray(parsedUsers) || parsedUsers.length < 1) {
    return res
      .status(400)
      .send("At least 1 user (plus you) is required to form a group chat");
  }

  // Validate structure of each user object
  const isValidStructure = parsedUsers.every(
    (u) =>
      mongoose.Types.ObjectId.isValid(u.participantId) && u.participantModel
  );

  if (!isValidStructure) {
    return res
      .status(400)
      .send("Each user must have a valid participantId and participantModel");
  }

  // Push current user (req.user) into users array
  parsedUsers.push({
    participantId: req.user._id,
    participantModel: "User",
  });
  console.log("Parsed Users:", parsedUsers);
  try {
    // Create the group chat
    const groupChat = await Chat.create({
      chatName: name,
      users: parsedUsers,
      isGroupChat: true,
      groupAdmin: req.user._id, // Pass only the ObjectId of the user
    });

    // Populate users and groupAdmin dynamically
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users.participantId", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

//@description     Get single Chat details
//@route           GET /api/chat/:chatId
//@access          Protected
const getChatById = asyncHandler(async (req, res) => {
  const chatId = req.params.chatId;

  try {
    const chat = await Chat.findById(chatId)
      .populate({
        path: "users.participantId",
        select: "name pic email",
      })
      .populate("latestMessage");

    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }

    res.json(chat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});



module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  getChatById
};


