import { useState } from "react";
import { Link } from "react-router-dom";
import { User as UserIcon, LogOut, Tv, BarChart2, CreditCard, Sparkles, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { tvHandle } from "../lib/utils";
import { api } from "../lib/api";

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "uv");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/auth/profile", { displayName });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">User Profile</h1>
        <p className="text-xs text-zinc-400 mt-1">Manage your account and preferences for uv.tv</p>
      </div>

      {/* Account Info Card */}
      <div className="glass rounded-3xl p-6 border border-white/10 flex items-center gap-5 bg-gradient-to-r from-base-900 to-base-950">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent-red via-accent-orange to-accent-yellow p-0.5 shadow-glow">
          <div className="w-full h-full bg-base-950 rounded-[14px] flex items-center justify-center text-xl font-bold text-accent-orange uppercase">
            {user?.username?.[0] || "U"}
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent-orange/20 text-accent-orange text-xs font-mono font-bold mb-1 border border-accent-orange/30">
            {tvHandle(user?.username)}
          </div>
          <h2 className="text-xl font-bold text-white font-display">{user?.displayName || "uv"}</h2>
          <span className="text-xs text-zinc-400">Authorized Single-User TV Diary</span>
        </div>
      </div>

      {/* Display Name Edit Form */}
      <form onSubmit={handleUpdate} className="glass rounded-3xl p-6 border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white font-display">Edit Profile Details</h3>
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full max-w-sm bg-base-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent-orange"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="py-2.5 px-5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white font-bold text-xs shadow-glow flex items-center gap-2"
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          <span>{saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}</span>
        </button>
      </form>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/stats"
          className="glass rounded-2xl p-4 border border-white/10 hover:border-accent-orange/40 transition-all flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center text-accent-orange">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-display group-hover:text-accent-orange transition-colors">
              TV Watching Analytics
            </h4>
            <p className="text-xs text-zinc-400">View episodes, season scores & watch time</p>
          </div>
        </Link>

        <Link
          to="/streaming"
          className="glass rounded-2xl p-4 border border-white/10 hover:border-accent-orange/40 transition-all flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center text-accent-orange">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-display group-hover:text-accent-orange transition-colors">
              OTT Subscriptions
            </h4>
            <p className="text-xs text-zinc-400">Manage Netflix, Prime & Hotstar plans</p>
          </div>
        </Link>
      </div>

      {/* Logout Action */}
      <div className="pt-4">
        <button
          onClick={logout}
          className="w-full sm:w-auto py-3 px-6 rounded-xl bg-accent-red/10 hover:bg-accent-red/20 text-accent-red border border-accent-red/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of uv.tv</span>
        </button>
      </div>
    </div>
  );
}
