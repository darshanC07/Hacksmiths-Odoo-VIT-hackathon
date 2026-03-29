import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Login:", formData);
  };

  return (
    <div className="login-root">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-card">
        <div className="login-brand">
          <div className="brand-icon"></div>
        </div>

        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Login to your account</p>

        <form className="login-form" onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="john@company.com"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="Enter password"
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
              >
                👁️
              </button>
            </div>
          </div>

          <button className="login-btn">Login</button>
        </form>

        <div className="login-link">
          <span>Don't have an account?</span>
          <button onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;