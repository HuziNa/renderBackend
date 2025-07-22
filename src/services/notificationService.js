

const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const Notification = require('../models/Notification');

// Setup transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, html, text, attachments }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
      attachments: attachments || []
    });
    return { success: true, info };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

async function loadAndFillTemplate(templateName, data) {
  const templatePath = path.join(__dirname, '../templates', templateName);
  let template = await fs.readFile(templatePath, 'utf-8');
  template = template.replace(/{{(\w+)}}/g, (_, key) => data[key] || '');
  return template;
}

async function logNotification({
  type, title, message,
  recipientEmail, recipientName,
  userId, relatedBooking, relatedCompany,
  emailSent, emailError
}) {
  try {
    const notification = new Notification({
      user: userId ? { _id: userId, name: recipientName } : null,
      type,
      title,
      message,
      related: {
        booking: relatedBooking,
        company: relatedCompany
      },
      email: {
        sent: emailSent,
        sentAt: emailSent ? new Date() : null
      },
      meta: {
        recipientEmail,
        recipientName,
        emailError: emailError ? emailError.message : null
      }
    });
    await notification.save();
    return notification;
  } catch (err) {
    console.error('Error logging notification:', err);
    return null;
  }
}

async function sendTemplatedEmail({ 
  templateName, 
  to, 
  subject, 
  data, 
  type, 
  title, 
  message, 
  userId = null, 
  relatedBooking = null, 
  relatedCompany = null,
  attachments = []  // <---- support attachments
}) {
  try {
    const html = await loadAndFillTemplate(templateName, data);

    // Now send attachments too
    const emailResult = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments
    });

    console.log("📤 Email attempted to:", to);
    console.log("📦 Nodemailer response info:", emailResult);

    // Log notification
    await logNotification({
      type,
      title,
      message,
      recipientEmail: to,
      recipientName: data.userName || data.companyName || 'Unknown',
      userId,
      relatedBooking,
      relatedCompany,
      emailSent: true,
      emailError: null
    });

    return { success: true, info: emailResult };

  } catch (error) {
    console.error('❌ Error sending email:', error);

    await logNotification({
      type,
      title,
      message,
      recipientEmail: to,
      recipientName: data.userName || data.companyName || 'Unknown',
      userId,
      relatedBooking,
      relatedCompany,
      emailSent: false,
      emailError: error
    });

    return { success: false, error };
  }
}


module.exports = {
  sendEmail,
  sendTemplatedEmail,
  logNotification,
};
