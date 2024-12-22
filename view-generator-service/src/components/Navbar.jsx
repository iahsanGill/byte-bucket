import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            VideoShare
          </Link>
          <div className="space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="hover:text-indigo-200">
                  Login
                </Link>
                <Link to="/register" className="hover:text-indigo-200">
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/upload" className="hover:text-indigo-200">
                  Upload
                </Link>
                <Link to="/delete" className="hover:text-indigo-200">
                  Delete
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
