import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Camera, Download, Eye, EyeOff, Heart, Lock, LogOut, MapPin, PencilLine, ShieldCheck, Star, Trash2, UserCircle2 } from "lucide-react";
import {
  createDefaultUserProfile,
  getStoredBookings,
  getStoredUser,
  getStoredWishlist,
  saveStoredBookings,
  saveStoredUser,
  saveStoredWishlist,
} from "../utils/userAccountStorage";
import BookingRouteMap from "../components/BookingRouteMap.jsx";
import LiveChatWidget from "../components/LiveChatWidget.jsx";
import videos from "../assest/Video/video.js";

const sampleBookings = [
  { id: "bk-101", service: "Sigiriya Rock Fortress", date: "2026-09-12", guests: 2, status: "Upcoming", amount: 4800 },
  { id: "bk-102", service: "Galle Fort", date: "2026-05-18", guests: 3, status: "Completed", amount: 3600 },
  { id: "bk-103", service: "Yala National Park", date: "2026-11-02", guests: 2, status: "Upcoming", amount: 5900 },
];

const sampleWishlist = [
  { id: "tour-1", name: "Golden Experience", location: "Kandy & Ella", tag: "Classic" },
  { id: "tour-2", name: "Beach Escape", location: "Unawatuna", tag: "Coastal" },
  { id: "tour-3", name: "Wildlife Safari", location: "Yala", tag: "Adventure" },
];

const sampleRecent = [
  { id: "rec-1", name: "Sigiriya Rock Fortress", duration: "2 days" },
  { id: "rec-2", name: "Mirissa Beach", duration: "1 day" },
  { id: "rec-3", name: "Nuwara Eliya", duration: "3 days" },
];

