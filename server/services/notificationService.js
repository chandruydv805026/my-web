// Notification Service for RatuMart
// Integrated with Resend (Transactional Email API) & OneSignal (Push Notifications API)
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

let notificationHistory = [];

/**
 * Get or create Resend client dynamically
 */
export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

/**
 * Send Web & Mobile Push Notification via OneSignal REST API
 */
export const sendOneSignalPush = async ({ title, message, url = 'https://ratufresh.me', data = {} }) => {
  const onesignalAppId = process.env.ONESIGNAL_APP_ID;
  const onesignalRestKey = process.env.ONESIGNAL_REST_KEY;

  if (!onesignalAppId || !onesignalRestKey) {
    console.warn('⚠️ OneSignal credentials not found');
    return null;
  }

  try {
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Key ${onesignalRestKey}`
      },
      body: JSON.stringify({
        app_id: onesignalAppId,
        included_segments: ['All'],
        headings: { en: title },
        contents: { en: message },
        url,
        data
      })
    });

    const result = await res.json();
    console.log(`📱 [ONESIGNAL PUSH DISPATCHED] ID: ${result.id || 'queued'}`);
    return result;
  } catch (err) {
    console.error('⚠️ OneSignal Push dispatch error:', err.message);
    return null;
  }
};

/**
 * Send Transactional Email via Resend API
 */
export const sendResendEmail = async ({ to, subject, html }) => {
  const resend = getResendClient();
  if (!resend) {
    console.warn('⚠️ Resend API key not configured in process.env');
    return { success: false, error: 'Resend API key missing' };
  }

  const emailFrom = process.env.EMAIL_FROM || 'RatuMart <auth@ratufresh.me>';

  try {
    const recipients = Array.isArray(to) ? to : [to];
    const result = await resend.emails.send({
      from: emailFrom,
      to: recipients,
      subject,
      html
    });

    if (result.error) {
      console.warn('⚠️ Resend API Notice:', result.error.message);
      return { success: false, error: result.error.message };
    }

    console.log(`📧 [RESEND EMAIL DELIVERED] Recipient: ${recipients.join(', ')} | ID: ${result.data?.id}`);
    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error('⚠️ Resend Exception:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * 1. Dispatch Real Order Notification (Private Resend Email to Customer)
 */
export const sendOrderNotification = async (orderData) => {
  const { orderId, customerName, customerEmail, customerPhone, items = [], totalAmount = 0, status = 'Confirmed' } = orderData;
  const itemsCount = items.length;

  const pushTitle = `🎉 Order Confirmed: #${orderId}`;
  const pushMessage = `Namaste ${customerName || 'Shopper'}! Aapka order #${orderId} (₹${totalAmount}, ${itemsCount} items) safalta-poorvak confirm ho gaya hai!`;

  // Private Resend Premium Flipkart-Style HTML Email to customer only (NO broadcast push!)
  let emailResult = null;
  if (customerEmail && customerEmail.includes('@')) {
    const itemsHtml = items.map(it => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px; font-size: 13px; color: #1e293b; font-weight: bold;">
          ${it.name || 'Cloth Item'}
          <div style="font-size: 11px; color: #64748b; font-weight: normal;">Size: ${it.selectedSize || 'Standard'} | Color: ${it.selectedColor || 'Standard'}</div>
        </td>
        <td style="padding: 12px 8px; font-size: 13px; color: #475569; text-align: center;">${it.quantity || 1}</td>
        <td style="padding: 12px 8px; font-size: 13px; color: #0f172a; font-weight: bold; text-align: right;">₹${it.price}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #2874f0; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">RatuMart</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #dbeafe;">India's Premium Fashion Destination for Kids, Men &amp; Women</p>
        </div>

        <!-- Body -->
        <div style="padding: 24px;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 4px 0; color: #15803d; font-size: 16px;">🎉 Order Placed Successfully!</h2>
            <p style="margin: 0; font-size: 13px; color: #166534;">
              Hello <strong>${customerName || 'Shopper'}</strong>, thank you for shopping with RatuMart. Your fashion order has been received and is being prepared for dispatch.
            </p>
          </div>

          <!-- Order Summary Details -->
          <div style="background: #f8fafc; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
            <table style="width: 100%; font-size: 13px;">
              <tr>
                <td style="color: #64748b;">Order Number:</td>
                <td style="font-weight: bold; color: #0f172a; text-align: right;">#${orderId}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Delivery Status:</td>
                <td style="font-weight: bold; color: #2563eb; text-align: right;">${status}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Estimated Delivery:</td>
                <td style="font-weight: bold; color: #0f172a; text-align: right;">Within 2-3 Business Days</td>
              </tr>
            </table>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 12px; color: #475569; text-transform: uppercase;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px 8px; font-weight: bold; font-size: 14px; text-align: right;">Total Amount:</td>
                <td style="padding: 12px 8px; font-weight: 900; font-size: 16px; color: #2874f0; text-align: right;">₹${totalAmount}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Support & Footer -->
          <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0;">If you have any questions, reach our customer care at <strong>080-4547-RATU</strong> or support@ratumart.com.</p>
            <p style="margin: 4px 0 0 0;">© 2026 RatuMart Fashion. 100% Genuine Quality Guarantee.</p>
          </div>
        </div>
      </div>
    `;

    emailResult = await sendResendEmail({
      to: customerEmail,
      subject: `Order Confirmed: #${orderId} - RatuMart`,
      html: emailHtml
    });
  }

  // Record in History Feed
  const alertRecord = {
    id: `notif_${Date.now()}`,
    type: 'ORDER_PLACED',
    title: pushTitle,
    message: pushMessage,
    recipient: customerEmail || customerPhone || 'Customer',
    timestamp: new Date().toISOString(),
    status: 'Delivered',
    channels: {
      onesignal: pushResult ? 'Sent' : 'Skipped',
      resend: emailResult?.success ? 'Sent' : (emailResult ? 'Notice' : 'Skipped')
    }
  };

  notificationHistory.unshift(alertRecord);
  if (notificationHistory.length > 50) notificationHistory.pop();

  return { success: true, alert: alertRecord };
};

