const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465 || process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Crunch Veda" <${process.env.SMTP_EMAIL}>`,
      to: user.email,
      subject: `Welcome to Crunch Veda, ${user.name}!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2e7d32;">
            <h1 style="color: #2e7d32; margin: 0; font-size: 28px; font-weight: 700;">Crunch Veda</h1>
            <p style="color: #64748b; margin-top: 6px; font-size: 14px;">Welcome to Our Community</p>
          </div>
          
          <div style="padding: 24px 0;">
            <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Hello ${user.name},</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 15px;">
              Thank you for registering with <strong>Crunch Veda</strong>! Your account has been created successfully.
            </p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #2e7d32; padding: 18px; margin: 24px 0; border-radius: 6px;">
              <h3 style="margin-top: 0; color: #2e7d32; font-size: 16px; margin-bottom: 12px;">Your Account Information</h3>
              <table style="width: 100%; text-align: left; font-size: 14px; color: #334155;">
                <tr>
                  <td style="padding: 6px 0; font-weight: 600; width: 100px;">Full Name:</td>
                  <td style="padding: 6px 0;">${user.name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600;">Email:</td>
                  <td style="padding: 6px 0;">${user.email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600;">Phone:</td>
                  <td style="padding: 6px 0;">${user.phone}</td>
                </tr>
              </table>
            </div>

            <p style="color: #475569; line-height: 1.6; font-size: 15px;">
              If you have any questions or need assistance, feel free to reach out to us at <a href="mailto:${process.env.SMTP_EMAIL}" style="color: #2e7d32; font-weight: 600; text-decoration: none;">${process.env.SMTP_EMAIL}</a>.
            </p>
          </div>
          
          <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 18px; color: #94a3b8; font-size: 12px;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Crunch Veda Store. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending welcome email:", error.message);
  }
};

module.exports = {
  sendWelcomeEmail,
};