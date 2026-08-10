export function PosterSkeleton() {
  return <div className="aspect-[2/3] rounded-2xl bg-base-800 animate-pulse" />;
}

export function PosterGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 w-full max-w-4xl mx-auto">
      {Array.from({ length: count }).map((_, i) => (
        <PosterSkeleton key={i} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return <div className="h-24 rounded-2xl bg-base-800 animate-pulse" />;
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SeriesCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden glass border border-white/5 animate-pulse flex flex-col">
      <div className="aspect-[2/3] w-full bg-base-800" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-base-800 rounded w-3/4" />
        <div className="h-3 bg-base-800 rounded w-1/2" />
      </div>
    </div>
  );
}

export function ProgressCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 border border-white/5 animate-pulse flex gap-3.5 items-center">
      <div className="w-20 h-28 bg-base-800 rounded-xl shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-base-800 rounded w-1/3" />
        <div className="h-5 bg-base-800 rounded w-2/3" />
        <div className="h-3 bg-base-800 rounded w-full" />
        <div className="h-8 bg-base-800 rounded-xl w-full" />
      </div>
    </div>
  );
}
