const EMAIL_QUAN_TRI_MAC_DINH = ['quinquin04052005@gmail.com'];

export function laQuanTriVien(user) {
  if (!user) return false;

  const role = String(user.role || user.vaiTro || '').toLowerCase();
  const email = String(user.email || '').toLowerCase();

  return role === 'admin' || role === 'quan_tri' || EMAIL_QUAN_TRI_MAC_DINH.includes(email);
}
