import useAuthStore from "@/stores/auth";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [formRegister, setFormRegister] = useState({
    username: "",
    password: "",
  });
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormRegister({
      ...formRegister,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const data = {
      username: formRegister.username,
      email: formRegister.email,
      password: formRegister.password,
    };
    const res = await register(data);
    navigate("/");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-100 text-center">
        <p className="text-4xl font-semibold">Create Account</p>
        <div className="mt-10">
          <form onSubmit={handleRegisterSubmit}>
            <div className="mt-5">
              <TextField
                required
                id="username"
                type="text"
                name="username"
                label="Username"
                placeholder="username"
                onChange={handleChange}
                className="w-80"
              />
            </div>
            <div className="mt-5">
              <TextField
                required
                id="email"
                type="email"
                name="email"
                label="E-mail"
                placeholder="E-mail"
                onChange={handleChange}
                className="w-80"
              />
            </div>
            <div className="mt-5">
              <TextField
                required
                id="password"
                type="password"
                name="password"
                label="Password"
                placeholder="password"
                onChange={handleChange}
                className="w-80"
              />
            </div>
            <div className="mt-5">
              Are you registered ? Please <Link to="/" className="text-blue-500">login</Link> now!
            </div>
            <div className="mt-5">
              <Button type="submit" variant="contained" className="w-80">
                Register
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
