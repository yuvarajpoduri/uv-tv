import { useState, useEffect } from "react";
import { Tv, Plus, Trash2, Check, DollarSign } from "lucide-react";
import { api } from "../lib/api";
import { Subscription } from "../types";
import { currency } from "../lib/utils";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";

export default function Subscriptions() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState("");
  const [planName, setPlanName] = useState("");
  const [cost, setCost] = useState(199);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  async function fetchSubs() {
    try {
      const { data } = await api.get<Subscription[]>("/subscriptions");
      setSubs(data);
    } catch (err) {
      console.error("Failed to fetch subscriptions", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubs();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    try {
      const { data } = await api.post<Subscription>("/subscriptions", {
        name,
        planName,
        cost,
        billingCycle
      });
      setSubs((prev) => [...prev, data]);
      setName("");
      setPlanName("");
      setShowAdd(false);
    } catch (err) {
      console.error("Failed to add subscription", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/subscriptions/${id}`);
      setSubs((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Failed to delete subscription", err);
    }
  }

  if (loading) return <LoadingScreen />;

  const totalMonthlyCost = subs
    .filter((s) => s.active)
    .reduce((sum, s) => {
      const c = s.cost || 0;
      return sum + (s.billingCycle === "yearly" ? c / 12 : c);
    }, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">OTT Subscriptions</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage streaming services and monthly expenses</p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="py-2.5 px-4 rounded-xl bg-accent-orange text-white font-bold text-xs shadow-glow flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Monthly Total Card */}
      <div className="glass rounded-3xl p-6 border border-white/10 flex items-center justify-between bg-gradient-to-r from-base-900 to-base-950">
        <div>
          <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Estimated Monthly Expense</span>
          <h2 className="text-3xl font-extrabold text-white font-display mt-1">{currency(Math.round(totalMonthlyCost))}</h2>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-accent-orange/20 text-accent-orange border border-accent-orange/30 flex items-center justify-center font-bold text-xl font-mono">
          ₹
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="glass rounded-3xl p-6 border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white font-display">Add Streaming Platform</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Platform Name (e.g. Netflix, Prime Video)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-base-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent-orange"
            />
            <input
              type="text"
              placeholder="Plan Tier (e.g. Premium 4K, Mobile)"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="bg-base-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent-orange"
            />
            <input
              type="number"
              placeholder="Cost in ₹"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="bg-base-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent-orange"
            />
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value as "monthly" | "yearly")}
              className="bg-base-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent-orange"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="py-2 px-4 rounded-xl bg-base-800 text-xs text-zinc-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-accent-orange text-xs text-white font-bold shadow-glow"
            >
              Save Subscription
            </button>
          </div>
        </form>
      )}

      {/* Subscriptions List */}
      {subs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subs.map((s) => (
            <div key={s._id} className="glass rounded-2xl p-4 border border-white/10 flex justify-between items-center bg-base-900/60">
              <div>
                <h4 className="text-base font-bold text-white font-display">{s.name}</h4>
                {s.planName && <p className="text-xs text-zinc-400">{s.planName}</p>}
                <div className="text-sm font-bold text-accent-orange mt-1">
                  {currency(s.cost || 0)} <span className="text-[10px] text-zinc-500 font-normal">/{s.billingCycle}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(s._id)}
                className="p-2 rounded-xl bg-base-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Tv}
          title="No active OTT subscriptions"
          description="Add your active OTT subscriptions like Netflix or Hotstar to track your monthly TV watch expenses."
        />
      )}
    </div>
  );
}
