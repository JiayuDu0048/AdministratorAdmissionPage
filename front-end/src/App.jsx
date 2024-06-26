import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import React, { useEffect } from "react";
import Navbar from "./Component/Navbar";
import NavbarLogout from "./Component/NavbarLogout";
import Table from "./Component/Table";
import LoginPage from "./Component/LoginPage";
import Dashboard from "./Component/charts/DashboardScreen";
import BaseLayout from "./layouts/BaseLayout";
import Footer from "./Component/Footer";
import ErrorBoundary from "./Component/errorBoundary";
import AIChatBox from "./Component/AIChatBox";


function App() {
  return (
    <Router>
      <div>
        <Routes element={<BaseLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/table" element={<TablePage />} />
          <Route path="/help" element={<HelpPage />} />
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
      <Dashboard />
      <ErrorBoundary><Table /></ErrorBoundary>
      <Footer />
    </>
  );
}

function HelpPage(){
  return (
    <>
    <NavbarLogout />
    <AIChatBox />
    <Footer />
  </>
  );
}

export default App;
