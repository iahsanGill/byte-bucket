import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Upload from "./components/Storage/Upload";
import Delete from "./components/Storage/Delete";
import Allocate from "./components/Storage/Allocate";
import Welcome from "./components/Welcome";
import Navbar from "./components/Navbar";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/login"
              element={<Login setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route
              path="/upload"
              element={isAuthenticated ? <Upload /> : <Navigate to="/login" />}
            />
            <Route
              path="/delete"
              element={isAuthenticated ? <Delete /> : <Navigate to="/login" />}
            />
            <Route
              path="/allocate"
              element={
                isAuthenticated ? <Allocate /> : <Navigate to="/login" />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
