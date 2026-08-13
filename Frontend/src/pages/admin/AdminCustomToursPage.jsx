import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, LogOut, Menu, Sparkles, Users } from "lucide-react";

const SESSION_KEY = "smilelanka_admin_session";

const AdminCustomToursPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [customTours, setCustomTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingCustomTourId, setUpdatingCustomTourId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const fetchCustomTours = async () => {
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      const authHeaders = session?.token ? { Authorization: `Bearer ${session.token}` } : {};
      const response = await fetch("http://localhost:5000/admin/custom-tours", { headers: authHeaders });

      if (!response.ok) {
        throw new Error("Admin session expired");
      }

      const data = await response.json();
      setCustomTours(data.customTours || []);
    } catch (error) {
      console.error("Failed to load custom tour applications", error);
      setCustomTours([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomTours();
  }, []);

  const handleStatusChange = async (customTourId, nextStatus) => {
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

      await fetchCustomTours();
    } catch (error) {
      console.error("Custom tour status update failed", error);
    } finally {
      setUpdatingCustomTourId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    navigate("/auth");
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
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Custom tour applications</h1>
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
              <Link to="/admin" className="block rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-white/10 hover:text-white">Dashboard</Link>
              <div className="rounded-2xl bg-white/10 px-4 py-3 font-semibold text-white">Custom tour requests</div>
              <Link to="/" className="block rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-white/10 hover:text-white">View website</Link>
              <Link to="/book" className="block rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-white/10 hover:text-white">Create booking</Link>
            </nav>
          </aside>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Link to="/admin" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 hover:border-amber-400/40">
                  <ArrowLeft size={14} />
                  Back to dashboard
                </Link>
              </div>
              <div className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm font-medium text-amber-300">
                {customTours.length} total requests
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 sm:p-6">
              {loading ? (
                <p className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-400">Loading custom tour requests...</p>
              ) : customTours.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-6 text-center text-sm text-slate-400">
                  No custom tour applications yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {customTours.map((request) => (
                    <div key={request._id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-white">{request.name}</p>
                              <p className="text-slate-400">{request.email}</p>
                            </div>
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ${request.status === "Confirmed" || request.status === "Completed" ? "bg-emerald-500/15 text-emerald-300" : request.status === "Cancelled" ? "bg-rose-500/15 text-rose-300" : "bg-amber-500/15 text-amber-300"}`}>
                              {request.status || "Pending"}
                            </span>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-xl bg-white/5 p-3">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Phone</p>
                              <p className="mt-2 font-medium text-white">{request.phone}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 p-3">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Travel dates</p>
                              <p className="mt-2 font-medium text-white">{request.travelDates}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 p-3">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Duration</p>
                              <p className="mt-2 font-medium text-white">{request.duration}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 p-3">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Budget</p>
                              <p className="mt-2 font-medium text-white">{request.budget}</p>
                            </div>
                          </div>

                          <div className="grid gap-3 lg:grid-cols-2">
                            <div className="rounded-xl bg-white/5 p-3">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Interests</p>
                              <p className="mt-2 text-white">{request.interests}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 p-3">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Group size</p>
                              <p className="mt-2 text-white">{request.groupSize}</p>
                            </div>
                          </div>

                          {request.specialRequests && (
                            <div className="rounded-xl bg-white/5 p-3">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Special requests</p>
                              <p className="mt-2 text-white">{request.specialRequests}</p>
                            </div>
                          )}
                        </div>

                        <div className="w-full max-w-[180px] rounded-2xl border border-white/10 bg-white/5 p-3">
                          <div className="mb-2 flex items-center gap-2 text-amber-300">
                            <Users size={16} />
                            <span className="text-xs font-semibold uppercase tracking-[0.2em]">Status</span>
                          </div>
                          <select
                            value={request.status || "Pending"}
                            onChange={(event) => handleStatusChange(request._id, event.target.value)}
                            disabled={updatingCustomTourId === request._id}
                            className="w-full rounded-xl border border-amber-400/30 bg-slate-900/90 px-3 py-2 text-sm font-medium text-white outline-none transition hover:border-amber-400/50"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                            {updatingCustomTourId === request._id ? "Updating..." : "Ready"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomToursPage;
