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


// TODO: Need to change header based on isLoggedIn
// function App() {
//   // Simulated authentication state
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   // Handlers to simulate login and logout
//   const handleLogin = () => setIsLoggedIn(true);
//   const handleLogout = () => setIsLoggedIn(false);

//   return (
//     <Router>
//       <div>
//         {/* Conditionally display Navbar based on login status */}
//         {isLoggedIn ? <NavbarLogout onLogout={handleLogout} /> : <Navbar />}

//         {/* Routes for different components */}
//         <Routes>
//           <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
//           <Route path="/table" element={<Table />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }


export default App;