/**
 * 2. Dispatch Order Status Change Notification (Private Email to Customer)
 */
export const sendOrderStatusUpdate = async (orderId, newStatus, customer = {}) => {
  const pushTitle = `📦 Order Update: #${orderId}`;
  const pushMessage = `Aapke RatuMart order #${orderId} ka status ab "${newStatus}" ho gaya hai!`;

  // Resend Email directly to customer (NO broadcast push!)
  let emailResult = null;
  if (customer.email && customer.email.includes('@')) {
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #2874f0; padding: 18px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 20px;">RatuMart Order Tracking</h2>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 14px; color: #334155;">Namaste Shopper,</p>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
            <div style="font-size: 12px; color: #64748b;">Current Tracking Status:</div>
            <div style="font-size: 20px; font-weight: 900; color: #1d4ed8; margin-top: 4px;">${newStatus}</div>
          </div>
          <p style="font-size: 13px; color: #64748b;">Order Number: <strong>#${orderId}</strong></p>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">Ratu Express Logistics se aapka parcel safely deliver kiya jayega.</p>
        </div>
      </div>
    `;

    emailResult = await sendResendEmail({
      to: customer.email,
      subject: `Order #${orderId} Status Update: ${newStatus}`,
      html: emailHtml
    });
  }

  const alertRecord = {
    id: `notif_${Date.now()}`,
    type: 'STATUS_UPDATE',
    title: pushTitle,
    message: pushMessage,
    recipient: customer.email || customer.phone || 'Customer',
    timestamp: new Date().toISOString(),
    status: 'Delivered',
    channels: {
      onesignal: pushResult ? 'Sent' : 'Skipped',
      resend: emailResult?.success ? 'Sent' : 'Skipped'
    }
  };

  notificationHistory.unshift(alertRecord);
  if (notificationHistory.length > 50) notificationHistory.pop();

  return { success: true, alert: alertRecord };
};

