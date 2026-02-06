import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";

export const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({
      success: false,
      message: "User Id not provided",
    });
    return;
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      {
        users: { $elemMatch: { $eq: req.user._id } },
      },
      {
        users: { $elemMatch: { $eq: userId } },
      },
    ],
  })
    .populate("users", "-password")
    .populate("lastMessage");

  isChat = await User.populate(isChat, {
    path: "lastMessage.sender",
    select: "username profile_pic email",
  });

  if (isChat.length) {
    res.send(isChat[0]);
  } else {
    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createChat = await Chat.create(chatData);

      const fullChat = await Chat.findOne({ _id: createChat._id }).populate(
        "users",
        "-password",
      );

      res.status(200).json(fullChat);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }
  }
};

export const fetchChats = async (req, res) => {
  try {
    let chatsData = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("lastMessage");

    if (chatsData.length) {
      res.status(200).json(chatsData);
    } else {
      res.status(200).json({});
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }
};

export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("lastMessage");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGroupChat = async (req, res) => {
  let { userIds, groupName } = req.body;

  if (!userIds && !groupName) {
    res.status(400).json({
      success: false,
      message: "Please Fill all the fields",
    });
    return;
  }

  userIds = JSON.parse(userIds);

  if (userIds.length < 2) {
    res.status(400).json({
      success: false,
      message: "Please add at least 2 members",
    });
    return;
  }

  userIds.push(req.user._id);

  try {
    let GroupChat = await Chat.create({
      chatName: groupName,
      isGroupChat: true,
      users: userIds,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findById(GroupChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (fullGroupChat) {
      return res.status(201).json(fullGroupChat);
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }
};

export const renameGroupChat = async (req, res) => {
  const { chatId, chatName } = req.body;

  if (!chatName) {
    res.status(400).json({
      success: false,
      message: "Please add a group name",
    });
    return;
  }

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true },
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (updatedChat) {
      res.status(200).json(updatedChat);
    } else {
      res.status(404).json({
        success: false,
        message: "Chat not found",
      });
      return;
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }
};

export const addUserToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  if (!userId) {
    res.status(400).json({
      success: false,
      message: "Please Add User",
    });
    return;
  }

  try {
    const groupChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      { new: true },
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (groupChat) {
      res.status(200).json(groupChat);
    } else {
      res.status(404).json({
        success: false,
        message: "Chat not found",
      });
      return;
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }
};

export const removeUser = async (req, res) => {
  const { chatId, userId, newAdminId } = req.body;

  if (!userId && !chatId) {
    res.status(400).json({
      success: false,
      message: "chatId and userId are required",
    });
    return;
  }

  try {
    const group = await Chat.findById(chatId);
    const loggedInUser = req.user._id.toString();
    const isSelfExit = userId === loggedInUser;
    const isAdmin = loggedInUser === group.groupAdmin.toString();

    // Non admin user trying to remove a user
    if (!isSelfExit && !isAdmin) {
      return res.status(403).json({
        message: "Only admin can remove users",
      });
    }

    const isLeavingAdmin = group.groupAdmin.toString() === userId;
    // admin leaving a group
    if (isLeavingAdmin) {
      const remainingUsers = group.users.filter(
        (u) => u._id.toString() !== userId,
      );

      if (remainingUsers.length > 0) {
        group.groupAdmin = newAdminId || remainingUsers[0];
      }
    }
    // removing user from group admin or not-admin
    group.users = group.users.filter((u) => u._id.toString() !== userId);

    await group.save();

    const updatedGroupChat = await Chat.findById(chatId)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(updatedGroupChat);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }
};

export const changeAdmin = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const group = await Chat.findById(chatId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // 🔐 Permission check
    if (group.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only admin can change admin",
      });
    }

    // 👥 Ensure new admin is in group
    if (!group.users.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User is not in group",
      });
    }

    group.groupAdmin = userId;
    await group.save();

    const updatedGroupChat = await Chat.findById(chatId)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(updatedGroupChat);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
