import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UsersSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[A-Za-z]/, "Username must start with an alphabet"],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    profile_pic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  { timestamps: true }
);


UsersSchema.methods.verifyPassword = async function (password) {
  const isValidPassword = await bcrypt.compare(password, this.password);
  return isValidPassword;
};

UsersSchema.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = new mongoose.model("User", UsersSchema);
export default User;
