
const bcrypt = require('bcrypt');

(async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  console.log('Hashed password:', hashedPassword);
})();
