// Chức năng: Component hiển thị trang thông tin về các chính sách của công ty (bảo mật, đặt phòng, hủy phòng...).
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CHINH_SACH = [
  {
    id: 'chat-luong',
    title: 'Chính sách chất lượng',
    content: `Tại DieuBel, chúng tôi cam kết mang đến trải nghiệm lưu trú hoàn hảo nhất cho khách hàng. Hệ thống phòng nghỉ luôn được vệ sinh sạch sẽ, bảo trì định kỳ và trang bị đầy đủ tiện nghi hiện đại. Đội ngũ nhân viên được đào tạo chuyên nghiệp, luôn sẵn sàng phục vụ với thái độ tận tâm và thân thiện. Mọi phản hồi của khách hàng đều được chúng tôi trân trọng và xem xét kỹ lưỡng để không ngừng cải thiện chất lượng dịch vụ.`,
  },
  {
    id: 'bao-mat',
    title: 'Chính sách bảo mật thông tin',
    content: `Chúng tôi cam kết bảo vệ tuyệt đối thông tin cá nhân của khách hàng. Dữ liệu của quý khách chỉ được sử dụng cho mục đích xác nhận đặt phòng, hỗ trợ thanh toán và gửi các ưu đãi nếu được sự đồng ý. DieuBel áp dụng các công nghệ mã hóa tiên tiến nhất để đảm bảo thông tin giao dịch và tài khoản không bị rò rỉ cho bất kỳ bên thứ ba nào khi chưa có sự cho phép bằng văn bản từ khách hàng.`,
  },
  {
    id: 'dat-phong',
    title: 'Chính sách đặt phòng',
    content: `Khách hàng có thể dễ dàng đặt phòng qua website, ứng dụng di động hoặc gọi điện trực tiếp. Để đảm bảo giữ phòng, quý khách có thể cần thanh toán trước một khoản cọc tương đương 10% giá trị đơn đặt hoặc thanh toán toàn bộ. Giá phòng hiển thị trên website đã bao gồm các loại thuế, phí cơ bản và luôn minh bạch trước khi quý khách xác nhận thanh toán. Thời gian nhận phòng tiêu chuẩn là 14:00 và trả phòng là 12:00 trưa hôm sau.`,
  },
  {
    id: 'huy-phong',
    title: 'Chính sách hủy phòng',
    content: `Khách hàng có thể yêu cầu hủy phòng thông qua mục "Đặt chỗ của tôi" trên website. Nếu hủy trước 48 giờ so với giờ nhận phòng, quý khách sẽ được hoàn lại 100% số tiền đã thanh toán trừ đi một khoản phí xử lý giao dịch nhỏ (nếu có). Đối với các yêu cầu hủy sát ngày hoặc không đến nhận phòng (No-show), hệ thống sẽ áp dụng mức phí phạt tương đương 20% giá trị đơn đặt phòng hoặc toàn bộ tiền cọc tùy thuộc vào điều kiện cụ thể của từng loại phòng.`,
  },
  {
    id: 'thanh-toan',
    title: 'Hướng dẫn thanh toán',
    content: `DieuBel hỗ trợ đa dạng các phương thức thanh toán nhằm mang lại sự tiện lợi tối đa cho khách hàng:
- Thanh toán trực tuyến qua thẻ tín dụng/ghi nợ (Visa, Mastercard).
- Chuyển khoản ngân hàng qua mã VietQR tự động xác nhận.
- Thanh toán bằng ví điện tử.
- Đối với thanh toán trả sau, quý khách vui lòng thanh toán tại quầy lễ tân khi làm thủ tục nhận phòng hoặc trả phòng. Mọi giao dịch trực tuyến đều được đảm bảo an toàn tuyệt đối.`,
  }
];

function ChinhSachCongTy() {
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
          <h1 className="text-4xl font-black tracking-tight text-slate-950">Chính sách công ty</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Tổng hợp các chính sách, quy định và hướng dẫn của hệ thống khách sạn DieuBel.
          </p>
        </div>

        <div className="mt-12 grid gap-8">
          {CHINH_SACH.map((policy) => (
            <section
              key={policy.id}
              id={policy.id}
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
            >
              <h2 className="text-2xl font-black text-brand-700">{policy.title}</h2>
              <div className="mt-4 text-base leading-relaxed text-slate-700 whitespace-pre-wrap">
                {policy.content}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

export default ChinhSachCongTy;
