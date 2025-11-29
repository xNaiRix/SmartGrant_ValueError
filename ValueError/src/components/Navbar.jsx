import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Button from "./Button";

export default function Navbar() {
  const { user, logout } = useApp();

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">
          Smart
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Contract
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {!user ? (
            <>
              <Link
                to="/auth?mode=login"
                className="text-slate-400 hover:text-white transition"
              >
                Log In
              </Link>
              <Link to="/auth?mode=register">
                <Button variant="primary">Sign Up</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-slate-300 hover:text-white">
                Home
              </Link>
              {user.role === "scientist" && (
                <Link to="/create" className="text-slate-300 hover:text-white">
                  Create Request
                </Link>
              )}
              {user.role === "company" && (
                <Link to="/create" className="text-slate-300 hover:text-white">
                  Create Offer
                </Link>
              )}
              <Link to="/profile" className="text-slate-300 hover:text-white">
                Profile
              </Link>
              <Button
                variant="outline"
                onClick={logout}
                className="px-4 py-1 text-sm"
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
