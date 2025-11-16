import React from "react";

const SkeletonLine = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-slate-200/70 ${className}`} />
);

const Pill = ({ className = "" }) => (
  <div className={`animate-pulse rounded-full bg-slate-200/70 ${className}`} />
);

const StateCard = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-3 flex items-center justify-between">
      <Pill className="h-6 w-28" />
      <SkeletonLine className="h-5 w-5 rounded-full" />
    </div>
    <SkeletonLine className="mb-2 h-10 w-24" />
    <SkeletonLine className="h-4 w-24" />
  </div>
);

const HeaderCard = () => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-4">
      <Pill className="mb-2 h-4 w-40" />
      <SkeletonLine className="h-9 w-80" />
    </div>
    <div className="flex justify-end">
      <Pill className="h-8 w-56" />
    </div>
  </div>
);

const MarketplaceItem = () => (
  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <div className="flex items-center gap-3">
      <SkeletonLine className="h-9 w-9 rounded-xl" />
      <SkeletonLine className="h-4 w-32" />
    </div>
    <Pill className="h-7 w-16" />
  </div>
);

const MarketplaceCard = () => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <SkeletonLine className="h-6 w-56" />
      <div className="flex items-center gap-3">
        <SkeletonLine className="h-6 w-6 rounded-md" />
        <Pill className="h-7 w-36" />
        <div className="flex items-center gap-2">
          <Pill className="h-8 w-20" />
          <Pill className="h-8 w-24" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <MarketplaceItem key={i} />
      ))}
    </div>
  </div>
);

const SkeletonDashboard = () => {
  return (
    <div className="space-y-6">
      <HeaderCard />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <StateCard key={i} />
        ))}
      </div>

      <MarketplaceCard />
    </div>
  );
};

export default SkeletonDashboard;
export { SkeletonDashboard };
export { SkeletonLine, Pill, StateCard, MarketplaceCard };


