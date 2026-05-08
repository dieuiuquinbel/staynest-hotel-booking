function TheThongKe({ label, value, hint, tone = 'text-slate-950' }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/[0.03]">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs font-semibold text-slate-500">{hint}</p> : null}
    </article>
  );
}

function QuanLyDatPhongBangTongQuan({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((item) => (
        <TheThongKe key={item.label} {...item} />
      ))}
    </div>
  );
}

export default QuanLyDatPhongBangTongQuan;
