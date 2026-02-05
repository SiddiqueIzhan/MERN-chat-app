import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { chatContext } from "../../AppContext/context";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { fetchAgain, setFetchAgain } = chatContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const resp = await axios.post("/api/user/login", {
        email: formData.email,
        password: formData.password,
      });

      if (resp.data.success) {
        localStorage.setItem("userInfo", JSON.stringify(resp.data.user));

        toast.success(resp.data.message);

        setFormData({ email: "", password: "" });

        setFetchAgain(!fetchAgain);
      } else {
        toast.error(resp.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-75 mx-auto">
      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
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
            type={showPassword ? "text" : "password"}
            name="password"
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

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        Login
      </button>
    </div>
  );
};

export default LoginForm;
