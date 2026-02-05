import { generateToken } from "../config/generateToken.js";
import User from "../models/userModel.js";

export const registerUser = async (req, res) => {
  const { username, email, password, profile_pic } = req.body;

  if (!username && !email && !password) {
    res.status(400).json({
      success: false,
      message: "Please Fill all the fields",
    });
    return;
  }

  const user = await User.findOne({ email: email });

  if (user) {
    res.status(400).json({ success: false, message: "User Already Exists" });
    return;
  }

  await User.create({
    username: username,
    email: email,
    password: password,
    profile_pic: profile_pic,
  });

  return res.status(201).json({
    success: true,
    message: "user created successfully",
    user: {
      username: username,
      email: email,
    },
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email && !password) {
    res.status(400).json({
      success: false,
      message: "Please Fill all the fields",
    });
    return;
  }

  const user = await User.findOne({ email: email });

  if (user && (await user.verifyPassword(password))) {
    const token = generateToken({ id: user._id });

    res.cookie("access_token", token);

    return res.status(201).json({
      success: true,
      message: "user login successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: email,
        profile_pic: user.profile_pic,
        token: token,
      },
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Email or Password do not match!",
    });
    return;
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          username: { $regex: req.query.search, $options: "i" },
        }
      : {};

    const users = await User.find(keyword)
      .find({
        _id: { $ne: req.user._id },
      })
      .select("-password");

    if (users.length) {
      res.status(200).json(users);
    } else {
      res.status(200).json({ message: "No users found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
