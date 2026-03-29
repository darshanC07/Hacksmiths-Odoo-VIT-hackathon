import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";
import { loginUser } from "../Global Api/globalApi";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    company: "",
  });
  
  const [errors, setErrors] = useState<{ email?: string; password?: string; company?: string }>({});
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract role from URL if present (e.g. ?role=employee)
  const [role, setRole] = useState("User");
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get("role");
    if (roleParam) {
      setRole(roleParam.charAt(0).toUpperCase() + roleParam.slice(1));
    }
  }, [location]);

  const validate = () => {
    const errs: { email?: string; password?: string; company?: string } = {};
    if (!formData.company.trim()) errs.company = "Company ID is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Enter a valid email address";
    if (!formData.password) errs.password = "Password is required";
    return errs;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    
    try {
      const res = await loginUser({
        email: formData.email,
        password: formData.password,
        company: formData.company,
        role: role.toLowerCase()
      });

      if (res.code === 200 || res.message === "Login successful!") {
        // Save dynamically inputted Company directly to local storage
        localStorage.setItem("company", formData.company.toLowerCase());
        localStorage.setItem("uid", res.user?.uid || "");
        localStorage.setItem("role", role.toLowerCase());
        
        // Redirect to appropriate dashboard perfectly
        if (role === 'Admin') {
          navigate('/admin');
        } else if (role === 'Employee') {
          navigate('/employee');
        } else {
          navigate('/');
        }
      } else {
        alert("Login failed! Invalid credentials.");
      }
    } catch (err: any) {
      console.error("Login API Error:", err);
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to login securely.");
    }
  };

  // ── Shared password-toggle icon ──────────────────────────────────────────────
  const EyeOpen = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
  const EyeOff = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <div className="login-root">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-card">
        {/* Brand mark */}
        <div className="login-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
        </div>

        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to your {role} account</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Company ID */}
          <div className={`form-group${errors.company ? " form-group--error" : ""}`}>
            <label htmlFor="company">Company Code</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </span>
              <input
                id="company"
                name="company"
                type="text"
                placeholder="e.g. ethdc"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
            {errors.company && <span className="error-msg">{errors.company}</span>}
          </div>

          {/* Email */}
          <div className={`form-group${errors.email ? " form-group--error" : ""}`}>
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className={`form-group${errors.password ? " form-group--error" : ""}`}>
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className="toggle-pass" 
                onClick={() => setShowPass((p) => !p)} 
                tabIndex={-1}
              >
                {showPass ? <EyeOff /> : <EyeOpen />}
              </button>
            </div>
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          <button type="submit" className="submit-btn" id="login-submit-btn">
            Sign In
          </button>
        </form>

        {role === 'Admin' && (
          <div className="login-signup-link">
            <span>Don't have an account?</span>
            <button className="text-link-btn" onClick={() => navigate("/signup")}>
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;