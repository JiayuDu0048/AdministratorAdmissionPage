function Navbar() {
  return (
    <>
      <nav class="navbar custom-navbar ">
        <div class="container-fluid ">
          <div>
            <a class="navbar-brand" href="#">
              <img
                src="https://docs.steinhardt.nyu.edu/e/identity/k2/steinhardt_white.png"
                alt="Logo"
                height="25"
                class="d-inline-block align-text-top"
              ></img>
            </a>
          </div>
          <div class="justify-content-end">
            <button class="btn btn-secondary" type="button">
              Log Out
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
