// Chức năng: Khai báo khóa localStorage/sessionStorage dùng chung cho toàn bộ ứng dụng.
// Mỗi khóa được gắn hậu tố phiên bản để tránh xung đột dữ liệu cũ khi cập nhật cấu trúc.
const PHIEN_BAN_DU_LIEU_DEMO = '2026_05_06_clean';

export const KHOA_LUU_TRU = {
  viewedRooms: `dieubel_viewed_rooms_${PHIEN_BAN_DU_LIEU_DEMO}`,
  favoriteRooms: `dieubel_favorite_rooms_${PHIEN_BAN_DU_LIEU_DEMO}`,
  recentSearches: `dieubel_recent_searches_${PHIEN_BAN_DU_LIEU_DEMO}`,

  // --- Điểm thưởng (hệ thống 2 loại điểm) ---
  // rewardPoints: khóa cũ, chỉ dùng để migration lần đầu sang 2 loại mới.
  rewardPoints: `dieubel_reward_points_${PHIEN_BAN_DU_LIEU_DEMO}`,
  // diemThanhTich: tích lũy vĩnh viễn, dùng xếp hạng thành viên, KHÔNG BAO GIỜ GIẢM.
  diemThanhTich: `dieubel_diem_thanh_tich_${PHIEN_BAN_DU_LIEU_DEMO}`,
  // diemTieuDung: điểm có thể tiêu (đổi voucher), tăng song song với thành tích, giảm khi đổi quà.
  diemTieuDung: `dieubel_diem_tieu_dung_${PHIEN_BAN_DU_LIEU_DEMO}`,

  redeemedRewards: `dieubel_redeemed_rewards_${PHIEN_BAN_DU_LIEU_DEMO}`,
};
