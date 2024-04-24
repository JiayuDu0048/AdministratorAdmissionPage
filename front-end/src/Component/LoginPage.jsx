import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();


  // Helper function to set cookies - we can define this function outside of our component
  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  async function login(e) {
    e.preventDefault(); // Prevent the default form submission behavior
    const invalid = document.getElementById("invalid");
    setShowError(false);

    if (email === "" || password === "") {
      setShowError(true);
      return;
    }

    try {
      const response = await fetch('https://create.nyu.edu/dreamx/public/api/auth/login', {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCookie("token", data.access_token, 1); // Set the cookie to expire in 1 day
        // Handle other cookie data (if needed) here...
        navigate('/Table'); // Navigate to the table page on successful login
      } else {
        invalid.style.display = "block";
        invalid.textContent = data.message || "An error occurred";
      }
    } catch (error) {
      invalid.style.display = "block";
      invalid.textContent = "Failed to login";
    }
  }
  const debugBorderStyle = {
    border: '1px solid red', // Red border will make the divisions clear
    // margin: '5px', // Add some space around elements to see them clearly
  };

   const inputGroupStyle = {
    marginBottom: '0', // Removes Bootstrap's default margin-bottom from the .row
    paddingTop: '0', // Removes any padding-top that might be on the input row
    paddingBottom: '0', // Removes any padding-bottom that might be on the input row
    // Add other style adjustments as necessary
  };


return (
  <div className="login-container" >
    <div className="login-box" >
      <p className="loginHead">Login with Dream account</p>
      
      {showError && (
           <div className="alertBox" style={{ textAlign: 'center', alignContent: 'center' }}>
             Both email and password are required, please try again.
           </div>
       )}
      
      <form className="input-pos" onSubmit={login}>
        <div className="row mb-0" style={{...inputGroupStyle }}>
          <label htmlFor="emailInput" className="col-sm-4 col-form-label">
            Email
          </label>
          <div className="col-sm-8" >
            <input
              type="email"
              className="form-control form-control-sm"
              id="emailInput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={debugBorderStyle}
            />
          </div>
        </div>
        <div className="row mb-0" style={{ ...inputGroupStyle }}>
          <label htmlFor="passwordInput" className="col-sm-4 col-form-label">
            Password
          </label>
          <div className="col-sm-8" >
            <input
              type="password"
              className="form-control form-control-sm"
              id="passwordInput"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={debugBorderStyle}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: '2rem' }}>
          Login
        </button>
      </form>
    </div>
  </div>
);
}
export default LoginPage;