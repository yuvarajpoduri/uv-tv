import { LucideIcon, Tv } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon: Icon = Tv,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="glass rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center my-6 border border-white/5">
      <div className="w-14 h-14 rounded-2xl bg-base-800 border border-white/10 flex items-center justify-center text-zinc-400 mb-4">
        <Icon className="w-7 h-7 text-accent-orange" />
      </div>
      <h3 className="text-lg font-bold text-white font-display mb-1">{title}</h3>
      <p className="text-xs text-zinc-400 max-w-sm mb-5 leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="py-2.5 px-5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold text-xs shadow-glow transition-all active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
