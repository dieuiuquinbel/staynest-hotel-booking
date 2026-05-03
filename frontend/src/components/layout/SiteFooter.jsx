import { Link } from 'react-router-dom';

const POPULAR_LINKS = [
  'Khách sạn TP. Hồ Chí Minh',
  'Khách sạn Phú Quốc',
  'Khách sạn Hà Nội',
  'Khách sạn Đà Nẵng',
  'Khách sạn Nha Trang',
  'Khách sạn Đà Lạt',
  'Khách sạn Sa Pa',
  'Khách sạn Hội An',
  'Resort biển',
  'Căn hộ trung tâm',
  'Phòng gia đình',
  'Khách sạn có bữa sáng',
];

const FOOTER_COLUMNS = [
  {
    title: 'Hỗ trợ khách hàng',
    links: ['Quản lý đặt chỗ', 'Hướng dẫn đặt phòng', 'Hỗ trợ thanh toán', 'Câu hỏi thường gặp'],
  },
  {
    title: 'Tài khoản',
    links: [
      { label: 'Đăng nhập', to: '/auth?mode=login' },
      { label: 'Đăng ký', to: '/auth?mode=register' },
      { label: 'Đặt chỗ của tôi', to: '/my-bookings' },
      { label: 'Lịch sử đã xem', to: '/history' },
    ],
  },
  {
    title: 'Khám phá',
    links: ['Khách sạn biển', 'Resort nghỉ dưỡng', 'Căn hộ trung tâm', 'Phòng gia đình'],
  },
];

const TRUST_POINTS = [
  'Xác nhận đặt phòng qua email',
  'Hóa đơn lưu tự động cho admin',
  'Giá rõ ràng trước khi đặt',
  'Hỗ trợ khách hàng hằng ngày',
];

function FooterLink({ item }) {
  if (typeof item === 'string') {
    return (
      <button type="button" className="text-left text-sm leading-6 text-slate-600 transition hover:text-brand-700">
        {item}
      </button>
    );
  }

  return (
    <Link to={item.to} className="text-left text-sm leading-6 text-slate-600 transition hover:text-brand-700">
      {item.label}
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Phổ biến với du khách Việt Nam</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Thành phố trong nước', 'Khu nghỉ mát', 'Căn hộ', 'Resort', 'Phòng gia đình'].map((tab, index) => (
              <span
                key={tab}
                className={`rounded-full border px-4 py-2 text-sm font-bold ${
                  index === 0 ? 'border-brand-600 bg-sky-50 text-brand-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                {tab}
              </span>
            ))}
          </div>
          <div className="mt-6 grid gap-x-8 gap-y-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
            {POPULAR_LINKS.map((link) => (
              <button key={link} type="button" className="text-left transition hover:text-brand-700">
                {link}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {TRUST_POINTS.map((point) => (
            <div key={point} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
              {point}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.25fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="premium-logo">DB</div>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-slate-950">DieuBel</p>
                <p className="text-sm font-semibold text-slate-500">Căn hộ, khách sạn, resort</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
              DieuBel hỗ trợ tìm chỗ ở, đặt phòng nhanh, gửi xác nhận qua email và lưu hóa đơn cho quản trị viên.
            </p>
            <div className="mt-5 grid gap-2 text-sm text-slate-600">
              <p>
                <span className="font-black text-slate-950">Hotline:</span> 0345 583 772
              </p>
              <p>
                <span className="font-black text-slate-950">Email:</span> quinquin04052005@gmail.com
              </p>
              <p>
                <span className="font-black text-slate-950">Khu vực hỗ trợ:</span> Việt Nam
              </p>
              <p>
                <span className="font-black text-slate-950">Thời gian:</span> 08:00 - 22:00 hằng ngày
              </p>
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-black text-slate-950">{column.title}</h3>
              <div className="mt-4 grid gap-2">
                {column.links.map((link) => (
                  <FooterLink key={typeof link === 'string' ? link : link.label} item={link} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-5 text-xs font-semibold text-slate-500 sm:px-6">
          <p>© 2026 DieuBel. Website đặt phòng khách sạn demo.</p>
          <p>Thanh toán tại khách sạn, email xác nhận tự động và hóa đơn lưu trong hệ thống.</p>
        </div>
      </section>
    </footer>
  );
}

export default SiteFooter;
