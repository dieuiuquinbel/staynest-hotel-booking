// Chức năng: Các khối UI cho báo cáo doanh thu admin.
// Các card và section nhỏ cho trang doanh thu admin.
import { BREAKDOWN_COLOR_MAP } from './revenueHelpers';
import { dinhDangTien } from '../../../utils/dinhDang';

// ─── Stat Card cơ bản ────────────────────────────────────────────────────────
export function RevenueStatCard({ label, value, tone = 'text-slate-950', hint, badge }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
        {badge ? (
          <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${badge.cls}`}>
            {badge.text}
          </span>
        ) : null}
      </div>
      <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs font-bold text-slate-400">{hint}</p> : null}
    </article>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
export function RevenueHeader({ onReload }) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Tài chính</p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">Doanh thu</h1>
        <p className="mt-0.5 text-sm font-semibold text-slate-500">
          Tách riêng số liệu theo khoảng thời gian và tổng tích lũy toàn hệ thống.
        </p>
      </div>
      <button
        type="button"
        onClick={onReload}
        className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Tải lại
      </button>
    </section>
  );
}

// ─── Bộ lọc thời gian ────────────────────────────────────────────────────────
export function RevenueFilters({ dateFrom, dateTo, preset, setDateFrom, setDateTo, applyPreset, applyRange }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 xl:grid-cols-[180px_180px_200px_auto]">
        <label className="grid gap-1.5">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Từ ngày</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Đến ngày</span>
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Khoảng thời gian</span>
          <select
            value={preset}
            onChange={(event) => applyPreset(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black outline-none transition focus:border-brand-500"
          >
            <option value="today">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay</option>
            <option value="all">Tất cả</option>
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={applyRange}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
          >
            Áp dụng khoảng thời gian
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Banner cảnh báo rủi ro thanh khoản ─────────────────────────────────────
export function RevenuePendingWarning({ count, amount }) {
  if (!count || !amount) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5">
      <svg className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-8a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
      </svg>
      <div>
        <p className="text-sm font-black text-rose-800">Cảnh báo rủi ro thanh khoản</p>
        <p className="mt-0.5 text-sm font-semibold text-rose-700">
          Có <strong>{count}</strong> yêu cầu hoàn tiền đang chờ duyệt, tổng cộng{' '}
          <strong>{dinhDangTien(amount)}</strong>. Doanh thu ròng thực tế sẽ thấp hơn nếu toàn bộ được duyệt — xem mục <em>Dự kiến</em> ở bảng phân tích.
        </p>
      </div>
    </div>
  );
}

// ─── Section chứa các stat card (Trong kỳ / Tích lũy) ───────────────────────
export function RevenueRangeSection({ title, subtitle, badge, cards }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
          <p className="mt-0.5 text-sm font-semibold text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">{badge}</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {cards.map((card) => <RevenueStatCard key={card.label} {...card} />)}
      </div>
    </article>
  );
}

// ─── Bảng phân tích dòng tiền với thanh màu ngữ nghĩa ───────────────────────
export function RevenueBreakdown({ periodBreakdown, maxValue }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <h2 className="text-lg font-black text-slate-950">Phân tích dòng tiền trong kỳ</h2>
        <p className="mt-0.5 text-sm font-semibold text-slate-500">
          Chỉ số này chỉ tính trong khoảng ngày đang chọn.
        </p>
      </div>

      {/* Chú thích màu */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />Thu vào</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-400 inline-block" />Trừ ra / Rủi ro</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block" />Trung tính / Chờ</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-600 inline-block" />Kết quả</span>
      </div>

      <div className="mt-5 grid gap-4">
        {periodBreakdown.map(([label, value, colorType]) => {
          const colors = BREAKDOWN_COLOR_MAP[colorType] || BREAKDOWN_COLOR_MAP.neutral;
          const widthPct = Number(value) > 0
            ? Math.max(4, Math.round((Number(value) / maxValue) * 100))
            : 0;
          return (
            <div key={label}>
              <div className="mb-1.5 flex justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-700">{label}</span>
                <span className={`font-black ${colors.value}`}>{dinhDangTien(value)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

// ─── Sidebar đối soát nhanh (đã cải tiến) ────────────────────────────────────
export function RevenueQuickAudit({ period, lifetime, inventory }) {
  const projectedNet = (period.netRevenue || 0) - (lifetime.pendingRefundAmount || 0);
  const isRisk = projectedNet < (period.netRevenue || 0);

  const refundRate = (period.customerPaidAmount || 0) > 0
    ? (((period.refundAmount || 0) / period.customerPaidAmount) * 100).toFixed(1)
    : '0.0';

  const noShowRate = (period.totalBookings || 0) > 0
    ? (((period.noShowBookings || 0) / period.totalBookings) * 100).toFixed(1)
    : '0.0';

  const cancelRate = (period.totalBookings || 0) > 0
    ? (((period.cancelledBookings || 0) / period.totalBookings) * 100).toFixed(1)
    : '0.0';

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-black text-slate-950">Đối soát nhanh</h2>

      <div className="mt-4 grid gap-3">

        {/* Doanh thu ròng dự kiến (sau khi trừ pending refund) */}
        <div className={`rounded-xl border p-4 ${isRisk && lifetime.pendingRefundAmount > 0 ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
          <p className="text-[11px] font-black uppercase tracking-[0.13em] text-slate-500">Doanh thu ròng dự kiến</p>
          <p className={`mt-2 text-2xl font-black ${isRisk && lifetime.pendingRefundAmount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
            {dinhDangTien(projectedNet)}
          </p>
          <p className="mt-1 text-xs font-bold text-slate-400">
            {lifetime.pendingRefunds > 0
              ? `Sau khi trừ ${lifetime.pendingRefunds} yêu cầu hoàn đang chờ`
              : 'Không có yêu cầu hoàn tiền chờ duyệt'}
          </p>
        </div>

        {/* Tiền hoàn đang chờ duyệt */}
        {(lifetime.pendingRefunds || 0) > 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.13em] text-amber-600">Tiền hoàn chờ duyệt</p>
            <p className="mt-2 text-xl font-black text-amber-700">{dinhDangTien(lifetime.pendingRefundAmount || 0)}</p>
            <p className="mt-1 text-xs font-bold text-amber-600">{lifetime.pendingRefunds} yêu cầu — vào trang Đơn đặt phòng để xử lý</p>
          </div>
        ) : null}

        {/* Tỉ lệ trong kỳ */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Hoàn tiền</p>
            <p className="mt-1.5 text-lg font-black text-slate-900">{refundRate}%</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Hủy đơn</p>
            <p className="mt-1.5 text-lg font-black text-slate-900">{cancelRate}%</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">No-show</p>
            <p className="mt-1.5 text-lg font-black text-slate-900">{noShowRate}%</p>
          </div>
        </div>

        {/* Kho phòng */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <div>
            <p className="text-xs font-black text-slate-500">Phòng còn trong kho</p>
            <p className="mt-0.5 text-xs font-bold text-slate-400">{inventory.roomTypes || 0} loại phòng đang mở</p>
          </div>
          <p className="text-2xl font-black text-emerald-700">{inventory.availableRooms || 0}</p>
        </div>

        {/* Ghi chú công thức */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-500 leading-relaxed">
          <strong className="text-slate-700">Doanh thu ròng</strong> = Khách đã thanh toán − Tiền đã hoàn.
          Phí hủy giữ lại là phần giải thích khoản không hoàn, không cộng thêm.
          <br />
          <strong className="text-slate-700">Dự kiến</strong> = Ròng − Tổng tiền hoàn đang chờ duyệt.
        </div>
      </div>
    </article>
  );
}
