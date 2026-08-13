import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import CardsSection from "./components/CardsSection.jsx";
import Footer from "./components/Footer.jsx";
import Packages from "./pages/Packages.jsx";
import Gallery from "./pages/Gallary.jsx";
import GalleryUpload from "./pages/GallaryUp.jsx";
import Loader from "./components/Loader.jsx";
import PackageTemplate from "./pages/packages/PackageTemplate.jsx";
import ReadMoreAbout from "./pages/ReadMoreAbout.jsx";
import GalleFort from "./pages/destinations/GalleFort.jsx"; // Added import
import ScrollToTop from "./components/ScrollToTop.jsx";
import AOS from 'aos';
import 'aos/dist/aos.css';
// Import all destination components
import SigiriyaRockFortress from "./pages/destinations/SigiriyaRockFortress.jsx";
import YalaNational from "./pages/destinations/YalaNP.jsx";
import Unawatuna from "./pages/destinations/UnawatunaBeach.jsx";
import AdamPeak from "./pages/destinations/AdamPeak.jsx";
import Anuradhapura from "./pages/destinations/Anuradhapura.jsx";
import DambullaCaveTemple from "./pages/destinations/DambullaCaveTemple.jsx";
import EllaRock from "./pages/destinations/EllaRock.jsx";
import HortonPlains from "./pages/destinations/HortonPlains.jsx";
import KandyTemple from "./pages/destinations/KandyTemple.jsx";
import MirissaBeach from "./pages/destinations/MirissaBeach.jsx";
import NuwaraEliya from "./pages/destinations/NuwaraEliya.jsx";
// Import service components
import MountainAdventures from "./pages/services/MountainAdventures.jsx";
import BeachGetaways from "./pages/services/BeachGetaways.jsx";
import WildlifeSafaris from "./pages/services/WildlifeSafaris.jsx";
import CulturalTours from "./pages/services/CulturalTours.jsx";
import CityExploration from "./pages/services/CityExploration.jsx";
import WaterSports from "./pages/services/WaterSports.jsx";
import BookingForm from "./pages/BookingForm .jsx";
import CustomTour from "./pages/CustomTour.jsx";
import AdminAuthPage from "./pages/admin/AdminAuthPage.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminCustomToursPage from "./pages/admin/AdminCustomToursPage.jsx";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute.jsx";
import UserAccountPage from "./pages/UserAccountPage.jsx";
import AuthLanding from "./pages/AuthLanding.jsx";
import { getStoredUser } from "./utils/userAccountStorage";

const App = () => {
  const [loading, setLoading] = useState(true);

  const storedUser = getStoredUser();
  const adminSession = JSON.parse(localStorage.getItem("smilelanka_admin_session") || "null");
  const hasAnySession = Boolean(storedUser?.email) || Boolean(adminSession?.email && adminSession?.role === "admin");

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Initialize AOS animations
    if (!loading) {
      AOS.init({
        duration: 1000,
        once: false, // Changed to false so animations replay on scroll
        easing: 'ease-out-cubic',
      });
    }
  }, [loading]);

  return (
    <Router>
      <div className="bg-black text-white min-h-screen font-sans flex flex-col">
        <Loader isLoading={loading} />
        {!loading && (
          <>
            <Navbar />
            <ScrollToTop />
            <main className="flex-grow pt-16 md:pt-20">
              <Routes>
                <Route path="/" element={
                  <>
                    <Hero />
                    <CardsSection />
                    <About />
                    <Contact />
                  </>
                } />
                <Route path="/auth" element={<AuthLanding />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/packages/:id" element={<PackageTemplate />} />
                <Route path="/custom-tour" element={<CustomTour />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/gallery-upload" element={<GalleryUpload />} />
                <Route path="/account" element={<UserAccountPage />} />
                <Route path="/destinations/galle-fort" element={<GalleFort />} />
                <Route path="/book" element={<BookingForm/>} />
                <Route path="/admin/auth" element={<AdminAuthPage />} />
                <Route element={<ProtectedAdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/custom-tours" element={<AdminCustomToursPage />} />
                </Route>

                {/* Individual destination routes */}
                <Route path="/destinations/sigiriya-rock-fortress" element={<SigiriyaRockFortress />} />
                <Route path="/destinations/yala-national-park" element={<YalaNational />} />
                <Route path="/destinations/unawatuna-beach" element={<Unawatuna />} />
                <Route path="/destinations/adams-peak" element={<AdamPeak />} />
                <Route path="/destinations/anuradhapura" element={<Anuradhapura />} />
                <Route path="/destinations/dambulla-cave-temple" element={<DambullaCaveTemple />} />
                <Route path="/destinations/ella-rock" element={<EllaRock />} />
                <Route path="/destinations/horton-plains" element={<HortonPlains />} />
                <Route path="/destinations/kandy-temple" element={<KandyTemple />} />
                <Route path="/destinations/mirissa-beach" element={<MirissaBeach />} />
                <Route path="/destinations/nuwara-eliya" element={<NuwaraEliya />} />
                {/* Service routes */}
                <Route path="/services/mountain-adventures" element={<MountainAdventures />} />
                <Route path="/services/beach-getaways" element={<BeachGetaways />} />
                <Route path="/services/wildlife-safaris" element={<WildlifeSafaris />} />
                <Route path="/services/cultural-tours" element={<CulturalTours />} />
                <Route path="/services/city-exploration" element={<CityExploration />} />
                <Route path="/services/water-sports" element={<WaterSports />} />
                <Route path="/about-more" element={
                  <>
                    <Navbar />
                    <ReadMoreAbout />
                  </>
                } />
                <Route path="*" element={
                  <>
                    <Hero />
                    <CardsSection />
                    <About />
                    <Contact />
                  </>
                } />
              </Routes>
            </main>
            <Footer />
          </>
        )}
      </div>
    </Router>
  );
};

export default App;