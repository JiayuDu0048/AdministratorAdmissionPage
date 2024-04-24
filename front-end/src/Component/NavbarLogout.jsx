import { useNavigate } from 'react-router-dom';

function NavbarLogout() {
  const navigate = useNavigate();

  //TODO
  const handleLogout = () => {
    // Perform logout logic if any (e.g., clearing auth tokens)
    
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
          <div className="justify-content-end">
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
