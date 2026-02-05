import { useState } from "react";
import LoginForm from "../components/authentication/LoginForm";
import SignUpForm from "../components/authentication/SignUpForm";
import { ToastContainer } from "react-toastify";

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-md p-6">
        {/* Header */}
        <div className="bg-white p-4 rounded-2xl shadow">
          <h1 className="text-center text-2xl font-bold">Talk-A-Tive App</h1>
        </div>

        {/* Tabs Container */}
        <div className="bg-white p-4 rounded-2xl shadow mt-5">
          {/* Tabs */}
          <div className="flex bg-blue-900 rounded-lg overflow-hidden mb-4">
            <button
              onClick={() => setActiveTab("login")}
              className={`w-1/2 py-2 text-white font-medium transition ${
                activeTab === "login"
                  ? "bg-blue-700"
                  : "bg-blue-900 hover:bg-blue-800"
              }`}
            >
              Login
            </button>

            <button
              onClick={() => setActiveTab("signup")}
              className={`w-1/2 py-2 text-white font-medium transition ${
                activeTab === "signup"
                  ? "bg-blue-700"
                  : "bg-blue-900 hover:bg-blue-800"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "login" && <LoginForm />}
          {activeTab === "signup" && <SignUpForm />}
        </div>

        <ToastContainer />
      </div>
    </div>
  );
};

export default Login;
