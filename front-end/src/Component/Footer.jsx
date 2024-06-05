function Footer() {
    return (
      <>
        <nav className="navbar custom-navbar ">
          <div className="container-fluid " style={{height: '75px'}}>
            <div className = 'footer-col'>
              <a className="Albert" href="https://albert.nyu.edu/albert_index.html" style={{color: 'white'}}> Albert </a>
              <a className="Brightspace" href="https://brightspace.nyu.edu/d2l/home" style={{color: 'white'}}> Brightspace </a>
              <a className="NYUHome" href="https://globalhome.nyu.edu/services/favorites" style={{color: 'white'}}> NYU Home </a>
              <a className="NYUConnect" href="https://nyu.starfishsolutions.com/starfish-ops/instructor/serviceCatalog.html" style={{color: 'white'}}> NYU Connect </a>
            </div>
          </div>
        </nav>
      </>
    );
  }
  
  export default Footer;
  