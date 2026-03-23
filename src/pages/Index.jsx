import useAuthStore from "@/stores/auth";
import { connectSocket } from "@/utils/socket";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [formLogin, setFormLogin] = useState({
    username: "",
    password: "",
  });
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormLogin({
      ...formLogin,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const data = {
      username: formLogin.username,
      password: formLogin.password,
    };
    const res = await login(data);
    const socket = connectSocket();
    socket.emit("join", res.uuid);
    navigate("/user/home");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-100 text-center">
        <p className="text-4xl font-semibold">PULSIQ</p>
        <div className="mt-10">
          <form onSubmit={handleLoginSubmit}>
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
              <Button type="submit" variant="contained" className="w-80">
                Login
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
