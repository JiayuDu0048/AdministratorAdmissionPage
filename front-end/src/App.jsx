import { useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import React, { useEffect } from "react";
import Navbar from "./Component/Navbar";
import Table from "./Component/Table";

function App() {
  return (
    <>
      <Navbar />
      <Table />
    </>
  );
}

export default App;
