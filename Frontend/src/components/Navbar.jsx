import { Link } from "react-router-dom";
import  { useEffect, useState, useRef } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Link as RouterLink, useLocation as useRouterLocation, useNavigate as useRouterNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { getStoredUser } from "../utils/userAccountStorage";

const Navbar = () => {
  const [show, setShow] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const location = useRouterLocation();
  const navigate = useRouterNavigate();
  const navItems = ["home", "about", "destinations", "contact", "gallery"];
  const linkRefs = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setShow(true);
      } else {
        setShow(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setFocusedIndex(prev => (prev < navItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : navItems.length - 1));
      } else if (e.key === "Enter" && focusedIndex !== -1) {
        // Trigger click on Enter key
        if (linkRefs.current[focusedIndex]) {
          linkRefs.current[focusedIndex].click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, navItems.length]);

  // Set initial focus to first item when navbar becomes visible
  useEffect(() => {
    if (show && focusedIndex === -1) {
      setFocusedIndex(0);
    }
  }, [show, focusedIndex]);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem("smilelanka_admin_session") || "null");
      setIsAdminLoggedIn(Boolean(session?.email && session?.role === "admin"));
    } catch (error) {
      setIsAdminLoggedIn(false);
    }
    try {
      const user = getStoredUser();
      setIsUserLoggedIn(Boolean(user?.email));
    } catch (e) {
      setIsUserLoggedIn(false);
    }
  }, [location.pathname]);

  // Determine if we're on the home page
  const isHomePage = location.pathname === "/";

  const navLinks = (
    <>
      <li className="hover:text-yellow-400 cursor-pointer transition-colors duration-300 font-medium">
        <RouterLink to="/" className="block h-full w-full py-3 px-4 rounded-xl hover:bg-gray-700/50 transition-all" onClick={() => setMobileMenuOpen(false)}>
          Home
        </RouterLink>
      </li>
      <li className="hover:text-yellow-400 cursor-pointer transition-colors duration-300 font-medium">
        {isHomePage ? (
          <ScrollLink to="about" smooth={true} duration={600} offset={-100} className="block h-full w-full py-3 px-4 rounded-xl hover:bg-gray-700/50 transition-all" onClick={() => setMobileMenuOpen(false)}>
            About Us
          </ScrollLink>
        ) : (
          <RouterLink to="/" className="block h-full w-full py-3 px-4 rounded-xl hover:bg-gray-700/50 transition-all" onClick={() => setMobileMenuOpen(false)}>
            About Us
          </RouterLink>
        )}
      </li>
      <li className="hover:text-yellow-400 cursor-pointer transition-colors duration-300 font-medium">
        {isHomePage ? (
          <ScrollLink to="destination" smooth={true} duration={600} offset={-100} className="block h-full w-full py-3 px-4 rounded-xl hover:bg-gray-700/50 transition-all" onClick={() => setMobileMenuOpen(false)}>
            Destinations
          </ScrollLink>
        ) : (
          <RouterLink to="/" className="block h-full w-full py-3 px-4 rounded-xl hover:bg-gray-700/50 transition-all" onClick={() => setMobileMenuOpen(false)}>
            Destinations
          </RouterLink>
        )}
      </li>
      <li className="hover:text-yellow-400 cursor-pointer transition-colors duration-300 font-medium">
        <RouterLink to="/packages" className="block h-full w-full py-3 px-4 rounded-xl hover:bg-gray-700/50 transition-all" onClick={() => setMobileMenuOpen(false)}>
          Packages
        </RouterLink>
      </li>
      <li className="hover:text-yellow-400 cursor-pointer transition-colors duration-300 font-medium">
        <RouterLink to="/gallery" className="block h-full w-full py-3 px-4 rounded-xl hover:bg-gray-700/50 transition-all" onClick={() => setMobileMenuOpen(false)}>
          Gallery
        </RouterLink>
      </li>
      {isUserLoggedIn && (
        <li className="hover:text-yellow-400 cursor-pointer transition-colors duration-300 font-medium">
          <RouterLink to="/account" className="block h-full w-full py-3 px-4 rounded-xl hover:bg-gray-700/50 transition-all" onClick={() => setMobileMenuOpen(false)}>
            My Account
          </RouterLink>
        </li>
      )}
      <li className="hover:text-yellow-400 cursor-pointer transition-colors duration-300 font-medium">
        {isHomePage ? (
          <ScrollLink to="contact" smooth={true} duration={600} offset={-100} className="block h-full w-full py-3 px-4 rounded-xl hover:bg-gray-700/50 transition-all" onClick={() => setMobileMenuOpen(false)}>
            Contact Us
          </ScrollLink>
        ) : (
          <RouterLink to="/" className="block h-full w-full py-3 px-4 rounded-xl hover:bg-gray-700/50 transition-all" onClick={() => setMobileMenuOpen(false)}>
            Contact Us
          </RouterLink>
        )}
      </li>
      {!isUserLoggedIn && !isAdminLoggedIn && (
        <li className="hover:text-yellow-400 cursor-pointer transition-colors duration-300 font-medium">
          <RouterLink
            to="/auth"
            className="block h-full w-full py-3 px-4 rounded-xl bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 transition-all"
            onClick={() => setMobileMenuOpen(false)}
          >
            Login / Register
          </RouterLink>
        </li>
      )}
      {isAdminLoggedIn && (
        <li className="hover:text-yellow-400 cursor-pointer transition-colors duration-300 font-medium">
          <RouterLink
            to="/admin"
            className="block h-full w-full py-3 px-4 rounded-xl bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 transition-all"
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </RouterLink>
        </li>
      )}
    </>
  );

  return (
    <nav
      className={`fixed top-0 left-0 w-full flex justify-between items-center px-6 md:px-10 py-4 z-50 transition-all duration-500 ${
        show
          ? "bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl"
          : "bg-transparent"
      }`}
    >
      {/* Logo - Always show company name */}
      <h1 className="text-yellow-400 font-bold text-xl md:text-2xl tracking-wide">
        Smile Lanka
      </h1>

      {/* Mobile menu button */}
      <button
        className="md:hidden text-white focus:outline-none z-50 p-3 rounded-xl hover:bg-gray-800 transition-colors"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Desktop Navigation */}
      <ul className="hidden md:flex items-center space-x-3 bg-gray-800/80 backdrop-blur-sm rounded-2xl py-2 px-4 border border-gray-700">
        {navLinks}
      </ul>

      {/* Mobile Navigation - Beautiful responsive menu with smooth animation */}
      <div 
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ease-in-out ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      </div>
      
      <div 
        className={`md:hidden fixed top-0 right-0 h-full w-4/5 max-w-sm z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 rounded-l-2xl shadow-2xl border-l border-gray-700 overflow-hidden">
          <div className="p-6 bg-gray-900/80 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-white font-bold text-xl">Menu</h2>
              <button
                className="text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto py-4">
            <ul className="px-4 space-y-2">
              {navLinks}
            </ul>
          </div>
          
          <div className="p-6 bg-gray-900/50 border-t border-gray-700">
            <div className="flex items-center justify-center">
              <button 
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-full font-medium hover:from-yellow-600 hover:to-amber-700 transition-all transform hover:scale-105"
                onClick={() => {
                  setMobileMenuOpen(false);
                  // Navigate to contact section
                  if (location.pathname === "/") {
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    navigate("/");
                    // Use setTimeout to ensure navigation completes before scrolling
                    setTimeout(() => {
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }
                }}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;