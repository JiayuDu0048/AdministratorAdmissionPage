function NavbarLogout() {
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
            <button className="btn btn-secondary" type="button">
              Log Out
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default NavbarLogout;
