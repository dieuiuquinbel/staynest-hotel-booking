import { useQuery } from '@tanstack/react-query';
import ketNoiApi from '../services/ketNoiApi';
import { dinhDangTien } from '../utils/dinhDang';

async function layHoaDonAdminApi() {
  const response = await ketNoiApi.get('/admin/invoices');
  return response.data.data;
}

async function taiHoaDonAdmin(invoice) {
  const response = await ketNoiApi.get(`/admin/invoices/${invoice.id}/download`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${invoice.invoice_code}.html`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function AdminInvoices() {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'invoices'],
    queryFn: layHoaDonAdminApi,
    staleTime: 60 * 1000,
  });

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Hóa đơn</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Tra cứu hóa đơn</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
          Danh sách hóa đơn sinh từ các đơn đặt phòng. Admin có thể tải file HTML hóa đơn để kiểm tra hoặc gửi lại cho khách.
        </p>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {isLoading ? <div className="p-5 text-sm font-bold text-slate-500">Đang tải hóa đơn...</div> : null}
        {isError ? <div className="p-5 text-sm font-bold text-rose-700">Không tải được hóa đơn.</div> : null}
        {!isLoading && !isError ? (
          <div className="divide-y divide-slate-100">
            {data.map((invoice) => (
              <article key={invoice.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_1fr_160px_120px]">
                <div>
                  <p className="text-sm font-black text-slate-950">{invoice.invoice_code}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{invoice.booking_code}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{invoice.full_name}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{invoice.email}</p>
                </div>
                <p className="text-sm font-black text-brand-700">{dinhDangTien(invoice.total_amount)}</p>
                <button
                  type="button"
                  onClick={() => taiHoaDonAdmin(invoice)}
                  className="h-fit rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-sm font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
                >
                  Tải
                </button>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default AdminInvoices;
