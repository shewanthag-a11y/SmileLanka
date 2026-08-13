import React from "react";
import { Link } from "react-router-dom";

const AuthLanding = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-black text-white px-6 py-10">
      <div className="max-w-4xl w-full grid gap-6 md:grid-cols-2">
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 shadow-2xl shadow-amber-500/5">
          <h2 className="text-2xl font-semibold text-amber-300">Continue as a Traveler</h2>
          <p className="mt-2 text-sm text-slate-300">Create an account or sign in to manage bookings, wishlist, and your trip profile.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/account" className="inline-flex items-center justify-center rounded-full bg-amber-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-300">Create User Account</Link>
            <Link to="/" className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-3 text-sm text-slate-300 transition hover:border-white/20 hover:text-white">Continue as Guest</Link>
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-slate-400">Booking access</p>
          <p className="mt-2 text-sm text-slate-300">Guests can browse the website, but a traveler account is required to save bookings and profile details.</p>
        </div>

        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 shadow-2xl shadow-amber-500/5">
          <h2 className="text-2xl font-semibold text-amber-300">Admin Portal</h2>
          <p className="mt-2 text-sm text-slate-300">Admins can sign in or request registration to access the dashboard.</p>
          <div className="mt-6 flex gap-3">
            <Link to="/admin/auth" className="inline-flex items-center justify-center rounded-full bg-transparent border border-amber-400 px-4 py-3 font-semibold text-amber-300 transition hover:bg-amber-400/10">Admin Login / Register</Link>
          </div>
          <div className="mt-6">
            <Link to="/" className="inline-flex items-center text-sm text-slate-400 transition hover:text-white">← Back to website</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLanding;
