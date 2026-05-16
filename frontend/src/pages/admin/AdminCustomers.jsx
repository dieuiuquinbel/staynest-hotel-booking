// Admin khach hang: tim kiem, xem chi tiet, khoa/mo tai khoan va xoa khach.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
  capNhatKhachHangAdminApi,
  capNhatTrangThaiKhachHangAdminApi,
  layChiTietKhachHangAdminApi,
  layDanhSachKhachHangAdminApi,
  xoaKhachHangAdminApi,
} from '../../services/quanTriApi';
import { dinhDangTien } from '../../utils/dinhDang';

const EMPTY_FORM = {
  full_name: '',
  username: '',
  email: '',
  phone: '',
  status: 'active',
};

function nhanTrangThai(status) {
  return status === 'active' ? 'Äang hoáº¡t Ä‘á»™ng' : 'ÄÃ£ khÃ³a';
}

function AdminCustomers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [notice, setNotice] = useState('');

  const customersQuery = useQuery({
    queryKey: ['admin', 'customers', search, status],
    queryFn: () => layDanhSachKhachHangAdminApi({ search, status, role: 'customer' }),
    staleTime: 30 * 1000,
  });

  const customers = useMemo(() => customersQuery.data || [], [customersQuery.data]);
  const activeCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedId) || customers[0] || null,
    [customers, selectedId],
  );

  const detailQuery = useQuery({
    queryKey: ['admin', 'customers', activeCustomer?.id, 'detail'],
    queryFn: () => layChiTietKhachHangAdminApi(activeCustomer.id),
    enabled: Boolean(activeCustomer?.id),
  });

  useEffect(() => {
    if (!activeCustomer) {
      setForm(EMPTY_FORM);
      return;
    }

    setForm({
      full_name: activeCustomer.full_name || '',
      username: activeCustomer.username || '',
      email: activeCustomer.email || '',
      phone: activeCustomer.phone || '',
      status: activeCustomer.status || 'active',
    });
  }, [activeCustomer]);

  const refreshCustomers = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
  };

  const updateMutation = useMutation({
    mutationFn: () => capNhatKhachHangAdminApi(activeCustomer.id, form),
    onSuccess: () => {
      setNotice('ÄÃ£ cáº­p nháº­t thÃ´ng tin khÃ¡ch hÃ ng.');
      refreshCustomers();
    },
  });

  const statusMutation = useMutation({
    mutationFn: (nextStatus) => capNhatTrangThaiKhachHangAdminApi(activeCustomer.id, nextStatus),
    onSuccess: (_, nextStatus) => {
      setNotice(nextStatus === 'inactive' ? 'ÄÃ£ khÃ³a tÃ i khoáº£n khÃ¡ch hÃ ng.' : 'ÄÃ£ má»Ÿ láº¡i tÃ i khoáº£n khÃ¡ch hÃ ng.');
      refreshCustomers();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => xoaKhachHangAdminApi(activeCustomer.id),
    onSuccess: (result) => {
      setNotice(result.message || 'ÄÃ£ xá»­ lÃ½ tÃ i khoáº£n khÃ¡ch hÃ ng.');
      setSelectedId(null);
      refreshCustomers();
    },
  });

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!activeCustomer) return;
    updateMutation.mutate();
  };

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">KhÃ¡ch hÃ ng</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Quáº£n lÃ½ tÃ i khoáº£n khÃ¡ch</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
              TÃ i khoáº£n chÆ°a cÃ³ Ä‘Æ¡n Ä‘áº·t phÃ²ng sáº½ Ä‘Æ°á»£c xÃ³a khá»i MySQL. TÃ i khoáº£n Ä‘Ã£ cÃ³ Ä‘Æ¡n sáº½ Ä‘Æ°á»£c khÃ³a Ä‘á»ƒ giá»¯ lá»‹ch sá»­ Ä‘áº·t phÃ²ng,
              thanh toÃ¡n vÃ  Ä‘á»‘i soÃ¡t doanh thu.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="TÃ¬m tÃªn, username, email hoáº·c sá»‘ Ä‘iá»‡n thoáº¡i"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none transition focus:border-brand-500"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none transition focus:border-brand-500"
          >
            <option value="all">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
            <option value="active">Äang hoáº¡t Ä‘á»™ng</option>
            <option value="inactive">ÄÃ£ khÃ³a</option>
          </select>
        </div>
      </section>

      {notice ? <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">{notice}</div> : null}
      {customersQuery.isError ? <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">KhÃ´ng táº£i Ä‘Æ°á»£c danh sÃ¡ch khÃ¡ch hÃ ng.</div> : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid grid-cols-[1fr_130px_120px_140px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500 max-lg:hidden">
            <span>KhÃ¡ch hÃ ng</span>
            <span>Äáº·t phÃ²ng</span>
            <span>Tráº¡ng thÃ¡i</span>
            <span>Chi tiÃªu</span>
          </div>

          <div className="divide-y divide-slate-100">
            {customersQuery.isLoading ? (
              <div className="p-5 text-sm font-bold text-slate-500">Äang táº£i khÃ¡ch hÃ ng...</div>
            ) : customers.length ? (
              customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => setSelectedId(customer.id)}
                  className={`grid w-full gap-3 px-4 py-4 text-left transition hover:bg-sky-50 lg:grid-cols-[1fr_130px_120px_140px] ${
                    activeCustomer?.id === customer.id ? 'bg-sky-50 ring-1 ring-inset ring-brand-200' : 'bg-white'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{customer.full_name}</p>
                    <p className="mt-1 truncate text-xs font-bold text-slate-500">{customer.username} - {customer.email}</p>
                    <p className="mt-1 truncate text-xs font-bold text-slate-500">{customer.phone || 'ChÆ°a cÃ³ sá»‘ Ä‘iá»‡n thoáº¡i'}</p>
                  </div>
                  <p className="text-sm font-black text-slate-700">{customer.booking_count}</p>
                  <span className={`h-fit w-fit rounded-full px-2.5 py-1 text-xs font-black ${customer.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {nhanTrangThai(customer.status)}
                  </span>
                  <p className="text-sm font-black text-brand-700">{dinhDangTien(customer.total_spent)}</p>
                </button>
              ))
            ) : (
              <div className="p-5 text-sm font-bold text-slate-500">KhÃ´ng cÃ³ khÃ¡ch hÃ ng phÃ¹ há»£p.</div>
            )}
          </div>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-5 xl:sticky xl:top-24 xl:self-start">
          {activeCustomer ? (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Chi tiáº¿t khÃ¡ch hÃ ng</p>
                <h3 className="mt-2 text-xl font-black text-slate-950">{activeCustomer.full_name}</h3>
                <p className="mt-1 text-sm font-bold text-slate-500">ID #{activeCustomer.id}</p>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">TÃªn hiá»ƒn thá»‹</span>
                <input value={form.full_name} onChange={(event) => updateForm('full_name', event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none focus:border-brand-500" />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">Username</span>
                <input value={form.username} onChange={(event) => updateForm('username', event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none focus:border-brand-500" />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">Email</span>
                <input type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none focus:border-brand-500" />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">Sá»‘ Ä‘iá»‡n thoáº¡i</span>
                <input value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none focus:border-brand-500" />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">Tráº¡ng thÃ¡i</span>
                <select value={form.status} onChange={(event) => updateForm('status', event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none focus:border-brand-500">
                  <option value="active">Äang hoáº¡t Ä‘á»™ng</option>
                  <option value="inactive">ÄÃ£ khÃ³a</option>
                </select>
              </label>

              <button type="submit" disabled={updateMutation.isPending} className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-black text-white transition hover:bg-brand-700 disabled:bg-slate-300">
                {updateMutation.isPending ? 'Äang lÆ°u...' : 'LÆ°u thay Ä‘á»•i'}
              </button>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate(activeCustomer.status === 'active' ? 'inactive' : 'active')}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
                >
                  {activeCustomer.status === 'active' ? 'KhÃ³a' : 'Má»Ÿ khÃ³a'}
                </button>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (window.confirm('TÃ i khoáº£n chÆ°a cÃ³ Ä‘Æ¡n sáº½ bá»‹ xÃ³a khá»i MySQL. TÃ i khoáº£n Ä‘Ã£ cÃ³ Ä‘Æ¡n sáº½ Ä‘Æ°á»£c khÃ³a Ä‘á»ƒ giá»¯ lá»‹ch sá»­ Ä‘áº·t phÃ²ng. Tiáº¿p tá»¥c?')) {
                      deleteMutation.mutate();
                    }
                  }}
                  className="rounded-xl border border-rose-200 bg-white px-3 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-50"
                >
                  XÃ³a / khÃ³a
                </button>
              </div>

              <section className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-950">Lá»‹ch sá»­ Ä‘áº·t gáº§n Ä‘Ã¢y</p>
                <div className="mt-3 grid gap-2">
                  {detailQuery.data?.bookings?.length ? (
                    detailQuery.data.bookings.slice(0, 5).map((booking) => (
                      <div key={booking.booking_code} className="rounded-lg bg-white p-3">
                        <p className="text-xs font-black text-slate-950">{booking.booking_code}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">{booking.hotel_name} - {booking.booking_status}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm font-bold text-slate-500">ChÆ°a cÃ³ booking.</p>
                  )}
                </div>
              </section>
            </form>
          ) : (
            <p className="text-sm font-bold text-slate-500">Chá»n má»™t khÃ¡ch hÃ ng Ä‘á»ƒ xem vÃ  chá»‰nh sá»­a.</p>
          )}
        </aside>
      </section>
    </div>
  );
}

export default AdminCustomers;
