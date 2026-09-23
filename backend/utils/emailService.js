const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
    if (transporter) return transporter;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log(`✅ SMTP Active: Configured credentials for ${process.env.SMTP_USER}`);
    } else {
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            console.log(`📬 Ethereal Mail Active (User: ${testAccount.user})`);
        } catch (err) {
            console.warn(`⚠️ JSON Mail Transport Fallback: ${err.message}`);
            transporter = nodemailer.createTransport({ jsonTransport: true });
        }
    }
    return transporter;
}

// 1. Guest Royal Reservation Invitation HTML
function getGuestReservationHtml(data) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { margin: 0; padding: 0; background-color: #08080c; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #e2dfd2; }
            .email-wrapper { max-width: 600px; margin: 30px auto; background: #0f0f17; border: 1px solid #d4af37; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
            .header { background: linear-gradient(135deg, #18151f 0%, #0c0a12 100%); padding: 35px 20px; text-align: center; border-bottom: 2px solid #d4af37; }
            .brand-title { color: #e6b980; font-size: 28px; letter-spacing: 4px; margin: 0; text-transform: uppercase; font-weight: 700; }
            .brand-sub { color: #a19da8; font-size: 12px; letter-spacing: 2px; margin-top: 6px; text-transform: uppercase; }
            .content { padding: 30px 25px; }
            .greeting { font-size: 19px; color: #ffffff; margin-bottom: 16px; }
            .message { font-size: 14px; line-height: 1.6; color: #b8b5c0; margin-bottom: 24px; }
            .details-card { background: #161522; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; padding: 20px; margin-bottom: 24px; }
            .label { color: #8f8b99; font-size: 13px; font-weight: 600; padding: 8px 0; }
            .val { color: #ffffff; font-size: 14px; font-weight: 700; text-align: right; padding: 8px 0; }
            .val.gold { color: #e6b980; font-size: 16px; font-family: monospace; letter-spacing: 1px; }
            .notes-box { background: rgba(230, 185, 128, 0.08); border-left: 3px solid #d4af37; padding: 14px; margin-bottom: 24px; font-size: 12px; color: #ded8cb; line-height: 1.5; }
            .footer { background: #0a0910; padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); font-size: 11px; color: #736f7e; line-height: 1.6; }
            .footer a { color: #d4af37; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="header">
                <h1 class="brand-title">SAVORIA</h1>
                <div class="brand-sub">Fine Dining & Royal Gastronomy</div>
            </div>
            <div class="content">
                <div class="greeting">Royal Greetings, <strong>${data.fullName}</strong></div>
                <div class="message">
                    We are deeply honored to confirm your royal dining reservation at <strong>SAVORIA</strong>. Our master ustads and brigade are preparing an unforgettable evening for you.
                </div>

                <div class="details-card">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                            <td class="label">Confirmation Code:</td>
                            <td class="val gold">${data.bookingRef}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                            <td class="label">Date & Time:</td>
                            <td class="val">${data.formattedDate} at ${data.timeText}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                            <td class="label">Royal Party:</td>
                            <td class="val">${data.guestsText}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                            <td class="label">Court Seating:</td>
                            <td class="val">${data.seating}</td>
                        </tr>
                        <tr>
                            <td class="label">Guest Phone:</td>
                            <td class="val">${data.phone}</td>
                        </tr>
                    </table>
                </div>

                <div class="notes-box">
                    <strong>Royal Dress Code & Etiquette:</strong><br>
                    Smart Elegant / Traditional Royal Attire. We request guests to arrive 10 minutes prior to the reserved time. Your table will be held with honor for up to 15 minutes past your booking time.
                </div>
            </div>
            <div class="footer">
                SAVORIA Imperial Dining Hall • Heritage Gate, Connaught Circle<br>
                Direct Concierge: <a href="tel:+91XXXXXXXXXX">+91 XXXXX XXXXX</a> • <a href="mailto:reservations@savoria-dining.com">reservations@savoria-dining.com</a><br>
                © 2026 SAVORIA Haute Cuisine. All Rights Reserved.
            </div>
        </div>
    </body>
    </html>
    `;
}

// 2. Admin/Owner Notification for Reservation HTML
function getAdminReservationHtml(data) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { margin: 0; padding: 0; background-color: #121218; font-family: 'Helvetica Neue', Arial, sans-serif; color: #f0f0f5; }
            .wrapper { max-width: 600px; margin: 25px auto; background: #1a1a24; border: 2px solid #e74c3c; border-radius: 10px; overflow: hidden; }
            .header { background: #232232; padding: 25px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .tag { display: inline-block; background: #e74c3c; color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; margin-bottom: 8px; }
            .title { margin: 0; font-size: 22px; color: #ffffff; }
            .content { padding: 25px; }
            .table { width: 100%; border-collapse: collapse; background: #13131c; border-radius: 6px; overflow: hidden; margin-top: 15px; }
            .table td { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
            .lbl { color: #9a96a6; font-weight: 600; width: 40%; }
            .val { color: #ffffff; font-weight: 700; }
            .highlight { color: #f1c40f; font-family: monospace; font-size: 16px; }
            .footer { background: #0e0e14; padding: 15px 25px; font-size: 12px; color: #7f7a8c; text-align: center; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="header">
                <span class="tag">🚨 New Reservation Alert</span>
                <h2 class="title">Table Booking Notification</h2>
            </div>
            <div class="content">
                <p style="font-size: 15px; color: #d0cdd9; margin-top: 0;">
                    A new table reservation has just been submitted on the SAVORIA website. Please ensure the floor stewards and kitchen brigade are informed.
                </p>

                <table class="table">
                    <tr><td class="lbl">Booking Reference:</td><td class="val highlight">${data.bookingRef}</td></tr>
                    <tr><td class="lbl">Guest Full Name:</td><td class="val">${data.fullName}</td></tr>
                    <tr><td class="lbl">Guest Email:</td><td class="val"><a href="mailto:${data.email}" style="color: #68b0f8;">${data.email}</a></td></tr>
                    <tr><td class="lbl">Guest Phone:</td><td class="val"><a href="tel:${data.phone}" style="color: #68b0f8;">${data.phone}</a></td></tr>
                    <tr><td class="lbl">Date & Time:</td><td class="val">${data.formattedDate} at ${data.timeText}</td></tr>
                    <tr><td class="lbl">Party Size:</td><td class="val">${data.guestsText}</td></tr>
                    <tr><td class="lbl">Assigned Seating:</td><td class="val">${data.seating}</td></tr>
                    ${data.specialNotes ? `<tr><td class="lbl">Special Notes:</td><td class="val" style="color: #e6b980;">${data.specialNotes}</td></tr>` : ''}
                </table>
            </div>
            <div class="footer">
                SAVORIA Internal Kitchen & Concierge System • Owner Direct Line: <strong>+91 99820 72287</strong>
            </div>
        </div>
    </body>
    </html>
    `;
}

// 3. Guest Contact Inquiry Receipt HTML
function getGuestContactHtml(data) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { margin: 0; padding: 0; background-color: #08080c; font-family: 'Helvetica Neue', Arial, sans-serif; color: #e2dfd2; }
            .wrapper { max-width: 600px; margin: 30px auto; background: #0f0f17; border: 1px solid #d4af37; border-radius: 12px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #18151f 0%, #0c0a12 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid #d4af37; }
            .brand { color: #e6b980; font-size: 26px; letter-spacing: 3px; font-weight: 700; margin: 0; }
            .content { padding: 30px 25px; }
            .footer { background: #0a0910; padding: 20px; text-align: center; font-size: 12px; color: #736f7e; border-top: 1px solid rgba(255,255,255,0.08); }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="header">
                <h1 class="brand">SAVORIA</h1>
                <div style="color: #9995a3; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-top: 4px;">Royal Concierge Desk</div>
            </div>
            <div class="content">
                <h3 style="color: #ffffff; margin-top: 0;">Namaste ${data.name},</h3>
                <p style="color: #b8b5c0; line-height: 1.6; font-size: 14px;">
                    Thank you for contacting <strong>SAVORIA Fine Dining & Royal Gastronomy</strong>. We have received your inquiry regarding <em>"${data.subject || 'General Inquiry'}"</em>.
                </p>
                <p style="color: #b8b5c0; line-height: 1.6; font-size: 14px;">
                    Our Chief Concierge is reviewing your message and will reach out to you within 24 hours at <strong>${data.phone || data.email}</strong>.
                </p>
                <div style="background: rgba(230, 185, 128, 0.08); border-left: 3px solid #d4af37; padding: 14px; margin: 20px 0; font-size: 13px; color: #ded8cb;">
                    <strong>Your Message:</strong><br>
                    "${data.message}"
                </div>
            </div>
            <div class="footer">
                SAVORIA Imperial Dining Hall • Direct Line: +91 XXXXX XXXXX • reservations@savoria-dining.com
            </div>
        </div>
    </body>
    </html>
    `;
}

// 4. Admin Contact Inquiry Alert HTML
function getAdminContactHtml(data) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { margin: 0; padding: 0; background-color: #121218; font-family: 'Helvetica Neue', Arial, sans-serif; color: #f0f0f5; }
            .wrapper { max-width: 600px; margin: 25px auto; background: #1a1a24; border: 2px solid #3498db; border-radius: 10px; overflow: hidden; }
            .header { background: #232232; padding: 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .content { padding: 25px; }
            .table { width: 100%; border-collapse: collapse; background: #13131c; border-radius: 6px; margin: 15px 0; }
            .table td { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
            .lbl { color: #9a96a6; font-weight: 600; width: 35%; }
            .val { color: #ffffff; font-weight: 700; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="header">
                <span style="display:inline-block; background: #3498db; color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">📩 New Website Inquiry</span>
                <h3 style="margin: 8px 0 0; color: #fff;">Inquiry from ${data.name}</h3>
            </div>
            <div class="content">
                <table class="table">
                    <tr><td class="lbl">Sender Name:</td><td class="val">${data.name}</td></tr>
                    <tr><td class="lbl">Email Address:</td><td class="val"><a href="mailto:${data.email}" style="color: #68b0f8;">${data.email}</a></td></tr>
                    <tr><td class="lbl">Phone Number:</td><td class="val"><a href="tel:${data.phone}" style="color: #68b0f8;">${data.phone || 'Not Provided'}</a></td></tr>
                    <tr><td class="lbl">Subject:</td><td class="val">${data.subject || 'General Inquiry'}</td></tr>
                </table>

                <div style="background: #111118; border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 6px; font-size: 14px; color: #eae7f2; line-height: 1.5;">
                    <strong style="color: #f1c40f;">Message:</strong><br>
                    ${data.message}
                </div>
            </div>
            <div style="background: #0e0e14; padding: 12px 25px; font-size: 12px; color: #7f7a8c; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
                SAVORIA Concierge Management Desk • Owner Direct Line: <strong>+91 99820 72287</strong>
            </div>
        </div>
    </body>
    </html>
    `;
}

/**
 * Dual Dispatch for Table Reservations
 * Sends Email 1 to Guest + Email 2 to Admin/Owner
 */
async function sendReservationDualEmail(data) {
    const mailer = await getTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || 'mkd9a32@gmail.com';

    let guestResult = null;
    let adminResult = null;

    // 1. Send to Guest
    try {
        guestResult = await mailer.sendMail({
            from: '"SAVORIA Haute Cuisine" <concierge@savoria-dining.com>',
            to: data.email,
            subject: `⚜️ Royal Reservation Confirmed [${data.bookingRef}] — SAVORIA`,
            html: getGuestReservationHtml(data)
        });
        console.log(`[Guest Email Sent] -> ${data.email} (ID: ${guestResult.messageId})`);
    } catch (err) {
        console.warn(`[Guest Email Failed]: ${err.message}`);
    }

    // 2. Send to Admin/Owner
    try {
        adminResult = await mailer.sendMail({
            from: '"SAVORIA Website Booking Bot" <alerts@savoria-dining.com>',
            to: adminEmail,
            subject: `🚨 NEW TABLE BOOKING: [${data.bookingRef}] by ${data.fullName} (${data.guestsText})`,
            html: getAdminReservationHtml(data)
        });
        console.log(`[Admin Alert Email Sent] -> ${adminEmail} (ID: ${adminResult.messageId})`);
    } catch (err) {
        console.warn(`[Admin Email Failed]: ${err.message}`);
    }

    let previewUrl = null;
    if (guestResult && nodemailer.getTestMessageUrl) {
        previewUrl = nodemailer.getTestMessageUrl(guestResult);
    }

    return {
        guestSent: !!guestResult,
        adminSent: !!adminResult,
        previewUrl
    };
}

/**
 * Dual Dispatch for Contact Inquiries
 * Sends Email 1 to Guest + Email 2 to Admin/Owner
 */
async function sendContactDualEmail(data) {
    const mailer = await getTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || 'mkd9a32@gmail.com';

    let guestResult = null;
    let adminResult = null;

    // 1. Send Receipt to Guest
    try {
        guestResult = await mailer.sendMail({
            from: '"SAVORIA Concierge Desk" <concierge@savoria-dining.com>',
            to: data.email,
            subject: `⚜️ We have received your inquiry — SAVORIA Concierge`,
            html: getGuestContactHtml(data)
        });
        console.log(`[Contact Receipt Sent] -> ${data.email}`);
    } catch (err) {
        console.warn(`[Contact Guest Email Failed]: ${err.message}`);
    }

    // 2. Send Alert to Admin/Owner
    try {
        adminResult = await mailer.sendMail({
            from: '"SAVORIA Website Contact Bot" <inquiry-alerts@savoria-dining.com>',
            to: adminEmail,
            subject: `📩 NEW GUEST INQUIRY: from ${data.name} (${data.phone || data.email})`,
            html: getAdminContactHtml(data)
        });
        console.log(`[Contact Admin Alert Sent] -> ${adminEmail}`);
    } catch (err) {
        console.warn(`[Contact Admin Email Failed]: ${err.message}`);
    }

    let previewUrl = null;
    if (guestResult && nodemailer.getTestMessageUrl) {
        previewUrl = nodemailer.getTestMessageUrl(guestResult);
    }

    return {
        guestSent: !!guestResult,
        adminSent: !!adminResult,
        previewUrl
    };
}

module.exports = {
    getTransporter,
    sendReservationDualEmail,
    sendContactDualEmail
};
