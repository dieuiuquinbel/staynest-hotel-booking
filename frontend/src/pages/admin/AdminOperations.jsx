// Admin van hanh: xu ly yeu cau hoan tien, ho tro khach hang va bao cao doanh thu.
import { useEffect, useState } from 'react';
import {
  capNhatYeuCauHoanTienAdminApi,
  capNhatYeuCauHoTroAdminApi,
  layBaoCaoDoanhThuAdminApi,
  layYeuCauHoanTienAdminApi,
  layYeuCauHoTroAdminApi,
} from '../../services/datPhongApi';
import { dinhDangNgay, dinhDangTien } from '../../utils/dinhDang';

function StatCard({ label, value, tone = 'text-slate-950' }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
    </article>
  );
}

function AdminOperations() {
  const [report, setReport] = useState(null);
  const [refunds, setRefunds] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [replyByTicket, setReplyByTicket] = useState({});
  const [noteByRefund, setNoteByRefund] = useState({});

  const refresh = async () => {
    setError('');
    try {
      const [nextReport, nextRefunds, nextTickets] = await Promise.all([
        layBaoCaoDoanhThuAdminApi(),
        layYeuCauHoanTienAdminApi(),
        layYeuCauHoTroAdminApi(),
      ]);
      setReport(nextReport);
      setRefunds(nextRefunds);
      setTickets(nextTickets);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'KhÃ´ng táº£i Ä‘Æ°á»£c dá»¯ liá»‡u váº­n hÃ nh tá»« MySQL.');
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleRefund = async (refund, status) => {
    try {
      const data = await capNhatYeuCauHoanTienAdminApi(refund.id, status, noteByRefund[refund.id] || '');
      setRefunds(data);
      await refresh();
      setNotice(status === 'rejected' ? 'ÄÃ£ tá»« chá»‘i yÃªu cáº§u hoÃ n tiá»n.' : 'ÄÃ£ duyá»‡t yÃªu cáº§u hoÃ n tiá»n vÃ  tráº£ phÃ²ng vá» kho.');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'KhÃ´ng cáº­p nháº­t Ä‘Æ°á»£c yÃªu cáº§u hoÃ n tiá»n.');
    }
  };

  const handleTicket = async (ticket, status) => {
    try {
      const data = await capNhatYeuCauHoTroAdminApi(ticket.id, status, replyByTicket[ticket.id] || '');
      setTickets(data);
      setNotice('ÄÃ£ cáº­p nháº­t yÃªu cáº§u há»— trá»£.');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'KhÃ´ng cáº­p nháº­t Ä‘Æ°á»£c yÃªu cáº§u há»— trá»£.');
    }
  };

  const cards = [
    ['Tá»•ng Ä‘Æ¡n', report?.totalBookings || 0],
    ['Doanh thu Ä‘Ã£ thu', dinhDangTien(report?.paidRevenue || 0), 'text-brand-700'],
    ['CÃ²n pháº£i thu', dinhDangTien(report?.receivableAmount || 0)],
    ['Voucher Ä‘Ã£ giáº£m', dinhDangTien(report?.voucherDiscount || 0)],
    ['YÃªu cáº§u hoÃ n tiá»n', report?.refundRequests || 0, 'text-rose-600'],
    ['PhÃ­ há»§y giá»¯ láº¡i', dinhDangTien(report?.cancelFeeRevenue || 0), 'text-emerald-700'],
    ['Dá»± kiáº¿n hoÃ n', dinhDangTien(report?.refundAmount || 0), 'text-amber-700'],
    ['PhÃ²ng cÃ²n trong kho', report?.availableRooms || 0],
  ];

  return (
    <div className="grid gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand-700">Váº­n hÃ nh</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">HoÃ n tiá»n, khiáº¿u náº¡i vÃ  doanh thu</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
              HÃ ng Ä‘á»£i nÃ y tÃ¡ch khá»i báº£ng Ä‘áº·t phÃ²ng Ä‘á»ƒ admin xá»­ lÃ½ yÃªu cáº§u há»§y/hoÃ n tiá»n vÃ  há»— trá»£ khÃ¡ch rÃµ rÃ ng hÆ¡n.
            </p>
          </div>
          <button type="button" onClick={refresh} className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white">
            Táº£i láº¡i
          </button>
        </div>
      </section>

      {notice ? <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">{notice}</div> : null}
      {error ? <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">{error}</div> : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, tone]) => <StatCard key={label} label={label} value={value} tone={tone} />)}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-black text-slate-950">YÃªu cáº§u há»§y / hoÃ n tiá»n</h3>
          <div className="mt-4 grid gap-3">
            {refunds.length ? (
              refunds.map((refund) => (
                <article key={refund.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">{refund.code} Â· {refund.bookingId}</p>
                      <p className="mt-1 font-bold text-slate-600">{refund.guestName} Â· {refund.hotelName}</p>
                      <p className="mt-1 text-slate-500">{dinhDangNgay(refund.checkIn)} - {dinhDangNgay(refund.checkOut)}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-brand-700">{refund.status}</span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <p><strong>ÄÃ£ thu:</strong> {dinhDangTien(refund.paidAmount)}</p>
                    <p><strong>PhÃ­ 20%:</strong> {dinhDangTien(refund.cancelFeeAmount)}</p>
                    <p><strong>HoÃ n 80%:</strong> {dinhDangTien(refund.refundAmount)}</p>
                  </div>
                  <p className="mt-2 text-slate-600">TK: {refund.bankAccountName} Â· {refund.bankName} Â· {refund.bankAccountNumber}</p>
                  {refund.reason ? <p className="mt-2 text-slate-600">LÃ½ do: {refund.reason}</p> : null}
                  <textarea
                    value={noteByRefund[refund.id] || ''}
                    onChange={(event) => setNoteByRefund((current) => ({ ...current, [refund.id]: event.target.value }))}
                    rows={2}
                    placeholder="Ghi chÃº admin"
                    className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold outline-none focus:border-brand-500"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button disabled={refund.status !== 'pending'} onClick={() => handleRefund(refund, 'approved')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white disabled:bg-slate-300">
                      Duyá»‡t hoÃ n tiá»n
                    </button>
                    <button disabled={refund.status !== 'pending'} onClick={() => handleRefund(refund, 'rejected')} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-black text-rose-700 disabled:text-slate-400">
                      Tá»« chá»‘i
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-500">ChÆ°a cÃ³ yÃªu cáº§u hoÃ n tiá»n.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-black text-slate-950">Há»— trá»£ / khiáº¿u náº¡i</h3>
          <div className="mt-4 grid gap-3">
            {tickets.length ? (
              tickets.map((ticket) => (
                <article key={ticket.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">{ticket.code} Â· {ticket.title}</p>
                      <p className="mt-1 font-bold text-slate-600">{ticket.guestName} Â· {ticket.guestEmail}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700">{ticket.status}</span>
                  </div>
                  <p className="mt-3 leading-6 text-slate-600">{ticket.content}</p>
                  <textarea
                    value={replyByTicket[ticket.id] || ticket.adminReply || ''}
                    onChange={(event) => setReplyByTicket((current) => ({ ...current, [ticket.id]: event.target.value }))}
                    rows={3}
                    placeholder="Pháº£n há»“i cho khÃ¡ch"
                    className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold outline-none focus:border-brand-500"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => handleTicket(ticket, 'processing')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700">
                      Äang xá»­ lÃ½
                    </button>
                    <button onClick={() => handleTicket(ticket, 'resolved')} className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-black text-white">
                      Pháº£n há»“i & Ä‘Ã³ng
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-500">ChÆ°a cÃ³ yÃªu cáº§u há»— trá»£.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminOperations;
