// Chức năng: Skeleton loading cho card phòng.
function KhungThePhong({ compact = false }) {
  if (compact) {
    return (
      <div className="overflow-hidden rounded-[22px] border border-[#eadfe2] bg-white shadow-[0_18px_60px_-50px_rgba(36,31,33,0.42)]">
        <div className="h-52 animate-pulse bg-brand-50" />
        <div className="space-y-3 p-5">
          <div className="h-6 w-3/4 animate-pulse rounded-full bg-brand-50" />
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-brand-50" />
          <div className="h-4 w-full animate-pulse rounded-full bg-brand-50" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-brand-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid overflow-hidden rounded-[22px] border border-[#eadfe2] bg-white shadow-[0_18px_60px_-50px_rgba(36,31,33,0.42)] lg:grid-cols-[300px_1fr_210px]">
      <div className="h-64 animate-pulse bg-brand-50 lg:h-full" />
      <div className="space-y-4 p-5">
        <div className="h-8 w-2/3 animate-pulse rounded-full bg-brand-50" />
        <div className="h-5 w-1/3 animate-pulse rounded-full bg-brand-50" />
        <div className="h-4 w-full animate-pulse rounded-full bg-brand-50" />
        <div className="h-4 w-5/6 animate-pulse rounded-full bg-brand-50" />
        <div className="flex gap-2">
          <div className="h-8 w-20 animate-pulse rounded-full bg-brand-50" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-brand-50" />
          <div className="h-8 w-16 animate-pulse rounded-full bg-brand-50" />
        </div>
      </div>
      <div className="space-y-4 border-t border-[#eadfe2] bg-[#fffaf8] p-5 lg:border-l lg:border-t-0">
        <div className="h-20 w-24 animate-pulse rounded-xl bg-brand-50" />
        <div className="h-6 w-32 animate-pulse rounded-full bg-brand-50" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-brand-50" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-brand-50" />
      </div>
    </div>
  );
}

export default KhungThePhong;
