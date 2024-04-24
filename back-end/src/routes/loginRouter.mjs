async login() {
    // get references
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const invalid = document.getElementById("invalid");
    if (email === "" || password === "") {
    invalid.style.display = "block";
    let classes = invalid.className;
    if (classes.includes("shake-animation")) {
    invalid.className = invalid.className.replace(/\bshake-animation\b/g, "");
    setTimeout(function () { invalid.className += " " + "shake-animation"; }, 100); }
    else {
    invalid.className += " " + "shake-animation";
    }
    }
    else {
    // send data
    const response = await fetch(baseURL + '/auth/login', {
    method: "POST",
    body: JSON.stringify({ "email": email, "password": password }),
    headers: {
    "Content-Type": "application/json"
    }
    }); const data = await response.json().catch(function () {
    invalid.style.display = "block";
    let classes = invalid.className;
    if (classes.includes("shake-animation")) {
    invalid.className = invalid.className.replace(/\bshake-animation\b/g, "");
    setTimeout(function () { invalid.className += " " + "shake-animation"; }, 100);
    }
    else {
    invalid.className += " " + "shake-animation";
    }
    }); if (data) {
    if (data.message === "This User does not exist, check your details") {
    invalid.style.display = "block";
    let classes = invalid.className;
    if (classes.includes("shake-animation")) {
    invalid.className = invalid.className.replace(/\bshake-animation\b/g, "");
    setTimeout(function () { invalid.className += " " + "shake-animation"; }, 100);
    }
    else {
    invalid.className += " " + "shake-animation";
    }
    }
    else {
    console.log(data);
    setCookie("token", data.access_token, 0, 1, 0, 0);
    setCookie("screenname", data.user.screenname, 0, 1, 0, 0);
    setCookie("userType", data.user.role, 0, 1, 0, 0);
    $("#wrapper").css("filter","blur(0px)")
    this.handleloginClose();
    this.setState({ loggedIn: true });
    }
    }
    }
    }
  
    // API :

    // const baseURL = "https://create.nyu.edu/dreamx/public/api";

    
     
    
    
    
    