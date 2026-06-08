// Chức năng: Trang admin xử lý vận hành, hỗ trợ và hoàn tiền.
// Admin vận hành: xử lý yêu cầu hoàn tiền và hỗ trợ khách hàng — phiên bản nâng cấp UI.
import { useEffect, useState } from 'react';
import {
  capNhatYeuCauHoTroAdminApi,
  layYeuCauHoTroAdminApi,
} from '../../services/datPhongApi';

function StatusBadge({ status }) {
  const map = {
    new: 'bg-sky-100 text-sky-700',
    processing: 'bg-amber-100 text-amber-800',
    resolved: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-slate-100 text-slate-600',
  };
  const label = {
    new: 'Mới', processing: 'Đang xử lý',
    resolved: 'Đã phản hồi', closed: 'Đóng',
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-black ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {label[status] || status}
    </span>
  );
}

function SectionHeader({ title, count }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-base font-black text-slate-950">{title}</h3>
      {count != null ? (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
          {count} mục
        </span>
      ) : null}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 py-10 text-center">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8 text-slate-300">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <p className="text-sm font-bold text-slate-500">{message}</p>
    </div>
  );
}

function AdminOperations() {
  const [tickets, setTickets] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [replyByTicket, setReplyByTicket] = useState({});

  const refresh = async () => {
    setIsLoading(true);
    setError('');
    try {
      const nextTickets = await layYeuCauHoTroAdminApi();
      setTickets(nextTickets);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Không tải được dữ liệu vận hành.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleTicket = async (ticket, status) => {
    setError('');
    try {
      const data = await capNhatYeuCauHoTroAdminApi(ticket.id, status, replyByTicket[ticket.id] || '');
      setTickets(data);
      setNotice('Đã cập nhật yêu cầu hỗ trợ.');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Không cập nhật được yêu cầu hỗ trợ.');
    }
  };

  const pendingTickets = tickets.filter((t) => t.status === 'new' || t.status === 'processing');

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-5">

      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Vận hành</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">Hỗ trợ & khiếu nại</h1>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}>
            <path fillRule="evenodd" d="M4 2a1 1 0 0 1 1 1v2.101a7.002 7.002 0 0 1 11.601 2.566 1 1 0 1 1-1.885.666A5.002 5.002 0 0 0 5.999 7H9a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm.008 9.057a1 1 0 0 1 1.276.61A5.002 5.002 0 0 0 14.001 13H11a1 1 0 1 1 0-2h5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-2.101a7.002 7.002 0 0 1-11.601-2.566 1 1 0 0 1 .61-1.276z" clipRule="evenodd" />
          </svg>
          Tải lại
        </button>
      </section>

      {/* Info Notice */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-blue-500">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p className="text-sm font-semibold text-blue-800">
          Xử lý hoàn tiền đã được chuyển sang trang <strong>Đơn đặt phòng</strong> → tab <strong>Cần xử lý</strong>.
        </p>
      </div>

      {/* Summary stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article className="relative overflow-hidden rounded-xl border border-sky-200 bg-sky-50 p-4">
          <span className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-sky-500" />
          <div className="pl-2">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-600">Khiếu nại chờ xử lý</p>
            <p className="mt-2 text-2xl font-black text-sky-900">{pendingTickets.length}</p>
            <p className="mt-1 text-xs font-bold text-sky-600">{tickets.length} tổng phiếu</p>
          </div>
        </article>
      </section>

      {/* Notices */}
      {notice ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-emerald-600">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-black text-emerald-700">{notice}</p>
        </div>
      ) : null}
      {error ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-rose-600">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-black text-rose-700">{error}</p>
        </div>
      ) : null}

      <section className="grid gap-5">
        {/* Hỗ trợ / khiếu nại */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <SectionHeader title="Hỗ trợ / khiếu nại" count={tickets.length} />
          {isLoading ? (
            <div className="grid gap-3 animate-pulse xl:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-40 rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : tickets.length ? (
            <div className="grid gap-3 xl:grid-cols-2">
              {tickets.map((ticket) => (
                <article key={ticket.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-black tracking-wide text-slate-950">{ticket.code}</p>
                      <p className="mt-1 text-sm font-bold text-slate-800">{ticket.title}</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-400">
                        {ticket.guestName} · {ticket.guestEmail}
                      </p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>

                  <div className="mt-3 rounded-lg bg-white px-3 py-2.5">
                    <p className="text-xs leading-5 font-semibold text-slate-600">{ticket.content}</p>
                  </div>

                  <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span className="text-xs font-black uppercase tracking-widest text-emerald-700">Soạn Email phản hồi (Gửi trực tiếp cho khách)</span>
                    </div>
                    <textarea
                      value={replyByTicket[ticket.id] || ticket.adminReply || ''}
                      onChange={(event) => setReplyByTicket((cur) => ({ ...cur, [ticket.id]: event.target.value }))}
                      rows={4}
                      placeholder="Viết nội dung phản hồi chuyên nghiệp và chân thành..."
                      className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                    <div className="mt-3 flex gap-3">
                      <button
                        onClick={() => handleTicket(ticket, 'processing')}
                        className="flex-[0.8] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50 active:scale-[.98]"
                      >
                        Đánh dấu Đang xử lý
                      </button>
                      <button
                        onClick={() => handleTicket(ticket, 'resolved')}
                        className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-black text-white transition hover:bg-emerald-700 active:scale-[.98] shadow-sm shadow-emerald-500/20"
                      >
                        Gửi Email & Đóng ticket
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState message="Chưa có yêu cầu hỗ trợ" />
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminOperations;
