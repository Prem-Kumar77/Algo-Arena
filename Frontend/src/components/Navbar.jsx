import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get("/auth/check");
        setUser(response.data.message); // assume response.data has user info like {name, profilePicture}
      } catch (error) {
        console.log("User not logged in", error);
        setUser(null);
      }
    }
    fetchData();
  }, []);

  // Fallback image if user.profilePicture is missing
  const fallbackProfile =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      // Clear token from localStorage
      localStorage.removeItem('token');
      navigate("/");
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
      // Even if logout fails on server, clear local token
      localStorage.removeItem('token');
      navigate("/");
      setUser(null);
    }
  };

  return (
    <div className="bg-[#141414] shadow-md sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-4">
        <Link to="/">
          <div className="flex gap-3 items-center cursor-pointer group">
            <img src="/algoarena.svg" alt="AlgoArena" className="w-11 h-11 transition-transform duration-200 group-hover:scale-105" />
            <span className="text-[22px] font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-indigo-300 to-cyan-300 group-hover:from-indigo-300 group-hover:to-cyan-200 transition-colors duration-200">
              AlgoArena
            </span>
          </div>
        </Link>

        <DropdownMenu className="md:hidden">
          <DropdownMenuTrigger>
            <svg
              className="w-6 h-6 md:hidden text-white cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  menuOpen
                    ? "M6 18L18 6M6 6l12 12" // X when open
                    : "M4 6h16M4 12h16M4 18h16" // Hamburger (3 lines) when closed
                }
              />
            </svg>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => navigate("/problems")}>
              Problems
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/contests")}>
              Contests
            </DropdownMenuItem>

            {user && (
              <>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button onClick={handleLogout}>Logout</button>
                </DropdownMenuItem>
              </>
            )}

            {!user && (
              <>
                <DropdownMenuItem>
                  <Link to="/login">Login</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/signup">Sign Up</Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <ul
          className={`gap-6 md:gap-10 text-gray-300 font-medium items-center ${
            menuOpen ? "flex flex-col" : "hidden"
          } md:flex`}
        >
          {user?.role === "admin" && (
            <li>
              <div
                onClick={() => navigate("/admin")}
                className="hover:text-white hover:underline underline-offset-4 transition duration-200"
              >
                Admin Dashboard
              </div>
            </li>
          )}

          <li>
            <div
              onClick={() => navigate("/problems")}
              className="hover:text-white hover:underline underline-offset-4 transition duration-200"
            >
              Problems
            </div>
          </li>
          <li>
            <div
              onClick={() => navigate("/contests")}
              className="hover:text-white hover:underline underline-offset-4 transition duration-200"
            >
              Contests
            </div>
          </li>
          {!user ? (
            <>
              <li>
                <div
                  onClick={() => navigate("/login")}
                  className="hover:text-white hover:underline underline-offset-4 transition duration-200"
                >
                  Login
                </div>
              </li>
              <li>
                <div
                  onClick={() => navigate("/signup")}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition duration-200"
                >
                  Sign Up
                </div>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <img
                      src={
                        user?.profilePicture ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt="Profile Picture"
                      className="w-8 h-8 rounded-full object-cover border-2 border-indigo-800"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            </>
          )}
        </ul>
      </div>
      <hr className="border-gray-700" />
    </div>
  );
};

export default Navbar;
