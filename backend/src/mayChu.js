require('dotenv').config();

const ungDung = require('./ungDung');

const cong = Number(process.env.PORT) || 5000;

ungDung.listen(cong, () => {
  console.log(`Server is running at http://localhost:${cong}`);
});
