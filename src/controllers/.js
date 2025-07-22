const nodemailer = require("nodemailer");

const sendTempPasswordEmail = async (to, tempPassword) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME, // your email
      pass: process.env.EMAIL_PASSWORD, // app password or real password
    },
  });

  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject: "Your Temporary Password",
    html: `
      <h2>Temporary Password</h2>
      <p>Your temporary password is: <strong>${tempPassword}</strong></p>
      <p>Please log in and change it immediately.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendTempPasswordEmail;
