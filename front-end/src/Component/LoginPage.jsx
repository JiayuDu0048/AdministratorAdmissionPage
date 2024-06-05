import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();


  async function login(e) {
    e.preventDefault(); // Prevent the default form submission behavior
    setShowError(false);

    if (email === "" || password === "") {
      setError("Both email and password are required, please try again.")
      setShowError(true);
      return;
    }

    try {
      const response = await fetch('https://create.nyu.edu/dreamx/public/api/auth/login', { 
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include' // Necessary for cookies to be set
      });

      if (response.ok) {
        navigate('/Table'); // Navigate to the table page on successful login
      } else {
        const data = await response.json();
        setError(data.message || "An error occurred during login.");
        setShowError(true);
      }
    } catch (error) {
      setError("Failed to connect to the server.");
      setShowError(true);
    }
  }
  
  const debugBorderStyle = { border: '1px solid red' };
  const inputGroupStyle = { marginBottom: '0', paddingTop: '0', paddingBottom: '0' };

return (
  <div className="login-container" >
    <div className="login-box" >
      <p className="loginHead">Login with Dream account 💭</p>
      
      {showError && (
           <div className="alertBox" style={{ textAlign: 'center', alignContent: 'center' }}>
             {error}
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