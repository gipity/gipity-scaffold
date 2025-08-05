import nodemailer from 'nodemailer';
import { debug } from './debug';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const mailOptions = {
      from: `${process.env.SMTP_SENDER_NAME || process.env.APP_NAME || 'Your App'} <${process.env.SMTP_SENDER_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const result = await transporter.sendMail(mailOptions);
    debug.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    debug.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const sendWelcomeEmail = async (email: string, name?: string) => {
  const appName = process.env.APP_NAME || 'Your App';
  
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #476a92 0%, #4299e1 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to ${appName}!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Great to have you on board</p>
      </div>
      
      <div style="padding: 40px 20px; background: #f7fafc;">
        <h2 style="color: #2d3748; margin-bottom: 20px;">Hello ${name || 'there'}!</h2>
        
        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
          Thank you for joining ${appName}! Your account has been successfully created and you're ready to get started.
        </p>
        
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #476a92;">
          <h3 style="color: #2d3748; margin-top: 0;">What's Next:</h3>
          <ul style="color: #4a5568; line-height: 1.8;">
            <li>Explore the application features</li>
            <li>Customize your profile settings</li>
            <li>Start using the platform</li>
          </ul>
        </div>
        
        <p style="color: #4a5568; line-height: 1.6;">
          Ready to begin? 
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">
            Open the ${appName} app to continue
          </p>
          
          ${process.env.VITE_BACKEND_URL || process.env.CUSTOM_DOMAIN ? `
          <p style="color: #4a5568; font-size: 16px; margin: 10px 0;">
            or
          </p>
          <div>
            <a href="${process.env.VITE_BACKEND_URL || `https://${process.env.CUSTOM_DOMAIN}`}" 
               style="background-color: #4299e1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
              Visit Web App
            </a>
          </div>
          ` : ''}
        </div>
      </div>
      
      <div style="background: #2d3748; color: #a0aec0; padding: 20px; text-align: center; font-size: 14px;">
        <p style="margin: 0;">© 2025 ${appName}. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">Welcome to your new platform.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Welcome to ${appName}!`,
    html
  });
};
