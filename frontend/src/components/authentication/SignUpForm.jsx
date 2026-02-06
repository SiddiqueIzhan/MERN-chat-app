import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [pic, setPic] = useState(null);
  const [picLoading, setPicLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const uploadImage = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    setPicLoading(true);

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "chat-app");
    data.append("cloud_name", "dyofoozsk");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dyofoozsk/image/upload",
        {
          method: "POST",
          body: data,
        },
      );

      const result = await res.json();
      setPic(result.secure_url);
    } catch (error) {
      toast.error("Image upload failed");
    } finally {
      setPicLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const resp = await axios.post("/api/user", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        profile_pic: pic ? pic : undefined,
      });

      toast.success(resp.data.message);

      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setPic(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-75 mx-auto">
      {/* Username */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">
          Username <span className="text-red-500">*</span>
        </label>
        <input
          name="username"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 w-full pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:underline"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 w-full pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Profile Picture */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Profile Picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => uploadImage(e.target.files[0])}
          className="text-sm"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={picLoading}
        className={`mt-6 py-2 rounded-md text-white transition ${
          picLoading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {picLoading ? "Uploading..." : "Register"}
      </button>
    </div>
  );
};

export default SignUpForm;
