// Chức năng: Panel chuyên biệt cho tab "Cần xử lý" — Hoàn tiền/Hủy đơn + Khiếu nại.
// Layout 2 cột: Cột trái là danh sách, cột phải là panel chi tiết động.
import { useState, useEffect, useCallback } from 'react';
import { dinhDangNgay, dinhDangNgayGio, dinhDangTien } from '../../../utils/dinhDang';
import {
  layYeuCauHoanTienAdminApi,
  capNhatYeuCauHoanTienAdminApi,
  layYeuCauHoTroAdminApi,
  capNhatYeuCauHoTroAdminApi,
} from '../../../services/datPhongApi';
import { MAU_TRANG_THAI_HOAN_TIEN, NHAN_HOAN_TIEN } from './bookingConstants';

// ─── Badge nhỏ ───────────────────────────────────────────────────
function Badge({ children, cls }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black ${cls}`}>
      {children}
    </span>
  );
}

// ─── Skeleton Loading ─────────────────────────────────────────────
function SkeletonList() {
  return (
    <div className="grid gap-2.5 animate-pulse p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 p-4">
          <div className="flex justify-between gap-3">
            <div className="grid gap-2 flex-1">
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="h-4 w-36 rounded bg-slate-200" />
              <div className="h-3 w-48 rounded bg-slate-100" />
            </div>
            <div className="h-5 w-20 rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Panel phải: Hoàn tiền / Hủy đơn ─────────────────────────────
function PanelHoanTien({ refund, onUpdate }) {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    setNote('');
    setLocalError('');
  }, [refund?.id]);

  if (!refund) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-full p-12 text-center">
        <span className="text-4xl">🔄</span>
        <p className="text-sm font-bold text-slate-400">Chọn một yêu cầu hoàn tiền để xem chi tiết</p>
      </div>
    );
  }

  const isPending = refund.status === 'pending';

  const handleDecision = async (status) => {
    const label = status === 'approved' ? 'Duyệt hoàn tiền' : 'Từ chối';
    if (!window.confirm(`${label} yêu cầu của khách ${refund.guestName}?`)) return;
    setIsSubmitting(true);
    setLocalError('');
    try {
      await onUpdate(refund.id, status, note);
    } catch (err) {
      setLocalError(err?.response?.data?.message || 'Thao tác thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 grid gap-4 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Yêu cầu hoàn tiền</p>
          <p className="mt-1 font-mono text-base font-black text-slate-900">{refund.code}</p>
          <p className="mt-0.5 text-sm font-bold text-slate-600">{refund.guestName}</p>
          <p className="text-[11px] text-slate-400">{refund.guestEmail}</p>
        </div>
        <Badge cls={MAU_TRANG_THAI_HOAN_TIEN[refund.status] || 'bg-slate-100 text-slate-600'}>
          {NHAN_HOAN_TIEN[refund.status] || refund.status}
        </Badge>
      </div>

      {/* Thông tin đặt phòng */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3.5">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Thông tin đặt phòng</p>
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400">Khách sạn</p>
            <p className="text-xs font-black text-slate-800 mt-0.5">{refund.hotelName}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Phòng</p>
            <p className="text-xs font-black text-slate-800 mt-0.5">{refund.roomName}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Nhận phòng</p>
            <p className="text-xs font-black text-slate-800 mt-0.5">{dinhDangNgay(refund.checkIn)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400">Trả phòng</p>
            <p className="text-xs font-black text-slate-800 mt-0.5">{dinhDangNgay(refund.checkOut)}</p>
          </div>
        </div>
      </div>

      {/* Phân tích tiền */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <p className="text-[9px] font-bold text-slate-400">Đã cọc</p>
          <p className="mt-1 text-[11px] font-black text-slate-900">{dinhDangTien(refund.paidAmount)}</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-3 text-center shadow-sm">
          <p className="text-[9px] font-bold text-rose-500">Phí hủy 20%</p>
          <p className="mt-1 text-[11px] font-black text-rose-700">{dinhDangTien(refund.cancelFeeAmount)}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-3 text-center shadow-sm">
          <p className="text-[9px] font-bold text-emerald-600">Hoàn lại 80%</p>
          <p className="mt-1 text-[11px] font-black text-emerald-700">{dinhDangTien(refund.refundAmount)}</p>
        </div>
      </div>

      {/* Tài khoản nhận */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Tài khoản nhận hoàn tiền</p>
        <p className="text-xs font-black text-slate-800">{refund.bankName}</p>
        <p className="text-xs font-bold text-slate-600 mt-0.5">Số TK: {refund.bankAccountNumber}</p>
        <p className="text-xs font-bold text-slate-600">Chủ TK: {refund.bankAccountName}</p>
      </div>

      {/* Lý do hủy */}
      {refund.reason && (
        <div className="rounded-xl bg-orange-50 border border-orange-200 px-3.5 py-2.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-orange-600 mb-1">Lý do của khách</p>
          <p className="text-xs font-semibold text-orange-900 italic">{refund.reason}</p>
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div className="grid gap-2.5 border-t border-slate-100 pt-4">
          {localError && (
            <p className="text-xs font-bold text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{localError}</p>
          )}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Ghi chú phản hồi cho khách (không bắt buộc)..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none transition focus:border-sky-400 resize-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={isSubmitting}
              onClick={() => handleDecision('approved')}
              className="rounded-xl bg-emerald-600 py-3 text-sm font-black text-white transition hover:bg-emerald-700 active:scale-95 shadow-sm disabled:opacity-50"
            >
              ✓ Duyệt hoàn tiền
            </button>
            <button
              disabled={isSubmitting}
              onClick={() => handleDecision('rejected')}
              className="rounded-xl border border-rose-300 bg-white py-3 text-sm font-black text-rose-700 transition hover:bg-rose-50 active:scale-95 disabled:opacity-50"
            >
              ✕ Từ chối
            </button>
          </div>
        </div>
      )}

      {!isPending && refund.adminNote && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Ghi chú admin</p>
          <p className="text-xs font-semibold text-slate-700">{refund.adminNote}</p>
        </div>
      )}
    </div>
  );
}

// ─── Panel phải: Khiếu nại / Phản hồi ────────────────────────────
function PanelKhieuNai({ ticket, onUpdate }) {
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    setReply('');
    setLocalError('');
    setSentSuccess(false);
  }, [ticket?.id]);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-full p-12 text-center">
        <span className="text-4xl">💬</span>
        <p className="text-sm font-bold text-slate-400">Chọn một khiếu nại để xem và phản hồi</p>
      </div>
    );
  }

  const handleSend = async () => {
    if (!reply.trim()) {
      setLocalError('Vui lòng nhập nội dung phản hồi trước khi gửi.');
      return;
    }
    setIsSubmitting(true);
    setLocalError('');
    try {
      await onUpdate(ticket.id, 'replied', reply.trim());
      setSentSuccess(true);
    } catch (err) {
      setLocalError(err?.response?.data?.message || 'Không thể gửi email phản hồi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusMap = {
    open: { label: 'Chưa xử lý', cls: 'bg-rose-50 text-rose-700' },
    replied: { label: 'Đã phản hồi', cls: 'bg-emerald-50 text-emerald-700' },
    closed: { label: 'Đã đóng', cls: 'bg-slate-100 text-slate-500' },
  };
  const statusInfo = statusMap[ticket.status] || { label: ticket.status, cls: 'bg-slate-100 text-slate-600' };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header khiếu nại */}
      <div className="flex-none border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Khiếu nại</p>
            <p className="mt-1 text-sm font-black text-slate-900 truncate">{ticket.title}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">👤 {ticket.guestName}</span>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-bold text-slate-400">{ticket.guestEmail}</span>
            </div>
            {ticket.createdAt && (
              <p className="text-[10px] text-slate-400 mt-0.5">🕐 {dinhDangNgayGio(ticket.createdAt)}</p>
            )}
          </div>
          <Badge cls={statusInfo.cls}>{statusInfo.label}</Badge>
        </div>
      </div>

      {/* Nội dung cuộn được */}
      <div className="flex-1 overflow-y-auto p-5 grid gap-4">

        {/* Nội dung khiếu nại của khách */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Nội dung khách gửi</p>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.content}</p>
          </div>
        </div>

        {/* Nếu đã có admin reply trước đó */}
        {ticket.adminReply && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-2">Phản hồi trước đây</p>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <p className="text-sm text-emerald-800 leading-relaxed whitespace-pre-wrap">{ticket.adminReply}</p>
              {ticket.repliedAt && (
                <p className="text-[10px] text-emerald-500 mt-2">✉️ Đã gửi lúc {dinhDangNgayGio(ticket.repliedAt)}</p>
              )}
            </div>
          </div>
        )}

        {/* Ô admin trả lời */}
        {!sentSuccess ? (
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              {ticket.adminReply ? 'Gửi phản hồi tiếp theo' : 'Trả lời khách hàng'}
            </p>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={5}
              placeholder={`Kính gửi ${ticket.guestName},\n\nCảm ơn quý khách đã liên hệ...\n\nTrân trọng,\nĐội ngũ DieuBel Hotel`}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-50 resize-none leading-relaxed"
            />
            {localError && (
              <p className="mt-2 text-xs font-bold text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{localError}</p>
            )}
            <button
              disabled={isSubmitting || !reply.trim()}
              onClick={handleSend}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-black text-white transition hover:bg-slate-800 active:scale-[.98] shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang gửi...
                </>
              ) : (
                <>📧 Gửi email phản hồi ngay</>
              )}
            </button>
            <p className="mt-1.5 text-center text-[10px] text-slate-400">
              Email sẽ được gửi đến: <span className="font-bold text-slate-600">{ticket.guestEmail}</span>
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm font-black text-emerald-700">Đã gửi email phản hồi thành công!</p>
            <p className="text-xs text-emerald-600 mt-1">Email đã được gửi đến {ticket.guestEmail}</p>
            <button
              onClick={() => setSentSuccess(false)}
              className="mt-3 text-xs font-bold text-emerald-600 underline hover:text-emerald-700"
            >
              Gửi thêm phản hồi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Component chính ──────────────────────────────────────────────
export default function CanXuLyPanel({ onGlobalRefresh }) {
  const [subTab, setSubTab] = useState('refund'); // 'refund' | 'ticket'

  // Data hoàn tiền
  const [refunds, setRefunds] = useState([]);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [refundLoading, setRefundLoading] = useState(true);

  // Data khiếu nại
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketLoading, setTicketLoading] = useState(true);

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Load dữ liệu
  const loadRefunds = useCallback(async () => {
    setRefundLoading(true);
    try {
      const data = await layYeuCauHoanTienAdminApi();
      setRefunds(data);
    } catch {
      setError('Không tải được danh sách hoàn tiền.');
    } finally {
      setRefundLoading(false);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    setTicketLoading(true);
    try {
      const data = await layYeuCauHoTroAdminApi();
      setTickets(data);
    } catch {
      setError('Không tải được danh sách khiếu nại.');
    } finally {
      setTicketLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRefunds();
    loadTickets();
  }, [loadRefunds, loadTickets]);

  // Xử lý duyệt/từ chối hoàn tiền
  const handleRefundUpdate = async (refundId, status, note) => {
    const updated = await capNhatYeuCauHoanTienAdminApi(refundId, status, note);
    setRefunds(updated);
    const found = updated.find((r) => r.id === refundId);
    setSelectedRefund(found || null);
    setNotice(status === 'approved' ? 'Đã duyệt yêu cầu hoàn tiền.' : 'Đã từ chối yêu cầu hoàn tiền.');
    if (onGlobalRefresh) onGlobalRefresh();
  };

  // Xử lý gửi phản hồi khiếu nại
  const handleTicketUpdate = async (ticketId, status, reply) => {
    const updated = await capNhatYeuCauHoTroAdminApi(ticketId, status, reply);
    setTickets(updated);
    const found = updated.find((t) => t.id === ticketId);
    setSelectedTicket(found || null);
  };

  const pendingRefunds = refunds.filter((r) => r.status === 'pending');
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'open');

  return (
    <div className="grid gap-4">
      {/* Notices */}
      {notice && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-emerald-600">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-black text-emerald-700">{notice}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-rose-600">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-black text-rose-700">{error}</p>
        </div>
      )}

      {/* Layout 2 cột */}
      <div className="grid gap-5 xl:grid-cols-2 items-start">

        {/* ===== Cột trái: Điều hướng + Danh sách ===== */}
        <div
          className="rounded-xl border border-slate-200 bg-white flex flex-col overflow-hidden"
          style={{ height: 'calc(100vh - 260px)', minHeight: '480px' }}
        >
          {/* Sub-tabs */}
          <div className="flex-none border-b border-slate-100 p-3 flex gap-2">
            <button
              type="button"
              onClick={() => { setSubTab('refund'); setSelectedRefund(null); }}
              className={`flex-1 rounded-xl py-3 text-center text-sm font-black transition-all relative ${
                subTab === 'refund'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              🔄 Hoàn tiền / Hủy đơn
              {pendingRefunds.length > 0 && (
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-black ${subTab === 'refund' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'}`}>
                  {pendingRefunds.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setSubTab('ticket'); setSelectedTicket(null); }}
              className={`flex-1 rounded-xl py-3 text-center text-sm font-black transition-all relative ${
                subTab === 'ticket'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              💬 Khiếu nại
              {openTickets.length > 0 && (
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-black ${subTab === 'ticket' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
                  {openTickets.length}
                </span>
              )}
            </button>
          </div>

          {/* Danh sách */}
          <div className="flex-1 overflow-y-auto">

            {/* Danh sách hoàn tiền */}
            {subTab === 'refund' && (
              refundLoading ? <SkeletonList /> : (
                refunds.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 p-12 text-center">
                    <span className="text-3xl">🎉</span>
                    <p className="text-sm font-bold text-slate-400">Không có yêu cầu hoàn tiền nào</p>
                  </div>
                ) : (
                  <div className="p-3 grid gap-2">
                    {refunds.map((refund) => {
                      const isSelected = selectedRefund?.id === refund.id;
                      const isPending = refund.status === 'pending';
                      return (
                        <button
                          key={refund.id}
                          type="button"
                          onClick={() => setSelectedRefund(refund)}
                          className={`w-full rounded-xl border p-4 text-left transition-all ${
                            isSelected
                              ? 'border-slate-800 bg-slate-950 text-white shadow-lg'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <p className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                {refund.guestName}
                              </p>
                              <p className={`font-mono text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                {refund.code}
                              </p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${
                              isSelected
                                ? (isPending ? 'bg-orange-400/30 text-orange-200' : 'bg-white/10 text-slate-300')
                                : (MAU_TRANG_THAI_HOAN_TIEN[refund.status] || 'bg-slate-100 text-slate-600')
                            }`}>
                              {NHAN_HOAN_TIEN[refund.status] || refund.status}
                            </span>
                          </div>
                          <div className={`grid grid-cols-2 gap-1 text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            <span>{refund.hotelName}</span>
                            <span className={`text-right font-black ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`}>
                              Hoàn: {dinhDangTien(refund.refundAmount)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )
              )
            )}

            {/* Danh sách khiếu nại */}
            {subTab === 'ticket' && (
              ticketLoading ? <SkeletonList /> : (
                tickets.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 p-12 text-center">
                    <span className="text-3xl">🎉</span>
                    <p className="text-sm font-bold text-slate-400">Không có khiếu nại nào</p>
                  </div>
                ) : (
                  <div className="p-3 grid gap-2">
                    {tickets.map((ticket) => {
                      const isSelected = selectedTicket?.id === ticket.id;
                      const isOpen = ticket.status === 'open';
                      return (
                        <button
                          key={ticket.id}
                          type="button"
                          onClick={() => setSelectedTicket(ticket)}
                          className={`w-full rounded-xl border p-4 text-left transition-all ${
                            isSelected
                              ? 'border-slate-800 bg-slate-950 text-white shadow-lg'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <p className={`text-xs font-black truncate flex-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                              {ticket.title}
                            </p>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${
                              isSelected
                                ? 'bg-white/10 text-slate-300'
                                : isOpen ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {isOpen ? 'Chưa xử lý' : 'Đã phản hồi'}
                            </span>
                          </div>
                          <p className={`text-[10px] font-bold ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            👤 {ticket.guestName}
                          </p>
                          <p className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                            {ticket.content}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )
              )
            )}
          </div>
        </div>

        {/* ===== Cột phải: Panel chi tiết động ===== */}
        <div
          className="rounded-xl border border-slate-200 bg-white overflow-hidden xl:sticky xl:top-6"
          style={{ height: 'calc(100vh - 260px)', minHeight: '480px' }}
        >
          {subTab === 'refund' ? (
            <PanelHoanTien refund={selectedRefund} onUpdate={handleRefundUpdate} />
          ) : (
            <PanelKhieuNai ticket={selectedTicket} onUpdate={handleTicketUpdate} />
          )}
        </div>
      </div>
    </div>
  );
}
