import { Link } from "react-router-dom";
function LoginPage() {
  return (
    <>
      <div className="login-container">
        <div className="login-box">
          <p className="loginHead">Login with Dream account</p>
          <div className="alertBox">
            <p className="alert">
              To log in, please enter your Dream account email and password.
            </p>
          </div>
          <div className="input-pos">
            <div className="row mb-6">
              <label for="colFormLabel" className="col-sm-4 col-form-label">
                Email
              </label>
              <div class="col-sm-8">
                <input
                  type="email"
                  class="form-control form-control-sm"
                  id="colFormLabel"
                ></input>
              </div>
            </div>
            <div className="row mb-6">
              <label for="colFormLabel" className="col-sm-4 col-form-label">
                Password
              </label>
              <div class="col-sm-8">
                <input
                  type="password"
                  class="form-control form-control-sm"
                  id="colFormLabel"
                ></input>
              </div>
            </div>
            <Link
              to="/Table"
              className="btn btn-primary"
              style={{ marginTop: "5%" }}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
export default LoginPage;
