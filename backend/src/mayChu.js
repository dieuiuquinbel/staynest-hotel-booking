// Diem khoi dong backend: nap bien moi truong, tao admin mac dinh va lang nghe HTTP.
require('dotenv').config();

const ungDung = require('./ungDung');
const { taoHoacCapNhatQuanTriMacDinh } = require('./modules/auth/xacThuc.service');

const cong = Number(process.env.PORT) || 5000;

async function khoiDongMayChu() {
  try {
    const admin = await taoHoacCapNhatQuanTriMacDinh();
    console.log(`Default admin ready: ${admin.username} / ${admin.email}`);
  } catch (error) {
    console.warn(`Default admin seed skipped: ${error.message}`);
  }

  ungDung.listen(cong, () => {
    console.log(`Server is running at http://localhost:${cong}`);
  });
}

khoiDongMayChu();
