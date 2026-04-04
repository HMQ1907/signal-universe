const bcrypt = require('bcryptjs'); console.log('Admin:', bcrypt.compareSync('Admin@123', '$2b$10$AESSgK876u7XDe76QbHMAuwj9ZlAWVm3mLppoiZV6YjFc4RGTYwUm'));
