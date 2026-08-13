import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, CalendarDays, LogOut, Menu, ShieldCheck, Sparkles, Trash2, Users, Wallet } from "lucide-react";

const SESSION_KEY = "smilelanka_admin_session";
const USD_EXCHANGE_RATE = 0.0027;

const formatCurrency = (amount, currency = "USD") => {
  const value = Number(amount) || 0;
  if (currency === "USD") {
    return `$${(value * USD_EXCHANGE_RATE).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `LKR ${value.toLocaleString()}`;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [customTours, setCustomTours] = useState([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, revenue: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);
  const [deletingBookingId, setDeletingBookingId] = useState(null);
  const [updatingCustomTourId, setUpdatingCustomTourId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) {
      navigate("/admin/auth");
      return;
    }

    try {
      const parsedSession = JSON.parse(session);
      if (parsedSession?.role !== "admin") {
        localStorage.removeItem(SESSION_KEY);
        navigate("/admin/auth");
        return;
      }

      setUser(parsedSession);
    } catch (error) {
      localStorage.removeItem(SESSION_KEY);
      navigate("/admin/auth");
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      const authHeaders = session?.token ? { Authorization: `Bearer ${session.token}` } : {};

      const bookingsResponse = await fetch("http://localhost:5000/admin/bookings", { headers: authHeaders });
      const statsResponse = await fetch("http://localhost:5000/admin/stats", { headers: authHeaders });

      if (!bookingsResponse.ok || !statsResponse.ok) {
        throw new Error("Admin session expired");
      }

      const bookingsData = await bookingsResponse.json();
      const statsData = await statsResponse.json();

      let customToursData = { customTours: [] };
      try {
        const customToursResponse = await fetch("http://localhost:5000/admin/custom-tours", { headers: authHeaders });
        if (customToursResponse.ok) {
          customToursData = await customToursResponse.json();
        }
      } catch (customTourError) {
        console.warn("Custom tour endpoint unavailable, continuing with booking data only.", customTourError);
      }

      setBookings(bookingsData.bookings || []);
      setCustomTours(customToursData.customTours || []);
      setStats(statsData.stats || { total: 0, confirmed: 0, pending: 0, revenue: 0 });
    } catch (error) {
      console.error("Failed to load dashboard data", error);
      setBookings([]);
      setCustomTours([]);
      setStats({ total: 0, confirmed: 0, pending: 0, revenue: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    { label: "Total bookings", value: stats.total, icon: CalendarDays },
    { label: "Confirmed", value: stats.confirmed, icon: ShieldCheck },
    { label: "Pending", value: stats.pending, icon: Bell },
    { label: "Revenue", value: formatCurrency(stats.revenue, "USD"), icon: Wallet },
  ];

  const pendingCount = bookings.filter((booking) => booking.status === "Pending").length;
  const confirmedCount = bookings.filter((booking) => booking.status === "Confirmed").length;
  const filteredBookings = activeFilter === "All"
    ? bookings
    : bookings.filter((booking) => booking.status === activeFilter);
  const customTourCount = customTours.length;
  const pendingCustomTours = customTours.filter((request) => (request.status || "Pending") === "Pending").length;
  const cancelledCustomTours = customTours.filter((request) => (request.status || "Pending") === "Cancelled").length;
  const recentCustomTours = customTours.slice(0, 3);

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    navigate("/auth");
  };

  const handleStatusChange = async (bookingId, nextStatus) => {
    const normalizedBookingId = bookingId || "";
    setUpdatingBookingId(normalizedBookingId);

    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      const response = await fetch(`http://localhost:5000/admin/bookings/${normalizedBookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await response.json() : null;
      if (!response.ok) {
        const text = data?.error || (await response.text());
        throw new Error(text || "Failed to update booking status");
      }

      await fetchDashboardData();
    } catch (error) {
      console.error("Status update failed", error);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    const normalizedBookingId = bookingId || "";
    setDeletingBookingId(normalizedBookingId);

    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      const response = await fetch(`http://localhost:5000/admin/bookings/${normalizedBookingId}`, {
        method: "DELETE",
        headers: {
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await response.json() : null;
      if (!response.ok) {
        const text = data?.error || (await response.text());
        throw new Error(text || "Failed to delete booking");
      }

      await fetchDashboardData();
    } catch (error) {
      console.error("Delete booking failed", error);
    } finally {
      setDeletingBookingId(null);
    }
  };

  const handleCustomTourStatusChange = async (customTourId, nextStatus) => {
    setUpdatingCustomTourId(customTourId);

    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      const response = await fetch(`http://localhost:5000/admin/custom-tours/${customTourId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update custom tour status");
      }

      await fetchDashboardData();
    } catch (error) {
      console.error("Custom tour status update failed", error);
    } finally {
      setUpdatingCustomTourId(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.2),_transparent_35%),linear-gradient(135deg,_#030712_0%,_#111827_100%)] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-white/10 bg-slate-950/80 shadow-2xl shadow-amber-500/10">
        <header className="flex flex-col gap-4 border-b border-white/10 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Smile Lanka admin</p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Advanced booking command center</h1>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileMenuOpen((prev) => !prev)} className="rounded-full border border-white/10 bg-white/5 p-2 lg:hidden">
              <Menu size={18} />
            </button>
            <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-lg font-semibold text-black">
                {user.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <button type="button" onClick={logout} className="flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row">
          <aside className={`${mobileMenuOpen ? "block" : "hidden"} border-b border-white/10 bg-black/20 p-4 lg:block lg:w-72 lg:border-b-0 lg:border-r lg:p-6`}>
            <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
              <div className="flex items-center gap-2 text-amber-300">
                <Sparkles size={18} />
                <span className="text-sm font-semibold">Live operations</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">All guest requests and bookings are centralized here for quick decisions.</p>
            </div>

            <nav className="space-y-2 text-sm">
              <div className="rounded-2xl bg-white/10 px-4 py-3 font-semibold text-white">Dashboard</div>
              <Link to="/" className="block rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-white/10 hover:text-white">View website</Link>
              <Link to="/book" className="block rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-white/10 hover:text-white">Create booking</Link>
            </nav>
          </aside>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">{stat.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                      </div>
                      <div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300">
                        <Icon size={20} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Recent bookings</h2>
                    <p className="text-sm text-slate-400">Manage upcoming travel requests with ease.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setActiveFilter("All")} className={`rounded-full px-3 py-1.5 text-sm ${activeFilter === "All" ? "bg-amber-400 text-black" : "border border-white/10 bg-slate-900/70 text-slate-300"}`}>
                      All
                    </button>
                    <button type="button" onClick={() => setActiveFilter("Pending")} className={`rounded-full px-3 py-1.5 text-sm ${activeFilter === "Pending" ? "bg-amber-400 text-black" : "border border-white/10 bg-slate-900/70 text-slate-300"}`}>
                      Pending
                    </button>
                    <button type="button" onClick={() => setActiveFilter("Confirmed")} className={`rounded-full px-3 py-1.5 text-sm ${activeFilter === "Confirmed" ? "bg-amber-400 text-black" : "border border-white/10 bg-slate-900/70 text-slate-300"}`}>
                      Confirmed
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {loading ? (
                    <p className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-400">Loading bookings from MongoDB...</p>
                  ) : filteredBookings.length === 0 ? (
                    <p className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-400">No bookings match this filter yet.</p>
                  ) : (
                    filteredBookings.map((booking) => (
                      <div key={booking._id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-white">{booking.user?.name || booking.userId?.name || "Guest"}</p>
                            <p className="text-sm text-slate-400">{booking.user?.email || booking.userId?.email || "No email"}</p>
                          </div>
                          <div className="text-sm text-slate-300">
                            <p>{booking.service}</p>
                            <p className="mt-1">{booking.date} • {booking.guests} guest(s)</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-amber-300">{formatCurrency(booking.amount || 0, "USD")}</p>
                            <div className="mt-2 flex items-center justify-end gap-2">
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${booking.status === "Confirmed" || booking.status === "Completed" ? "bg-emerald-500/15 text-emerald-300" : booking.status === "Cancelled" ? "bg-rose-500/15 text-rose-300" : "bg-amber-500/15 text-amber-300"}`}>
                                {booking.status}
                              </span>
                              <select
                                value={booking.status}
                                onChange={(event) => handleStatusChange(booking._id || booking.id, event.target.value)}
                                disabled={updatingBookingId === (booking._id || booking.id)}
                                className="rounded-full border border-amber-400/30 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm outline-none ring-0 transition hover:border-amber-400/50"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              {booking.status === "Cancelled" && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBooking(booking._id || booking.id)}
                                  disabled={deletingBookingId === (booking._id || booking.id)}
                                  className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-500/20"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-amber-400/15 to-transparent p-5">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Users size={18} />
                    <h3 className="font-semibold">Guests overview</h3>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">Keep a pulse on active travelers and upcoming arrivals from a single screen.</p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <h3 className="font-semibold text-white">Quick actions</h3>
                  <div className="mt-4 space-y-2 text-sm text-slate-300">
                    <button type="button" onClick={() => setActiveFilter("Pending")} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 hover:border-amber-400/40">
                      <span>Review pending requests</span>
                      <span className="text-amber-300">{pendingCount}</span>
                    </button>
                    <button type="button" onClick={() => setActiveFilter("Confirmed")} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 hover:border-amber-400/40">
                      <span>Check confirmed bookings</span>
                      <span className="text-amber-300">{confirmedCount}</span>
                    </button>
                    <button type="button" onClick={() => fetchDashboardData()} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 hover:border-amber-400/40">
                      <span>Refresh dashboard</span>
                      <span className="text-amber-300">↻</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">Custom tour requests</h3>
                    <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-300">{customTourCount}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                      <p className="text-slate-400">Pending</p>
                      <p className="mt-1 text-xl font-semibold text-amber-300">{pendingCustomTours}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                      <p className="text-slate-400">Cancelled</p>
                      <p className="mt-1 text-xl font-semibold text-rose-300">{cancelledCustomTours}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {recentCustomTours.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-3 text-xs text-slate-400">No custom tour requests yet.</p>
                    ) : (
                      recentCustomTours.map((request) => (
                        <div key={request._id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2">
                          <div>
                            <p className="text-sm font-medium text-white">{request.name}</p>
                            <p className="text-[11px] text-slate-400">{request.travelDates || "No dates"}</p>
                          </div>
                          <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${request.status === "Cancelled" ? "bg-rose-500/15 text-rose-300" : request.status === "Confirmed" || request.status === "Completed" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                            {request.status || "Pending"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <Link to="/admin/custom-tours" className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-300 transition hover:border-amber-400/50 hover:bg-amber-400/15">
                    Manage custom tour requests
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
