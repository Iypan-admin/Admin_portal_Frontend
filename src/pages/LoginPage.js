import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/Api";
import Logo from "../assets/Logo.png"; // Adjust the path if needed

const LoginPage = ({ setRole }) => {
  const [name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const data = await loginUser(name, password);
      const token = data.token;
      const decodedToken = JSON.parse(atob(token.split(".")[1]));

      let role = decodedToken.role.toLowerCase();

      localStorage.setItem("token", token);
      setRole(role);

      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "manager":
          navigate("/manager");
          break;
        case "financial":
          navigate("/finance-admin");
          break;
        case "academic":
          navigate("/academic");
          break;
        case "state":
          navigate("/state-admin");
          break;
        case "center":
          navigate("/center-admin");
          break;
        case "teacher":
          navigate("/teacher");
          break;
        case "cardadmin":
          navigate("/cardadmin");
          break;
        default:
          throw new Error("Invalid role detected: " + role);
      }
    } catch (error) {
      setError(error.message || "Login failed! Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c1dfff] to-[#f3f9ff] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Bubbles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 opacity-30 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-300 opacity-30 rounded-full blur-3xl -z-10 animate-pulse delay-200" />

      {/* Login Card */}
      <div className="w-full max-w-md p-8 bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center">
          <img src={Logo} alt="ISML Logo" className="w-20 h-20 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-sm text-gray-600">Sign in to continue to your portal</p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          {/* Username Input */}
          <div className="relative">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                id="username"
                value={name}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white"
                placeholder="Enter your username"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                <i className="fas fa-user"></i>
              </span>
            </div>
          </div>

          {/* Password Input */}
          <div className="relative">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <i className="fas fa-eye-slash"></i>
                ) : (
                  <i className="fas fa-eye"></i>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white text-sm font-semibold transition-all duration-200 ${loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-lg"
              }`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-6">
          2025 ISML Portal by IYPAN Educational Centre Pvt. Ltd.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
