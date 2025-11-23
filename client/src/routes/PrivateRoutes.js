// client/src/routes/PrivateRoutes.jsx
import { Outlet, Link } from "react-router-dom";

const PrivateRoutes = () => {
  const hasToken = !!localStorage.getItem("token");

  return hasToken ? (
    <Outlet />
  ) : (
    <section className="p-4 text-center">
      <h1 className="h4 mb-3">Authorisation required</h1>
      <p className="mb-3">
        You must be logged in to view this page. Please log in below.
      </p>
      <Link to="/user/login" className="btn btn-primary">
        Go to Login
      </Link>
    </section>
  );
};

export default PrivateRoutes;
