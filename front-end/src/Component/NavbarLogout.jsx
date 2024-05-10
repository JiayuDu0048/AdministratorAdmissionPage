import { useNavigate } from 'react-router-dom';

function NavbarLogout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // clearing auth tokens
    localStorage.removeItem('token');
    // Redirect to the root route
    navigate('/');
  };

  return (
    <>
      <nav className="navbar custom-navbar ">
        <div className="container-fluid ">
          <div>
            <a className="navbar-brand" href="#">
              <img
                src="https://docs.steinhardt.nyu.edu/e/identity/k2/steinhardt_white.png"
                alt="Logo"
                className="d-inline-block align-text-top navbar-logo"
              ></img>
            </a>
          </div>
          <div className="justify-content-end" style={{marginRight: '40px'}}>
            <button className="btn btn-secondary" type="button" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default NavbarLogout;
