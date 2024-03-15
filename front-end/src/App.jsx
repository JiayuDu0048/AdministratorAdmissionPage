import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import React, { useEffect } from "react";
import Navbar from "./Component/Navbar";
import NavbarLogout from "./Component/NavbarLogout";
import Table from "./Component/Table";
import LoginPage from "./Component/LoginPage";
function App() {
  return (
    <>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<Navbar />} />
            <Route path="/Table" element={<NavbarLogout />} />
          </Routes>
        </Router>
        <div>
          <Router>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/Table" element={<Table />} />
            </Routes>
          </Router>
        </div>
      </div>
    </>
  );
}

export default App;
