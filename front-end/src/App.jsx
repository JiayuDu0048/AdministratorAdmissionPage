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
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/table" element={<TablePage />} />
        </Routes>
      </div>
    </Router>
  );
}


//Define subpages and the components they will use
function HomePage() {
  return (
    <>
      <Navbar />
      <LoginPage />
    </>
  );
}

function TablePage() {
  return (
    <>
      <NavbarLogout />
      <Table />
    </>
  );
}

export default App;
