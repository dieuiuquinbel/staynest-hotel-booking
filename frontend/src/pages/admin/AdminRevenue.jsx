// Chức năng: Trang admin xem báo cáo doanh thu.
// Trang doanh thu của admin.
// File này tách rõ số liệu theo khoảng thời gian và số liệu tích lũy toàn hệ thống.
import { useEffect, useMemo, useState } from 'react';
import { layBaoCaoDoanhThuAdminApi } from '../../services/datPhongApi';
import { dinhDangNgay, dinhDangTien } from '../../utils/dinhDang';
import {
  RevenueBreakdown,
  RevenueFilters,
  RevenueHeader,
  RevenuePendingWarning,
  RevenueQuickAudit,
  RevenueRangeSection,
} from '../../components/admin/revenue/RevenueCards';
import { buildRange, taoPhanTichTrongKy } from '../../components/admin/revenue/revenueHelpers';

export default function AdminRevenue() {
  const [report, setReport] = useState(null);
  const [preset, setPreset] = useState('month');
  const [dateFrom, setDateFrom] = useState(buildRange('month').dateFrom);
  const [dateTo, setDateTo] = useState(buildRange('month').dateTo);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async (nextDateFrom = dateFrom, nextDateTo = dateTo) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await layBaoCaoDoanhThuAdminApi({
        date_from: nextDateFrom,
        date_to: nextDateTo,
      });
      setReport(data);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Không tải được báo cáo doanh thu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh(dateFrom, dateTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPreset = (nextPreset) => {
    setPreset(nextPreset);

    // 'all' có range riêng (2020-01-01 → hôm nay), không bỏ qua
    if (nextPreset === 'custom') return;

    const range = buildRange(nextPreset);
    setDateFrom(range.dateFrom);
    setDateTo(range.dateTo);
    refresh(range.dateFrom, range.dateTo);
  };

  const period   = useMemo(() => report?.period   || {}, [report?.period]);
  const lifetime = useMemo(() => report?.lifetime  || {}, [report?.lifetime]);
  const inventory = useMemo(() => report?.inventory || {}, [report?.inventory]);

  // Card "Doanh thu ròng dự kiến" — tính sau khi trừ toàn bộ pending refund (hệ thống)
  const projectedNetRevenue = (period.netRevenue || 0) - (lifetime.pendingRefundAmount || 0);
  const hasPendingRisk = (lifetime.pendingRefundAmount || 0) > 0;

  const periodCards = [
    {
      label: 'Doanh thu ròng trong kỳ',
      value: dinhDangTien(period.netRevenue || 0),
      tone: 'text-brand-700',
      hint: 'Tiền khách trả trừ tiền đã hoàn',
    },
    {
      label: 'Doanh thu ròng dự kiến',
      value: dinhDangTien(projectedNetRevenue),
      tone: hasPendingRisk ? 'text-rose-700' : 'text-emerald-700',
      hint: hasPendingRisk
        ? `Sau khi trừ ${dinhDangTien(lifetime.pendingRefundAmount)} hoàn chờ duyệt`
        : 'Không có rủi ro hoàn tiền chờ duyệt',
      badge: hasPendingRisk
        ? { text: 'Rủi ro', cls: 'bg-rose-100 text-rose-700' }
        : { text: 'An toàn', cls: 'bg-emerald-100 text-emerald-700' },
    },
    {
      label: 'Khách đã thanh toán',
      value: dinhDangTien(period.customerPaidAmount || 0),
      tone: 'text-emerald-700',
      hint: 'Tổng tiền hệ thống đã ghi nhận',
    },
    {
      label: 'Đã hoàn trong kỳ',
      value: dinhDangTien(period.refundAmount || 0),
      tone: 'text-rose-700',
      hint: `${period.refundRequests || 0} yêu cầu phát sinh`,
    },
    {
      label: 'Còn phải thu trong kỳ',
      value: dinhDangTien(period.receivableAmount || 0),
      tone: 'text-amber-700',
      hint: 'Chỉ tính đơn còn hiệu lực',
    },
    {
      label: 'Số đơn trong kỳ',
      value: period.totalBookings || 0,
      hint: `${period.cancelledBookings || 0} đơn hủy, ${period.noShowBookings || 0} no-show`,
    },
  ];

  const lifetimeCards = [
    {
      label: 'Doanh thu ròng',
      value: dinhDangTien(lifetime.netRevenue || 0),
      tone: 'text-brand-700',
      hint: 'Khách đã trả trừ tiền đã hoàn',
    },
    {
      label: 'Tổng khách đã trả',
      value: dinhDangTien(lifetime.customerPaidAmount || 0),
      tone: 'text-emerald-700',
      hint: 'Toàn bộ tiền đã ghi nhận',
    },
    {
      label: 'Tổng đã hoàn',
      value: dinhDangTien(lifetime.refundAmount || 0),
      tone: 'text-rose-700',
      hint: `${lifetime.pendingRefunds || 0} yêu cầu đang chờ`,
    },
    {
      label: 'Tiền hoàn chờ duyệt',
      value: dinhDangTien(lifetime.pendingRefundAmount || 0),
      tone: (lifetime.pendingRefundAmount || 0) > 0 ? 'text-amber-700' : 'text-slate-950',
      hint: `${lifetime.pendingRefunds || 0} yêu cầu chưa xử lý`,
      badge: (lifetime.pendingRefunds || 0) > 0
        ? { text: `${lifetime.pendingRefunds} chờ`, cls: 'bg-amber-100 text-amber-700' }
        : null,
    },
    {
      label: 'Tổng còn phải thu',
      value: dinhDangTien(lifetime.receivableAmount || 0),
      tone: 'text-amber-700',
      hint: 'Chỉ tính đơn còn hiệu lực',
    },
    {
      label: 'Tổng số đơn',
      value: lifetime.totalBookings || 0,
      hint: `${lifetime.cancelledBookings || 0} đơn hủy, ${lifetime.noShowBookings || 0} no-show`,
    },
  ];

  const periodBreakdown = useMemo(() => taoPhanTichTrongKy(period), [period]);
  const maxValue = Math.max(...periodBreakdown.map(([, value]) => Number(value) || 0), 1);

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-5">
      <RevenueHeader onReload={() => refresh(dateFrom, dateTo)} />

      <RevenueFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        preset={preset}
        setDateFrom={setDateFrom}
        setDateTo={setDateTo}
        applyPreset={applyPreset}
        applyRange={() => refresh(dateFrom, dateTo)}
      />

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">
          Đang tải báo cáo...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-700">
          {error}
        </div>
      ) : null}

      {!isLoading && !error ? (
        <>
          {/* Banner cảnh báo rủi ro thanh khoản */}
          <RevenuePendingWarning
            count={lifetime.pendingRefunds}
            amount={lifetime.pendingRefundAmount}
          />

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <RevenueRangeSection
              title="Doanh thu theo thời gian"
              subtitle={`Từ ${dinhDangNgay(period.dateFrom || dateFrom)} đến ${dinhDangNgay(period.dateTo || dateTo)}`}
              badge="Trong kỳ"
              cards={periodCards}
            />
            <RevenueRangeSection
              title="Tổng doanh thu hệ thống"
              subtitle="Tính toàn bộ lịch sử từ trước đến nay."
              badge="Tích lũy"
              cards={lifetimeCards}
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <RevenueBreakdown periodBreakdown={periodBreakdown} maxValue={maxValue} />
            <RevenueQuickAudit period={period} lifetime={lifetime} inventory={inventory} />
          </section>
        </>
      ) : null}
    </div>
  );
}