const sampleReviews = [
  { id: "rev-1", author: "Amal", rating: 5, note: "Everything was smooth and the hotel choices were excellent." },
  { id: "rev-2", author: "Maya", rating: 4, note: "Loved the itinerary, especially the train ride through the hills." },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fullNamePattern = /^[A-Za-z][A-Za-z\s'.-]*$/;

const UserAccountPage = () => {
  const [profile, setProfile] = useState(() => {
    const stored = getStoredUser();
    if (stored) {
      return { ...createDefaultUserProfile(stored), ...stored };
    }

    return createDefaultUserProfile({
      id: "guest-user",
      name: "Traveler",
      email: "",
      password: "",
      profileImage: "https://ui-avatars.com/api/?name=Traveler&background=FBBF24&color=111827",
    });
  });
  const [bookings, setBookings] = useState(() => {
    const storedUser = getStoredUser();
    const storedBookings = getStoredBookings();
    if (storedUser && storedUser.email) {
      return storedBookings;
    }
    return storedBookings.length ? storedBookings : sampleBookings;
  });
  const [wishlist, setWishlist] = useState(() => getStoredWishlist().length ? getStoredWishlist() : sampleWishlist);
  const [recentlyViewed, setRecentlyViewed] = useState(sampleRecent);
  const [reviews, setReviews] = useState(() => {
    const storedUser = getStoredUser();
    return storedUser ? storedUser.reviews || [] : sampleReviews;
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const stored = getStoredUser();
    return Boolean(stored && stored.email);
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState(() => {
    const stored = getStoredUser();
    return {
      name: stored?.name || "",
      email: stored?.email || "",
      phone: stored?.phone || "",
      password: "",
      confirmPassword: "",
      country: stored?.country || "",
      bio: stored?.bio || "",
    };
  });
  const [newReview, setNewReview] = useState({ author: profile.name, rating: 5, note: "" });

  useEffect(() => {
    if (!isLoggedIn || !profile.email) {
      return;
    }

    saveStoredUser(profile);
  }, [profile, isLoggedIn]);

  useEffect(() => {
    setNewReview((current) => ({ ...current, author: profile.name }));
  }, [profile.name]);

  useEffect(() => {
    saveStoredBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    saveStoredWishlist(wishlist);
  }, [wishlist]);

  useEffect(() => {
    if (isLoggedIn && profile.email) {
      fetchBookingsByEmail(profile.email);
    }
  }, [isLoggedIn, profile.email]);

  const upcomingTrips = useMemo(
    () => bookings.filter((booking) => booking.status === "Upcoming" || booking.status === "Confirmed"),
    [bookings]
  );

  useEffect(() => {
    if (!bookings.length) {
      setSelectedBooking(null);
      return;
    }

    const defaultBooking = upcomingTrips.length ? upcomingTrips[0] : bookings[0];

    setSelectedBooking((prev) => {
      if (prev && bookings.some((booking) => booking.id === prev.id)) {
        return prev;
      }
      return defaultBooking;
    });
  }, [bookings, upcomingTrips]);

  const handleAuthInput = (event) => {
    const { name, value } = event.target;
    let normalizedValue = value;

    if (name === "name" || name === "country") {
      normalizedValue = value.replace(/[0-9]/g, "");
    }

    if (name === "phone") {
      normalizedValue = value.replace(/\D/g, "");
    }

    setForm((current) => ({ ...current, [name]: normalizedValue }));
  };

  const handleNameKeyDown = (event) => {
    if (event.key.length === 1 && /[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  };

  const handlePhoneKeyDown = (event) => {
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }
    if (event.key.length === 1 && !/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim().toLowerCase();
    const trimmedPhone = form.phone.trim();
    const trimmedCountry = form.country.trim();

    if (!trimmedName) {
      setMessage({ type: "error", text: "Full name is required." });
      return;
    }

    if (!fullNamePattern.test(trimmedName)) {
      setMessage({ type: "error", text: "Full name cannot contain numbers or special characters." });
      return;
    }

    if (!trimmedEmail || !emailPattern.test(trimmedEmail)) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    if (!trimmedPhone || trimmedPhone.length !== 10) {
      setMessage({ type: "error", text: "Phone number must be exactly 10 digits long." });
      return;
    }

    if (!trimmedCountry) {
      setMessage({ type: "error", text: "Country is required." });
      return;
    }

    if (!form.password || form.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match. Please try again." });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          country: trimmedCountry,
          password: form.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      const nextProfile = createDefaultUserProfile({
        ...profile,
        ...data.user,
        id: data.userId || data.user?.id || data.user?._id,
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        country: trimmedCountry,
        password: form.password,
      });

      saveStoredUser(nextProfile);
      await fetchBookingsByEmail(trimmedEmail);
      setProfile(nextProfile);
      setForm({
        name: nextProfile.name,
        email: nextProfile.email,
        phone: nextProfile.phone,
        password: "",
        confirmPassword: "",
        country: nextProfile.country,
        bio: nextProfile.bio,
      });
      setReviews(nextProfile.reviews || []);
      setNewReview((current) => ({ ...current, author: nextProfile.name }));
      setIsLoggedIn(true);
      setMessage({ type: "success", text: "Account created successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Registration failed." });
    }
  };

  const fetchBookingsByEmail = async (email) => {
    try {
      const response = await fetch(`http://localhost:5000/user/email/${encodeURIComponent(email)}/bookings`);
      const data = await response.json();

      if (!response.ok) {
        setBookings([]);
        return;
      }

      setBookings((data.bookings || []).map((booking) => ({
        ...booking,
        id: booking.id || booking._id,
      })));
    } catch (error) {
      console.error("Failed to fetch bookings by email:", error);
      setBookings([]);
    }
  };

  const getCurrentUserId = () => profile._id || profile.id;

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setMessage({ type: "error", text: "Please enter your email and password." });
      return;
    }

    const normalizedEmail = form.email.trim().toLowerCase();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password: form.password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password.");
      }

      const nextProfile = createDefaultUserProfile({
        ...data.user,
        email: normalizedEmail,
      });

      setProfile(nextProfile);
      saveStoredUser(nextProfile);
      setForm({
        name: nextProfile.name,
        email: nextProfile.email,
        phone: nextProfile.phone,
        password: "",
        confirmPassword: "",
        country: nextProfile.country,
        bio: nextProfile.bio,
      });
      setNewReview((current) => ({ ...current, author: nextProfile.name }));
      setReviews(nextProfile.reviews || []);
      await fetchBookingsByEmail(normalizedEmail);
      setIsLoggedIn(true);
      setMessage({ type: "success", text: "Welcome back!" });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Unable to log in." });
      setBookings([]);
      setReviews([]);
    }
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    const updatedProfile = {
      ...profile,
      name: form.name.trim() || profile.name,
      email: form.email.trim().toLowerCase() || profile.email,
      phone: form.phone || profile.phone,
      country: form.country || profile.country,
      bio: form.bio || profile.bio,
    };

    const userId = getCurrentUserId();
    if (!userId || userId === "guest-user") {
      setMessage({ type: "error", text: "Unable to save profile: user not identified." });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/user/${userId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedProfile.name,
          email: updatedProfile.email,
          phone: updatedProfile.phone,
          country: updatedProfile.country,
          bio: updatedProfile.bio,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Profile update failed.");
      }

      const savedProfile = createDefaultUserProfile({
        ...updatedProfile,
        ...data.user,
      });

      setProfile(savedProfile);
      saveStoredUser(savedProfile);
      setForm({
        name: savedProfile.name,
        email: savedProfile.email,
        phone: savedProfile.phone,
        password: "",
        confirmPassword: "",
        country: savedProfile.country,
        bio: savedProfile.bio,
      });
      setNewReview((current) => ({ ...current, author: savedProfile.name }));
      setMessage({ type: "success", text: "Profile saved successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to save profile." });
    }
  };

  const handlePasswordChange = async () => {
    if (!form.password || form.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "New password and confirmation must match." });
      return;
    }

    const userId = getCurrentUserId();
    if (!userId || userId === "guest-user") {
      setMessage({ type: "error", text: "Unable to update password: user not identified." });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/user/${userId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Password update failed.");
      }

      const updatedProfile = { ...profile, password: form.password };
      setProfile(updatedProfile);
      saveStoredUser(updatedProfile);
      setForm((current) => ({ ...current, password: "", confirmPassword: "" }));
      setMessage({ type: "success", text: "Password updated successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Password update failed." });
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const imageValue = String(reader.result);
      const userId = getCurrentUserId();
      const nextProfile = { ...profile, profileImage: imageValue };

      setProfile(nextProfile);
      saveStoredUser(nextProfile);

      if (!userId || userId === "guest-user") {
        setMessage({ type: "success", text: "Profile image updated." });
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/user/${userId}/profile`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileImage: imageValue }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to save profile image.");
        }

        const persistedProfile = { ...nextProfile, ...(data.user || {}) };
        setProfile(persistedProfile);
        saveStoredUser(persistedProfile);
        setMessage({ type: "success", text: "Profile image updated." });
      } catch (error) {
        setMessage({ type: "error", text: error.message || "Unable to save profile image." });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:5000/user/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to cancel booking.");
      }

      const updatedBooking = {
        ...(data.booking || {}),
        id: data.booking?.id || bookingId,
      };

      setBookings((current) => current.map((booking) => (
        booking.id === bookingId ? updatedBooking : booking
      )));

      setSelectedBooking((current) => (
        current?.id === bookingId ? updatedBooking : current
      ));

      setMessage({ type: "success", text: "Booking cancelled successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to cancel booking." });
    }
  };

  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
  };

  const handleDownloadConfirmation = (booking) => {
    const content = [
      "Smile Lanka Booking Confirmation",
      "",
      `Booking ID: ${booking.id}`,
      `Service: ${booking.service}`,
      `Date: ${booking.date}`,
      `Guests: ${booking.guests}`,
      `Status: ${booking.status}`,
      `Amount: $${(Number(booking.amount || 0) * 0.0027).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (LKR ${booking.amount.toLocaleString()})`,
      "",
      `Traveler: ${profile.name}`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `booking-confirmation-${booking.id}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
    setMessage({ type: "success", text: "Confirmation downloaded." });
  };

  const handleAddReview = async () => {
    if (!newReview.note.trim()) {
      setMessage({ type: "error", text: "Please write a quick review before submitting." });
      return;
    }

    const userId = getCurrentUserId();
    if (!userId || userId === "guest-user") {
      setMessage({ type: "error", text: "Unable to save review: user not identified." });
      return;
    }

    const reviewAuthor = (newReview.author || profile.name || "Traveler").trim();
    const nextReview = {
      id: `review-${Date.now()}`,
      author: reviewAuthor,
      rating: Number(newReview.rating) || 5,
      note: newReview.note.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`http://localhost:5000/user/${userId}/reviews`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review: nextReview }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save review.");
      }

      const savedReviews = data.reviews || [nextReview, ...reviews];
      setReviews(savedReviews);
      const updatedProfile = { ...profile, reviews: savedReviews };
      setProfile(updatedProfile);
      saveStoredUser(updatedProfile);
      setNewReview({ author: updatedProfile.name, rating: 5, note: "" });
      setMessage({ type: "success", text: "Your review has been added." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Unable to save review." });
    }
  };

  const toggleWishlist = (tour) => {
    setWishlist((current) => current.some((item) => item.id === tour.id)
      ? current.filter((item) => item.id !== tour.id)
      : [...current, tour]);
  };

  const handleLogout = () => {
    localStorage.removeItem("smilelanka_user_profile");
    setProfile(createDefaultUserProfile({
      id: "guest-user",
      name: "Traveler",
      email: "",
      password: "",
      profileImage: "https://ui-avatars.com/api/?name=Traveler&background=FBBF24&color=111827",
    }));
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      country: "",
      bio: "",
    });
    setAuthMode("login");
    setIsLoggedIn(false);
    setMessage({ type: "success", text: "You have been logged out." });
    navigate("/auth");
  };

  if (!isLoggedIn) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black px-4 py-20 text-white">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Traveler portal</p>
              <h1 className="mt-3 text-3xl font-bold md:text-5xl">Your Sri Lanka journey begins here</h1>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 items-stretch">
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
              <div className="mb-6 flex gap-3 border-b border-white/10 pb-3">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${authMode === "login" ? "bg-amber-400 text-slate-950" : "bg-white/5 text-slate-200"}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${authMode === "register" ? "bg-amber-400 text-slate-950" : "bg-white/5 text-slate-200"}`}
                >
                  Register
                </button>
              </div>

              {message.text && (
                <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${message.type === "error" ? "border-red-500/50 bg-red-500/10 text-red-200" : "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"}`}>
                  {message.text}
                </div>
              )}

              {authMode === "login" ? (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <input type="email" name="email" value={form.email} onChange={handleAuthInput} placeholder="Email address" className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-400 focus:border-amber-400" required />
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleAuthInput}
                      placeholder="Password"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 pr-12 text-white outline-none ring-0 placeholder:text-slate-400 focus:border-amber-400"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-300 hover:text-white"
                    >
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 transition hover:bg-amber-300">Login to account</button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleRegister}>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleAuthInput}
                    onKeyDown={handleNameKeyDown}
                    placeholder="Full name"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-amber-400"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleAuthInput}
                    placeholder="Email address"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-amber-400"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleAuthInput}
                    onKeyDown={handlePhoneKeyDown}
                    placeholder="Phone number"
                    maxLength={10}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-amber-400"
                    required
                  />
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleAuthInput}
                    onKeyDown={handleNameKeyDown}
                    placeholder="Country"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-amber-400"
                    required
                  />

                  <div className="relative">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleAuthInput}
                      placeholder="Password"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 pr-12 text-white outline-none placeholder:text-slate-400 focus:border-amber-400"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowRegisterPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-300 hover:text-white"
                    >
                      {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleAuthInput}
                      placeholder="Confirm password"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 pr-12 text-white outline-none placeholder:text-slate-400 focus:border-amber-400"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-300 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 transition hover:bg-amber-300">Create account</button>
                </form>
              )}
            </div>

            <div className="rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-transparent to-sky-500/10 p-0 h-full">
              <video
                className="block h-full w-full object-cover"
                src={videos.login}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black px-4 py-20 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col justify-between gap-5 rounded-3xl border border-white/10 bg-slate-900/70 p-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={profile.profileImage} alt={profile.name} className="h-20 w-20 rounded-full border-2 border-amber-400 object-cover" />
              <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-900 bg-amber-400 text-slate-900">
                <Camera size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Welcome back</p>
              <h1 className="text-2xl font-bold md:text-4xl">{profile.name}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/book" className="inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20 hover:text-amber-100">
              <MapPin size={16} /> Create booking
            </Link>
            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-rose-400 hover:text-rose-200">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${message.type === "error" ? "border-red-500/50 bg-red-500/10 text-red-200" : "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"}`}>
            {message.text}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-5 flex items-center gap-3">
                <UserCircle2 className="text-amber-300" />
                <h2 className="text-xl font-bold text-white">Profile information</h2>
              </div>

              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleProfileSave}>
                <input type="text" value={form.name} onChange={handleAuthInput} name="name" placeholder="Full name" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-amber-400" />
                <input type="email" value={form.email} onChange={handleAuthInput} name="email" placeholder="Email address" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-amber-400" />
                <input type="tel" value={form.phone} onChange={handleAuthInput} name="phone" placeholder="Phone number" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-amber-400" />
                <input type="text" value={form.country} onChange={handleAuthInput} name="country" placeholder="Country" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-amber-400" />
                <textarea value={form.bio} onChange={handleAuthInput} name="bio" placeholder="Short bio" rows={4} className="md:col-span-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-amber-400" />
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-amber-300">
                    <PencilLine size={16} /> Save profile
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-5 flex items-center gap-3">
                <Lock className="text-amber-300" />
                <h2 className="text-xl font-bold text-white">Change password</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input type="password" value={form.password} onChange={handleAuthInput} name="password" placeholder="New password" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-amber-400" />
                <input type="password" value={form.confirmPassword} onChange={handleAuthInput} name="confirmPassword" placeholder="Confirm password" className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-amber-400" />
              </div>
              <div className="mt-5 flex justify-end">
                <button type="button" onClick={handlePasswordChange} className="rounded-full bg-slate-200 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-white">Update password</button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-5 flex items-center gap-3">
                <CalendarDays className="text-amber-300" />
                <h2 className="text-xl font-bold text-white">Booking history & upcoming trips</h2>
              </div>

              <div className="space-y-4">
                {bookings.length ? bookings.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">{booking.service}</p>
                        <p className="text-sm text-slate-400">{booking.date} • {booking.guests} guest(s)</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${booking.status === "Upcoming" || booking.status === "Confirmed" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                          {booking.status}
                        </span>
                        <button type="button" onClick={() => handleDownloadConfirmation(booking)} className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/20">
                          <Download size={14} /> Download
                        </button>
                        <button type="button" onClick={() => handleSelectBooking(booking)} className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${selectedBooking?.id === booking.id ? "border border-emerald-400/40 bg-emerald-500/20 text-emerald-200" : "border border-slate-500/30 bg-slate-950/80 text-slate-200 hover:bg-slate-900/90"}`}>
                          <MapPin size={14} /> {selectedBooking?.id === booking.id ? "Selected" : "View route"}
                        </button>
                        <button type="button" onClick={() => handleCancelBooking(booking.id)} className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-500/20">
                          <Trash2 size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                      <span>Total</span>
                      <span className="font-semibold text-amber-300">${(Number(booking.amount || 0) * 0.0027).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                )) : <p className="text-slate-300">No bookings yet. Start planning your next tour.</p>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="text-amber-300" />
                <h2 className="text-xl font-bold text-white">Upcoming trips</h2>
              </div>
              {upcomingTrips.length ? (
                <ul className="space-y-3">
                  {upcomingTrips.map((trip) => (
                    <li key={trip.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{trip.service}</p>
                          <p className="text-sm text-slate-300">{trip.date} • {trip.guests} travelers</p>
                        </div>
                        <button type="button" onClick={() => handleSelectBooking(trip)} className={`rounded-full px-4 py-2 text-xs font-semibold ${selectedBooking?.id === trip.id ? "bg-emerald-500 text-slate-950" : "bg-amber-400 text-slate-950 hover:bg-amber-300"}`}>
                          {selectedBooking?.id === trip.id ? "Selected" : "View route"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-300">No upcoming travel plans yet.</p>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Heart className="text-amber-300" />
                <h2 className="text-xl font-bold text-white">Wishlist / Favorites</h2>
              </div>
              <div className="space-y-3">
                {wishlist.map((tour) => (
                  <div key={tour.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                    <div>
                      <p className="font-semibold text-white">{tour.name}</p>
                      <p className="text-sm text-slate-400">{tour.location}</p>
                    </div>
                    <button type="button" onClick={() => toggleWishlist(tour)} className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-center gap-3">
                <MapPin className="text-amber-300" />
                <h2 className="text-xl font-bold text-white">Selected itinerary route</h2>
              </div>
              <BookingRouteMap booking={selectedBooking} />
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-center gap-3">
                <MapPin className="text-amber-300" />
                <h2 className="text-xl font-bold text-white">Recently viewed tours</h2>
              </div>
              <div className="space-y-3">
                {recentlyViewed.map((tour) => (
                  <div key={tour.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                    <div>
                      <p className="font-semibold text-white">{tour.name}</p>
                      <p className="text-sm text-slate-400">{tour.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Star className="text-amber-300" />
                <h2 className="text-xl font-bold text-white">Reviews & ratings</h2>
              </div>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-semibold text-white">{review.author}</p>
                      <div className="flex gap-1 text-amber-300">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span key={`${review.id}-${index}`}>{index < review.rating ? "★" : "☆"}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-300">{review.note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <select value={newReview.rating} onChange={(event) => setNewReview((current) => ({ ...current, rating: Number(event.target.value) }))} className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-amber-400">
                  <option value={5}>5 stars</option>
                  <option value={4}>4 stars</option>
                  <option value={3}>3 stars</option>
                  <option value={2}>2 stars</option>
                  <option value={1}>1 star</option>
                </select>
                <textarea value={newReview.note} onChange={(event) => setNewReview((current) => ({ ...current, note: event.target.value }))} rows={3} placeholder="Share your travel experience..." className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-amber-400" />
                <button type="button" onClick={handleAddReview} className="rounded-full bg-amber-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-300">Submit review</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LiveChatWidget />
    </section>
  );
};

export default UserAccountPage;
