const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const Notification = require('../models/Notification');

// Initialize transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email function
async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });
    return { success: true, info };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Helper to load and fill template
async function loadAndFillTemplate(templateName, data) {
  try {
    const templatePath = path.join(__dirname, '../templates', templateName);
    let template = await fs.readFile(templatePath, 'utf-8');
    // Replace placeholders like {{key}} with data[key]
    template = template.replace(/{{(\w+)}}/g, (_, key) => data[key] || '');
    return template;
  } catch (error) {
    console.error('Error loading template:', error);
    throw error;
  }
}

// Log notification to database
async function logNotification({ 
  type, 
  title, 
  message, 
  recipientEmail, 
  recipientName, 
  userId = null, 
  relatedBooking = null, 
  relatedCompany = null, 
  emailSent = false, 
  emailError = null 
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
  } catch (error) {
    console.error('Error logging notification:', error);
    return null;
  }
}

// Send templated email with logging
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
  relatedCompany = null 
}) {
  try {
    const html = await loadAndFillTemplate(templateName, data);
    const emailResult = await sendEmail({ to, subject, html });
    
    // Log the notification
    await logNotification({
      type,
      title,
      message,
      recipientEmail: to,
      recipientName: data.userName || data.companyName || 'Unknown',
      userId,
      relatedBooking,
      relatedCompany,
      emailSent: emailResult.success,
      emailError: emailResult.success ? null : emailResult.error
    });
    
    return emailResult;
  } catch (error) {
    // Log failed notification
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
