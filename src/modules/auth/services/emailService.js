const nodemailer = require('nodemailer');
const config = require('../../../config');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

/* ================= PURPOSE CONFIG ================= */

const OTP_TEMPLATES = {
  LOGIN: {
    subject: "Your Login OTP",
    title: "Login Verification",
    message: "You requested to login. Please use the OTP below to continue:",
  },
  VERIFYEMAIL: {
    subject: "Verify Your Email",
    title: "Email Verification OTP",
    message: "Use the OTP below to verify your email address:",
  },
  FORGOTPASSWORD: {
    subject: "Password Reset OTP",
    title: "Reset Your Password",
    message: "You requested to reset your password. Use the OTP below:",
  },
  UPDATEPASSWORD: {
    subject: "Update Password OTP",
    title: "Password Update Verification",
    message: "Use this OTP to update your password:",
  },
  DELETEACCOUNT: {
    subject: "Account Deletion OTP",
    title: "Confirm Account Deletion",
    message: "Use the OTP below to confirm account deletion:",
  },
  DEFAULT: {
    subject: "Your OTP Code",
    title: "OTP Verification",
    message: "Use the OTP below to continue:",
  },
};

/* ================= SEND MAIL ================= */

const sendOtpEmail = async (email, otp, name, purpose = "DEFAULT") => {
  const template = OTP_TEMPLATES[purpose] || OTP_TEMPLATES.DEFAULT;

  const mailOptions = {
    from: `"${config.email.fromName}" <${config.email.from}>`,
    to: email,
    subject: template.subject,
    html: `
      <html>
        <body style="font-family: Arial; background:#f9f9f9;">
          <div style="max-width:600px;margin:auto;padding:20px;">
            
            <div style="background:#4CAF50;color:white;padding:20px;text-align:center;">
              <h1>${template.title}</h1>
            </div>

            <div style="background:white;padding:30px;border-radius:5px;">
              <p>Hello ${name || "User"},</p>
              <p>${template.message}</p>

              <h2 style="text-align:center;letter-spacing:5px;color:#4CAF50;">
                ${otp}
              </h2>

              <p><b>This OTP will expire in 1 minute.</b></p>
              <p>If you did not request this, please ignore this email.</p>
            </div>

            <p style="text-align:center;font-size:12px;color:#666;">
              This is an automated email. Do not reply.
            </p>

          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/* ================= EASY APPLY CONFIRMATION EMAIL ================= */

const sendApplicationEmail = async (email, name, jobTitle, company) => {
  const mailOptions = {
    from: `"${config.email.fromName}" <${config.email.from}>`,
    to: email,
    subject: `Application Submitted: ${jobTitle} at ${company}`,
    html: `
      <html>
        <body style="font-family: Arial; background:#f9f9f9;">
          <div style="max-width:600px;margin:auto;padding:20px;">

            <div style="background:#4CAF50;color:white;padding:20px;text-align:center;">
              <h1>Application Submitted!</h1>
            </div>

            <div style="background:white;padding:30px;border-radius:5px;">
              <p>Hello ${name || 'User'},</p>
              <p>Your application has been successfully submitted. Here are the details:</p>

              <div style="background:#f4f4f4;padding:15px;border-radius:5px;margin:20px 0;">
                <p style="margin:5px 0;"><b>Position:</b> ${jobTitle}</p>
                <p style="margin:5px 0;"><b>Company:</b> ${company}</p>
                <p style="margin:5px 0;"><b>Status:</b> <span style="color:#4CAF50;">Applied</span></p>
              </div>

              <p>The company will review your application and reach out to you if you're a good fit.</p>
              <p><b>Please wait for the company's response.</b> We'll keep you posted on any updates.</p>

              <p style="color:#888;font-size:13px;margin-top:30px;">
                You can track all your applications in the SkillSync AI app.
              </p>
            </div>

            <p style="text-align:center;font-size:12px;color:#666;">
              This is an automated email. Do not reply.
            </p>

          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, sendApplicationEmail };
