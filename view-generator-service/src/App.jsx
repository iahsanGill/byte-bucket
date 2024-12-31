import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Allocate from "./components/Storage/Allocate";
import Upload from "./components/Storage/Upload";
import Delete from "./components/Storage/Delete";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              !token ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/storage/allocate" />
              )
            }
          />
          <Route
            path="/register"
            element={
              !token ? <Register /> : <Navigate to="/storage/allocate" />
            }
          />

          {token ? (
            <>
              <Route
                path="/storage/allocate"
                element={<Allocate token={token} />}
              />
              <Route
                path="/storage/upload"
                element={<Upload token={token} />}
              />
              <Route
                path="/storage/delete"
                element={<Delete token={token} />}
              />
              <Route
                path="/"
                element={
                  <div>
                    <h1>Storage Service</h1>
                    <button onClick={handleLogout}>Logout</button>
                    <nav>
                      <ul>
                        <li>
                          <a href="/storage/allocate">Allocate Storage</a>
                        </li>
                        <li>
                          <a href="/storage/upload">Upload File</a>
                        </li>
                        <li>
                          <a href="/storage/delete">Delete File</a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                }
              />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
