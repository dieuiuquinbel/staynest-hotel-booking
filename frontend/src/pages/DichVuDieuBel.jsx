import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DICH_VU = [
  {
    id: 'khach-san-bien',
    title: 'Khách sạn biển',
    content: `Hệ thống Khách sạn biển DieuBel sở hữu vị trí đắc địa ngay sát bờ biển, mang đến tầm nhìn panorama ôm trọn đại dương xanh thẳm. Các phòng nghỉ được thiết kế theo phong cách nhiệt đới hiện đại, không gian mở ngập tràn ánh sáng tự nhiên. Du khách có thể dễ dàng tận hưởng làn gió biển mát rượi, thưởng thức hải sản tươi ngon tại nhà hàng ven biển, và trải nghiệm các hoạt động thể thao dưới nước sôi động.`,
  },
  {
    id: 'resort',
    title: 'Resort nghỉ dưỡng',
    content: `Khu Resort nghỉ dưỡng DieuBel là thiên đường biệt lập dành cho những tâm hồn cần tìm sự bình yên. Được bao bọc bởi những khu vườn xanh mát và hồ bơi vô cực rộng lớn, resort mang đến không gian thư giãn tuyệt đối. Chúng tôi cung cấp chuỗi dịch vụ chăm sóc sức khỏe cao cấp bao gồm Spa trị liệu thiên nhiên, Yoga buổi sáng và thực đơn Detox thanh lọc cơ thể, giúp quý khách tái tạo năng lượng hoàn hảo.`,
  },
  {
    id: 'can-ho',
    title: 'Căn hộ trung tâm',
    content: `Dành riêng cho những chuyến công tác hoặc kỳ nghỉ cần sự thuận tiện tối đa, chuỗi Căn hộ trung tâm DieuBel tọa lạc tại những vị trí "trái tim" của thành phố. Căn hộ được thiết kế đầy đủ tiện nghi như một ngôi nhà thu nhỏ với bếp hiện đại, máy giặt, và không gian làm việc chuyên nghiệp. Xung quanh là hệ thống giao thông kết nối, trung tâm thương mại và các điểm vui chơi sầm uất bậc nhất.`,
  },
  {
    id: 'phong-gia-dinh',
    title: 'Phòng gia đình',
    content: `Các hạng Phòng gia đình của DieuBel được thiết kế đặc biệt với không gian siêu rộng rãi, gồm nhiều phòng ngủ nối liền hoặc có khu vực sinh hoạt chung lớn. Chúng tôi thấu hiểu nhu cầu của các gia đình có trẻ em, vì vậy phòng được trang bị các tiện ích an toàn, khu vực chơi mini và thực đơn đặc biệt cho bé. DieuBel luôn đồng hành cùng gia đình bạn lưu giữ những khoảnh khắc gắn kết khó quên.`,
  }
];

function DichVuDieuBel() {
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
          <h1 className="text-4xl font-black tracking-tight text-slate-950">Dịch vụ DieuBel</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Khám phá chuỗi hệ thống lưu trú đa dạng, đẳng cấp và phù hợp với mọi nhu cầu của bạn.
          </p>
        </div>

        <div className="mt-12 grid gap-8">
          {DICH_VU.map((item) => (
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

export default DichVuDieuBel;
