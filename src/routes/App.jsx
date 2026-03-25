import { Route, Routes } from "react-router-dom";
import Index from "../pages/Index";
import IndexLayout from "../components/layouts/IndexLayout";
import UserLayout from "@/components/layouts/UserLayout";
import Home from "@/pages/user/Home";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import Register from "@/pages/Register";

const App = () => {
  return (
    <Routes>
      <Route element={<IndexLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={["user"]} />}>
          <Route path="/user" element={<UserLayout />}>
            <Route path="home" element={<Home />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
