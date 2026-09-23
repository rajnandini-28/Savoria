const nodemailer = require('nodemailer');

const createTransporter = async () => {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    try {
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    } catch (e) {
        return null;
    }
};

const sendOrderNotification = async (order) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'mkd9a32@gmail.com';
    const guestEmail = order.email || 'guest@savoria.in';

    console.log(`\n📧 [SAVORIA EMAIL DISPATCH] Order ${order.orderRef} captured!`);
    console.log(`   ➔ Admin Alert to: ${adminEmail}`);
    console.log(`   ➔ Guest Receipt to: ${guestEmail}`);
    console.log(`   ➔ Total: ₹${order.financials?.total || 0}\n`);

    try {
        const transporter = await createTransporter();
        if (!transporter) return;

        // Dispatch Guest Receipt Email
        await transporter.sendMail({
            from: '"SAVORIA Royal Haute Cuisine" <concierge@savoria-dining.com>',
            to: guestEmail,
            subject: `✨ Your Royal Order Confirmation & Tracking [${order.orderRef}]`,
            html: `
                <div style="background:#09090e; color:#d6d3e3; font-family:serif; padding:30px; border:1px solid #d4af37; max-width:600px; margin:auto;">
                    <h2 style="color:#f5b041; text-align:center;">❖ SAVORIA HAUTE CUISINE ❖</h2>
                    <h3 style="text-align:center; color:#fff;">Imperial Feast Confirmation</h3>
                    <p>Respected <strong>${order.customerName}</strong>,</p>
                    <p>Your order <strong>${order.orderRef}</strong> has been received by our Shahi Kitchen Brigade.</p>
                    <hr style="border-color:#d4af37;" />
                    <h4>Order Summary</h4>
                    <ul>
                        ${(order.items || []).map(i => `<li>${i.quantity}x ${i.title} — ₹${i.price * i.quantity}</li>`).join('')}
                    </ul>
                    <p><strong>Total Payable:</strong> ₹${order.financials?.total || 0}</p>
                    <p><strong>Service Type:</strong> ${order.orderTypeLabel}</p>
                    <p><em>Thank you for honoring us with your patronage.</em></p>
                </div>
            `
        });
    } catch (err) {
        console.warn('Mail dispatch warning:', err.message);
    }
};

module.exports = {
    sendOrderNotification
};
