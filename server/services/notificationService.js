// Notification Service for RatuMart
// Integrated with Resend (Transactional Email API) & OneSignal (Push Notifications API)
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const emailFrom = process.env.EMAIL_FROM || 'RatuMart <onboarding@resend.dev>';

const onesignalAppId = process.env.ONESIGNAL_APP_ID;
const onesignalRestKey = process.env.ONESIGNAL_REST_KEY;

let notificationHistory = [];

/**
 * Send Web & Mobile Push Notification via OneSignal REST API
 */
export const sendOneSignalPush = async ({ title, message, url = 'http://localhost:5173', data = {} }) => {
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
  if (!resend) {
    console.warn('⚠️ Resend API key not configured');
    return null;
  }

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

    console.log(`📧 [RESEND EMAIL DELIVERED] ID: ${result.data?.id}`);
    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error('⚠️ Resend Exception:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * 1. Dispatch Real Order Notification (Resend Email + OneSignal Push)
 */
export const sendOrderNotification = async (orderData) => {
  const { orderId, customerName, customerEmail, customerPhone, items = [], totalAmount = 0, status = 'Confirmed' } = orderData;
  const itemsCount = items.length;

  const pushTitle = `🎉 Order Confirmed: #${orderId}`;
  const pushMessage = `Namaste ${customerName || 'Shopper'}! Aapka order #${orderId} (₹${totalAmount}, ${itemsCount} items) safalta-poorvak confirm ho gaya hai!`;

  // 1. OneSignal Web & App Push
  const pushResult = await sendOneSignalPush({
    title: pushTitle,
    message: pushMessage,
    data: { orderId, totalAmount, type: 'ORDER_PLACED' }
  });

  // 2. Resend Premium Flipkart-Style HTML Email
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
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #dbeafe;">Chhote Bachhe, Bade Log aur Ladkiyo Ka Fashion Hub</p>
        </div>

        <!-- Body -->
        <div style="padding: 24px;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 4px 0; color: #15803d; font-size: 16px;">🎉 Order Placed Successfully!</h2>
            <p style="margin: 0; font-size: 13px; color: #166534;">
              Namaste <strong>${customerName || 'Shopper'}</strong>, aapka kapdo ka order hume mil gaya hai aur dispatch ke liye taiyaar kiya ja raha hai.
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
            <p style="margin: 0;">Agar koi sawal hai, hamare helpline <strong>080-4547-RATU</strong> par contact karein.</p>
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
 * 2. Dispatch Order Status Change Notification
 */
export const sendOrderStatusUpdate = async (orderId, newStatus, customer = {}) => {
  const pushTitle = `📦 Order Update: #${orderId}`;
  const pushMessage = `Aapke RatuMart order #${orderId} ka status ab "${newStatus}" ho gaya hai!`;

  // OneSignal Push
  const pushResult = await sendOneSignalPush({
    title: pushTitle,
    message: pushMessage,
    data: { orderId, newStatus, type: 'STATUS_UPDATE' }
  });

  // Resend Email (if email provided)
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
 * 3. Welcome Notification for Newly Registered Users
 */
export const sendWelcomeNotification = async (user) => {
  const pushTitle = `🎉 Welcome to RatuMart, ${user.name}!`;
  const pushMessage = `Aapke account me 150 Ratu SuperCoins add kar diye gaye hain. Happy Fashion Shopping!`;

  // OneSignal Push
  await sendOneSignalPush({
    title: pushTitle,
    message: pushMessage,
    data: { userId: user._id, type: 'WELCOME' }
  });

  // Resend Welcome Email
  if (user.email && user.email.includes('@')) {
    const welcomeHtml = `
      <div style="font-family: sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #2874f0; padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 900;">Welcome to RatuMart!</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #dbeafe;">Chhote Bachhe, Bade Log aur Ladkiyo Ka Fashion</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #0f172a; font-size: 16px;">Namaste ${user.name},</h2>
          <p style="font-size: 13px; color: #475569; line-height: 1.5;">
            RatuMart family me aapka hardik swagat hai! Hamare paas premium ethnic wear, casual wear, aur festival clothes uplabdh hain.
          </p>

          <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
            <div style="font-size: 13px; color: #854d0e; font-weight: bold;">🪙 +150 Ratu SuperCoins Bonus!</div>
            <div style="font-size: 11px; color: #a16207; margin-top: 4px;">Aap in coins ko apne agle order par discount ke roop me use kar sakte hain.</div>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="http://localhost:5173" style="background-color: #ffc200; color: #0f172a; font-weight: 900; font-size: 13px; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
              START SHOPPING NOW
            </a>
          </div>
        </div>
      </div>
    `;

    await sendResendEmail({
      to: user.email,
      subject: `Welcome to RatuMart, ${user.name}! Claimed 150 SuperCoins 🪙`,
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

export const getNotificationLogs = () => {
  return notificationHistory;
};