/**
 * 3. Welcome Notification for Newly Registered Users (Private Email to User)
 */
export const sendWelcomeNotification = async (user) => {
  const pushTitle = `🎉 Welcome to RatuMart, ${user.name}!`;
  const pushMessage = `Aapka account successfully activate ho gaya hai. Happy Fashion Shopping!`;

  // Resend Welcome Email to user only (NO broadcast push!)
  if (user.email && user.email.includes('@')) {
    const welcomeHtml = `
      <div style="font-family: sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #2874f0; padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 900;">Welcome to RatuMart!</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #dbeafe;">Fashion Destination for Kids, Men &amp; Women</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #0f172a; font-size: 16px;">Hello ${user.name},</h2>
          <p style="font-size: 13px; color: #475569; line-height: 1.5;">
            Welcome to the RatuMart family! Explore our exclusive collections of premium ethnic wear, western fashion, party wear, and kids outfits.
          </p>

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
            <div style="font-size: 13px; color: #1e40af; font-weight: bold;">⚡ Fast Local Express Delivery!</div>
            <div style="font-size: 11px; color: #3b82f6; margin-top: 4px;">Exclusive delivery within Ratu, Ranchi.</div>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="https://ratufresh.me" style="background-color: #ffc200; color: #0f172a; font-weight: 900; font-size: 13px; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
              START SHOPPING NOW
            </a>
          </div>
        </div>
      </div>
    `;

    await sendResendEmail({
      to: user.email,
      subject: `Welcome to RatuMart, ${user.name}! 🎉`,
      html: welcomeHtml
    });
  }

  const alertRecord = {
    id: `notif_${Date.now()}`,
    type: 'WELCOME',
    title: pushTitle,
    message: pushMessage,
    recipient: user.email,
    timestamp: new Date().toISOString(),
    status: 'Delivered'
  };

  notificationHistory.unshift(alertRecord);
  if (notificationHistory.length > 50) notificationHistory.pop();

  return { success: true, alert: alertRecord };
};

export const sendEmailVerificationOtp = async ({ email, name, code }) => {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #2874f0; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">RatuMart</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #dbeafe;">Account Verification Code</p>
      </div>
      <div style="padding: 28px 24px; text-align: center;">
        <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 8px 0; font-weight: 800;">
          Hello ${name || 'Shopper'}!
        </h2>
        <p style="color: #475569; font-size: 13px; margin: 0 0 24px 0; line-height: 1.5;">
          Thank you for choosing RatuMart. Please enter the 6-digit confirmation code below to verify your email and activate your account:
        </p>
        <div style="background: #eff6ff; border: 2px dashed #93c5fd; border-radius: 10px; padding: 18px 24px; display: inline-block; letter-spacing: 10px; font-size: 32px; font-weight: 900; color: #1d4ed8; font-family: monospace; margin-bottom: 24px;">
          ${code}
        </div>
        <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">
          ⏱️ This confirmation code is valid for <strong>10 minutes</strong>.
        </p>
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          If you did not request this registration, please ignore this email.
        </p>
      </div>
      <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center; font-size: 11px; color: #94a3b8;">
        © 2026 RatuMart Fashion. 100% Genuine Indian Fashion &amp; Lifestyle.
      </div>
    </div>
  `;

  // Private Resend Email only (NO broadcast push - OTP is 100% private to user's email!)
  return await sendResendEmail({
    to: email,
    subject: `${code} is your RatuMart Verification Code`,
    html
  });
};

export const getNotificationLogs = () => {
  return notificationHistory;
};

/**
 * 4. Marketing & Promotional Push Broadcast (Exclusively for Offers, Sales & Discounts)
 */
export const sendMarketingBroadcast = async ({ title, message, url = 'https://ratufresh.me', data = {} }) => {
  return await sendOneSignalPush({
    title,
    message,
    url,
    data: { ...data, type: 'PROMOTION' }
  });
};
