require("dotenv").config();
module.exports = {
  app: {
    name: process.env.APP_NAME || "modular-monolith",
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || "development",
    baseUrl: process.env.BASE_URL || "http://192.168.100.13:3000",
  },
  jwt: {
    accesssecret: process.env.ACCESS_SECRET || "your-secret-key-change-in-production",
    refreshsecret: process.env.REFRESH_SECRET || "your-secret-key-change-in-production",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "8d",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  bcrypt: {
    saltRounds: 10,
  },
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === "true",  
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
    fromName: process.env.EMAIL_FROM_NAME || "Food Delivery App",
  },
  
};

