// Chức năng: Component hiển thị trang giới thiệu về công ty, tuyển dụng, hợp tác và góp ý.
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const THONG_TIN = [
  {
    id: 'gioi-thieu',
    title: 'Giới thiệu công ty',
    content: `DieuBel được thành lập với sứ mệnh mang đến cho khách hàng những trải nghiệm lưu trú tuyệt vời nhất tại các điểm đến hàng đầu Việt Nam. Khởi nguồn từ một căn hộ nhỏ, đến nay DieuBel đã vươn mình trở thành một trong những hệ thống khách sạn, resort nghỉ dưỡng uy tín, phục vụ hàng ngàn du khách mỗi năm. Chúng tôi luôn đặt sự hài lòng của khách hàng làm thước đo cho sự thành công.`,
  },
  {
    id: 'tuyen-dung',
    title: 'Tuyển dụng',
    content: `DieuBel luôn mở rộng cửa chào đón những nhân tài đam mê ngành dịch vụ khách sạn. Chúng tôi mang đến môi trường làm việc chuyên nghiệp, năng động, cơ hội thăng tiến rõ ràng cùng mức đãi ngộ hấp dẫn. Nếu bạn có tinh thần phục vụ, yêu thích sự sáng tạo và muốn đồng hành cùng chúng tôi trên chặng đường phát triển sắp tới, hãy gửi CV về hòm thư tuyển dụng của DieuBel.`,
  },
  {
    id: 'gop-y',
    title: 'Góp ý, khiếu nại',
    content: `Mọi ý kiến đóng góp của quý khách đều là tài sản vô giá giúp DieuBel hoàn thiện dịch vụ mỗi ngày. Nếu có bất kỳ sự không hài lòng nào trong quá trình lưu trú hoặc đặt phòng, xin vui lòng liên hệ ngay với bộ phận Chăm sóc khách hàng qua hotline 0345.583.772 hoặc email. Chúng tôi cam kết tiếp nhận và giải quyết thỏa đáng mọi vấn đề của bạn trong thời gian sớm nhất.`,
  },
  {
    id: 'hop-tac',
    title: 'Liên hệ hợp tác',
    content: `DieuBel luôn trân trọng và mong muốn thiết lập mối quan hệ hợp tác lâu dài, cùng có lợi với các đối tác, nhà cung cấp, cũng như các đại lý du lịch (OTA, Travel Agents). Để trao đổi về các cơ hội kinh doanh, nhượng quyền thương hiệu hoặc cung cấp dịch vụ, xin vui lòng gửi hồ sơ năng lực về địa chỉ email đối tác của chúng tôi.`,
  }
];

function ThongTinCongTy() {
  const { hash } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [hash]);

  return (
    <main className="flex-1 bg-slate-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight text-slate-950">Thông tin công ty</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Tìm hiểu thêm về tầm nhìn, sứ mệnh và các thông tin liên hệ của DieuBel.
          </p>
        </div>

        <div className="mt-12 grid gap-8">
          {THONG_TIN.map((item) => (
            <section
              key={item.id}
              id={item.id}
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
            >
              <h2 className="text-2xl font-black text-brand-700">{item.title}</h2>
              <div className="mt-4 text-base leading-relaxed text-slate-700 whitespace-pre-wrap">
                {item.content}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

export default ThongTinCongTy;
