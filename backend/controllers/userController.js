import { generateToken } from "../config/generateToken.js";
import User from "../models/userModel.js";
import z from "zod";

const emailSchema = z.string().trim().email({ message: "Invalid email" });

const passwordSchema = z
  .string()
  .trim()
  .min(6, { message: "Password must be at least 6 characters" })
  .refine((val) => !val.includes(" "), {
    message: "Password cannot contain spaces",
  });

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, { message: "Username must be maximum 30 characters" })
    .regex(/^[A-Za-z]/, { message: "Username must start with an alphabet" }),
  email: emailSchema,
  password: passwordSchema,
  profile_pic: z.string().optional(),
});

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerUser = async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  console.log(result);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error.issues[0].message,
    });
  }

  const { username, email, password, profile_pic } = result.data;

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
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error.issues[0].message,
    });
  }

  const { email, password } = result.data;

  const user = await User.findOne({ email: email });

  if (user && (await user.verifyPassword(password))) {
    const token = generateToken({ id: user._id });

    return res.status(201).json({
      success: true,
      message: "user login successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: email,
        profile_pic: user.profile_pic || undefined,
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
