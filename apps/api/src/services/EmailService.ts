import nodemailer from "nodemailer";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import sgMail from "@sendgrid/mail";

export enum EmailProvider {
    SMTP = "smtp",
    SES = "ses",
    SENDGRID = "sendgrid",
}

export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    from?: string;
    cta?: {
        label: string;
        url: string;
    };
}

export class EmailService {
    private transporter: nodemailer.Transporter | null = null;
    private sesClient: SESv2Client | null = null;
    private provider: EmailProvider;

    // Brand Colors
    private readonly PRIMARY_BLUE = "#2EA5FF";
    private readonly SECONDARY_ORANGE = "#F9A407";
    private readonly TEXT_DARK = "#1A1A1A";

    constructor() {
        this.provider = (process.env.EMAIL_PROVIDER as EmailProvider) || EmailProvider.SMTP;
        this.initProvider();
    }

    private initProvider() {
        if (this.provider === EmailProvider.SENDGRID) {
            const apiKey = process.env.SENDGRID_API_KEY;
            if (apiKey) {
                sgMail.setApiKey(apiKey);
            } else {
                console.error("[EmailService] SENDGRID_API_KEY is missing");
            }
        }

        if (this.provider === EmailProvider.SES) {
            this.sesClient = new SESv2Client({
                region: process.env.AWS_REGION || "us-east-1",
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
                },
            });
        }

        if (this.provider === EmailProvider.SMTP) {
            const resolvedPort = Number(process.env.SMTP_PORT || 587);
            const resolvedSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || resolvedPort === 465;

            this.transporter = nodemailer.createTransport({
                service: process.env.SMTP_SERVICE || undefined,
                host: process.env.SMTP_HOST,
                port: resolvedPort,
                secure: resolvedSecure,
                requireTLS: String(process.env.SMTP_REQUIRE_TLS || '').toLowerCase() === 'true' || (!resolvedSecure && resolvedPort === 587),
                auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                } : undefined,
                pool: true,
            });
        }
    }

    /**
     * Master Branded HTML Wrapper
     */
    private getBrandedLayout(content: string, subject: string, supportEmail: string, cta?: { label: string, url: string }): string {
        return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: ${this.TEXT_DARK}; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background-color: ${this.PRIMARY_BLUE}; padding: 40px 20px; text-align: center; }
    .logo { color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 1px; text-decoration: none; }
    .content { padding: 40px 30px; }
    .footer { background-color: #f8f9fa; padding: 30px 20px; text-align: center; color: #666666; font-size: 12px; }
    .button { 
        display: inline-block; 
        padding: 14px 30px; 
        background-color: ${this.SECONDARY_ORANGE}; 
        color: #ffffff !important; 
        text-decoration: none; 
        border-radius: 8px; 
        font-weight: bold; 
        margin-top: 25px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .divider { border-top: 1px solid #eeeeee; margin: 30px 0; }
    .social-links { margin: 20px 0; }
    .social-links a { color: ${this.PRIMARY_BLUE}; text-decoration: none; margin: 0 10px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://glotrade.online" class="logo">GLOTRADE</a>
    </div>
    <div class="content">
      <h2 style="color: ${this.PRIMARY_BLUE}; margin-top: 0;">${subject}</h2>
      ${content}
      ${cta ? `<center><a href="${cta.url}" class="button">${cta.label}</a></center>` : ''}
      <div class="divider"></div>
      <p style="font-size: 14px; color: #666;">If you have any questions, reply to this email or contact us at <a href="mailto:${supportEmail}" style="color: ${this.PRIMARY_BLUE}; text-decoration: none;">${supportEmail}</a>.</p>
    </div>
    <div class="footer">
      <div class="social-links">
        <a href="https://www.facebook.com/share/18cWJ3yrjz/?mibextid=wwXIfr">Facebook</a> |
        <a href="https://x.com/glotradeproduct?s=21">X</a> |
        <a href="https://www.instagram.com/glotrade_platform?igsh=cXJ6c2t6cGU2NzFq">Instagram</a> |
        <a href="https://www.youtube.com/@GLOTRADE.online/videos">YouTube</a> |
        <a href="https://www.tiktok.com/@glotradeproducts?_r=1&_t=ZS-95hYR9R3X1N">TikTok</a>
      </div>
      <p>&copy; ${new Date().getFullYear()} Glotrade International. All rights reserved.</p>
      <p>Lagos, Nigeria</p>
    </div>
  </div>
</body>
</html>`;
    }

    /**
     * Send an email using the configured provider
     */
    async sendEmail(options: EmailOptions): Promise<void> {
        if (process.env.EMAIL_ENABLED === 'false') {
            console.log(`[EmailService] Skipping email to ${options.to} (EMAIL_ENABLED=false)`);
            return;
        }

        const from = options.from || process.env.SMTP_FROM || "no-reply@glotrade.online";
        const supportEmail = process.env.SUPPORT_EMAIL || "support@glotrade.online";

        // Wrap content in branded layout if html is provided
        const finalHtml = options.html ? this.getBrandedLayout(options.html, options.subject, supportEmail, options.cta) : undefined;

        console.log(`[EmailService] Sending via ${this.provider} to ${options.to} (Subject: ${options.subject})`);

        try {
            if (this.provider === EmailProvider.SENDGRID) {
                await this.sendViaSendGrid(from, { ...options, html: finalHtml });
            } else if (this.provider === EmailProvider.SES && this.sesClient) {
                await this.sendViaSES(from, { ...options, html: finalHtml });
            } else if (this.transporter) {
                await this.sendViaSMTP(from, { ...options, html: finalHtml });
            } else {
                console.warn("[EmailService] No email provider initialized. Falling back to Ethereal in non-production.");
                if (process.env.NODE_ENV !== "production") {
                    await this.sendViaEthereal({ ...options, html: finalHtml });
                }
            }
        } catch (error) {
            console.error(`[EmailService] Error sending email via ${this.provider}:`, error);
            throw error;
        }
    }

    private async sendViaSendGrid(from: string, options: EmailOptions): Promise<void> {
        await sgMail.send({
            to: options.to,
            from,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
    }

    private async sendViaSMTP(from: string, options: EmailOptions): Promise<void> {
        if (!this.transporter) return;
        await this.transporter.sendMail({
            from,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
    }

    private async sendViaSES(from: string, options: EmailOptions): Promise<void> {
        if (!this.sesClient) return;

        const command = new SendEmailCommand({
            FromEmailAddress: from,
            Destination: {
                ToAddresses: [options.to],
            },
            Content: {
                Simple: {
                    Subject: { Data: options.subject },
                    Body: {
                        Html: options.html ? { Data: options.html } : undefined,
                        Text: options.text ? { Data: options.text } : undefined,
                    },
                },
            },
        });

        await this.sesClient.send(command);
    }

    private async sendViaEthereal(options: EmailOptions): Promise<void> {
        try {
            const testAccount = await nodemailer.createTestAccount();
            const etherealTransporter = nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: { user: testAccount.user, pass: testAccount.pass },
            });
            const info = await etherealTransporter.sendMail({
                from: 'Glotrade Test <no-reply@ethereal.email>',
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });
            const preview = nodemailer.getTestMessageUrl(info);
            if (preview) console.log('Ethereal preview URL:', preview);
        } catch (e) {
            console.warn('Ethereal fallback failed', e);
        }
    }

    /**
     * Shorthand for verification email
     */
    async sendVerificationEmail(email: string, url: string): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: "Verify your email",
            text: `Welcome to Glotrade! Please verify your account using this link: ${url}`,
            html: `<p>Welcome to <strong>Glotrade</strong>!</p><p>We're excited to have you on board. To get started and secure your account, please verify your email address.</p>`,
            cta: {
                label: "Verify My Account",
                url: url
            }
        });
    }

    /**
     * Shorthand for password reset email
     */
    async sendPasswordResetEmail(email: string, url: string): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: "Reset your password",
            text: `You requested a password reset. Use this link to proceed: ${url}`,
            html: `<p>We received a request to reset the password for your Glotrade account.</p><p>If you didn't make this request, you can safely ignore this email.</p>`,
            cta: {
                label: "Reset Password",
                url: url
            }
        });
    }

    /**
     * Shorthand for reactivation email
     */
    async sendReactivationEmail(email: string, url: string, deletionCount: number): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: "Account Reactivation Required",
            text: `Your account was marked for deletion. Click here to reactivate: ${url}`,
            html: `
        <p>Your Glotrade account was recently marked for deletion and requires reactivation to stay active.</p>
        <p>This is deletion attempt <strong>#${deletionCount}</strong>.</p>
        <p>Click the button below to reactivate your account immediately. This link expires in 24 hours.</p>
      `,
            cta: {
                label: "Reactivate My Account",
                url: url
            }
        });
    }

    /**
     * Send GloTrade Bazaar Ticket & Booking Confirmation Email
     */
    async sendBazaarConfirmationEmail(booking: {
        customerEmail: string;
        customerName: string;
        ticketCode: string;
        packageName: string;
        amount: number;
        reference: string;
        type: string;
    }): Promise<void> {
        const isFree = booking.amount <= 0;
        const formattedAmount = `₦${booking.amount.toLocaleString("en-NG")}`;
        const passUrl = `${process.env.FRONTEND_URL || "https://glotrade.online"}/bazaar/callback?reference=${booking.reference}`;

        const html = `
        <div style="background-color: #0f172a; padding: 30px; border-radius: 16px; color: #f8fafc; font-family: sans-serif;">
            <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: rgba(245, 158, 11, 0.15); color: #f59e0b; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(245, 158, 11, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                    GloTrade International Trade Fair 2026
                </span>
                <h1 style="color: #ffffff; margin-top: 12px; margin-bottom: 4px; font-size: 24px;">Booking & Ticket Confirmation</h1>
                <p style="color: #94a3b8; font-size: 13px; margin: 0;">1st – 5th December 2026 • Abuja, Nigeria</p>
            </div>

            <p style="color: #e2e8f0; font-size: 15px;">Dear <strong>${booking.customerName}</strong>,</p>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
                Thank you for booking your entry for <strong>GloTrade International Trade Fair 2026</strong>! Your transaction has been confirmed. Below is your official entry pass.
            </p>

            <div style="background-color: #020617; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block;">Official Pass / Ticket Code</span>
                            <span style="font-size: 26px; font-family: monospace; font-weight: bold; color: #f59e0b; display: block; margin-top: 2px;">${booking.ticketCode}</span>
                        </td>
                        <td align="right">
                            <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block;">Status</span>
                            <span style="font-size: 12px; font-weight: bold; color: #10b981; background: rgba(16, 185, 129, 0.15); padding: 3px 8px; border-radius: 10px; text-transform: uppercase;">CONFIRMED</span>
                        </td>
                    </tr>
                </table>

                <hr style="border: none; border-top: 1px solid #1e293b; margin: 16px 0;" />

                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #cbd5e1;">
                    <tr>
                        <td style="padding-bottom: 8px;"><strong>Package Tier:</strong></td>
                        <td align="right" style="padding-bottom: 8px; color: #ffffff;">${booking.packageName}</td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 8px;"><strong>Amount Paid:</strong></td>
                        <td align="right" style="padding-bottom: 8px; color: #f59e0b; font-weight: bold;">${isFree ? "FREE" : formattedAmount}</td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 8px;"><strong>Date & Duration:</strong></td>
                        <td align="right" style="padding-bottom: 8px; color: #ffffff;">1st – 5th December 2026 (Daily 9:00 AM)</td>
                    </tr>
                    <tr>
                        <td><strong>Venue:</strong></td>
                        <td align="right" style="color: #ffffff;">NACCAS, Asokoro, Abuja – Nigeria</td>
                    </tr>
                </table>
            </div>

            <p style="font-size: 13px; color: #94a3b8; text-align: center;">
                Please present your Pass Code <strong>${booking.ticketCode}</strong> at the gate for fast-track entry.
            </p>
        </div>
        `;

        await this.sendEmail({
            to: booking.customerEmail,
            subject: `🎟️ Pass Confirmed: GloTrade International Trade Fair 2026 (${booking.ticketCode})`,
            text: `Hi ${booking.customerName}, your GloTrade International Trade Fair 2026 booking is confirmed! Ticket Code: ${booking.ticketCode}. Package: ${booking.packageName}. Dates: 1st - 5th December 2026 in Abuja, Nigeria. View pass: ${passUrl}`,
            html,
            cta: {
                label: "View & Print Ticket Pass",
                url: passUrl,
            },
        });
    }

    /**
     * Send Rich Order Confirmation Email to Buyer
     */
    async sendOrderConfirmationEmail(orderData: {
        orderId: string;
        orderNumber: string;
        customerName: string;
        customerEmail: string;
        customerPhone?: string;
        totalAmount: number;
        currency: string;
        paymentMethod: string;
        paymentStatus: string;
        lineItems: Array<{
            productTitle: string;
            qty: number;
            unitPrice: number;
            currency?: string;
        }>;
        shippingDetails: {
            address: string;
            city: string;
            state?: string;
            country: string;
            phone?: string;
        };
        bankDetails?: {
            bankName: string;
            accountName: string;
            accountNumber: string;
            whatsappNumber: string;
        };
    }): Promise<void> {
        const isBankTransfer = orderData.paymentMethod === 'bank_transfer';
        const isPaid = orderData.paymentStatus === 'completed';
        const formattedAmount = `₦${orderData.totalAmount.toLocaleString("en-NG")}`;
        const orderUrl = `${process.env.FRONTEND_URL || "https://glotrade.online"}/orders/${orderData.orderId}`;
        const whatsappNumber = (orderData.bankDetails?.whatsappNumber || "2347044600924").replace(/[^0-9]/g, "");

        const bankBox = isBankTransfer && !isPaid ? `
        <div style="background: #fffbeb; border: 2px solid #fde68a; border-radius: 12px; padding: 18px; margin: 20px 0;">
            <div style="margin-bottom: 10px;">
                <span style="font-size: 15px; font-weight: bold; color: #92400e;">⚠️ Action Required: Complete Bank Transfer</span>
            </div>
            <p style="font-size: 13px; color: #78350f; margin: 0 0 12px 0; line-height: 1.4;">
                Please transfer the exact amount of <strong>${formattedAmount}</strong> to our official company bank account:
            </p>
            <table width="100%" style="background: #ffffff; border-radius: 8px; border: 1px solid #fef3c7; font-size: 13px; margin-bottom: 12px;" cellpadding="8" cellspacing="0">
                <tr>
                    <td style="color: #6b7280; width: 40%;">Bank Name:</td>
                    <td style="color: #111827; font-weight: bold;">${orderData.bankDetails?.bankName || "Wema Bank"}</td>
                </tr>
                <tr style="border-top: 1px solid #f3f4f6;">
                    <td style="color: #6b7280;">Account Name:</td>
                    <td style="color: #111827; font-weight: bold;">${orderData.bankDetails?.accountName || "GloTrade Platform Limited"}</td>
                </tr>
                <tr style="border-top: 1px solid #f3f4f6;">
                    <td style="color: #6b7280;">Account Number:</td>
                    <td style="color: #d97706; font-size: 16px; font-weight: 900; font-family: monospace;">${orderData.bankDetails?.accountNumber || "0127131496"}</td>
                </tr>
            </table>
            <p style="font-size: 12px; color: #92400e; margin: 0 0 12px 0;">
                After sending the transfer, click below to share your transfer receipt on WhatsApp for instant payment confirmation:
            </p>
            <div style="text-align: center;">
                <a href="https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi GloTrade Team, I have sent payment of ${formattedAmount} for Order #${orderData.orderId}. Attached is my transfer receipt.`)}" 
                   style="display: inline-block; background: #059669; color: #ffffff !important; text-decoration: none; padding: 11px 22px; border-radius: 8px; font-size: 13px; font-weight: bold;">
                   📱 Send Receipt on WhatsApp (+234 704 460 0924)
                </a>
            </div>
        </div>
        ` : '';

        const itemsRows = orderData.lineItems.map(item => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #1e293b; font-size: 14px;">
                    <strong>${item.productTitle}</strong>
                    <div style="font-size: 12px; color: #64748b;">Qty: ${item.qty} × ₦${item.unitPrice.toLocaleString("en-NG")}</div>
                </td>
                <td align="right" style="padding: 10px 0; color: #0f172a; font-weight: bold; font-size: 14px;">
                    ₦${(item.qty * item.unitPrice).toLocaleString("en-NG")}
                </td>
            </tr>
        `).join('');

        const contentHtml = `
            <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Dear <strong>${orderData.customerName}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                ${isPaid 
                    ? "Thank you for shopping with GloTrade! Your payment has been confirmed and your order is now being prepared for shipping."
                    : isBankTransfer
                    ? "Thank you for your order! Your items and inventory stock are currently reserved. Please finalize your bank transfer using the details below so we can process your shipment."
                    : "Thank you for your order! We have received your purchase request and will update you as it progresses."}
            </p>

            ${bankBox}

            <div style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 18px; margin: 20px 0;">
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                    <tr>
                        <td>
                            <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block;">Order Reference</span>
                            <span style="font-size: 16px; font-weight: bold; color: #0f172a; font-family: monospace;">#${orderData.orderId}</span>
                        </td>
                        <td align="right">
                            <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block;">Payment Status</span>
                            <span style="font-size: 12px; font-weight: bold; color: ${isPaid ? '#059669' : '#d97706'}; background: ${isPaid ? '#ecfdf5' : '#fffbeb'}; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">
                                ${isPaid ? 'PAID' : isBankTransfer ? 'PENDING TRANSFER' : orderData.paymentStatus.toUpperCase()}
                            </span>
                        </td>
                    </tr>
                </table>

                <div style="border-top: 1px solid #e2e8f0; padding-top: 12px;">
                    <div style="font-size: 12px; font-weight: bold; color: #475569; text-transform: uppercase; margin-bottom: 8px;">Order Items</div>
                    <table width="100%" cellpadding="0" cellspacing="0">
                        ${itemsRows}
                    </table>
                </div>

                <div style="border-top: 1px solid #e2e8f0; margin-top: 12px; padding-top: 12px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #475569;">
                        <tr>
                            <td style="padding-bottom: 6px;">Shipping:</td>
                            <td align="right" style="padding-bottom: 6px; color: #059669; font-weight: bold;">FREE</td>
                        </tr>
                        <tr>
                            <td style="font-size: 15px; font-weight: bold; color: #0f172a;">Total Amount:</td>
                            <td align="right" style="font-size: 16px; font-weight: 900; color: #ea580c;">${formattedAmount}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <div style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 16px; margin: 20px 0; font-size: 13px;">
                <div style="font-weight: bold; color: #0f172a; margin-bottom: 6px;">📦 Delivery Address</div>
                <div style="color: #334155; line-height: 1.5;">
                    <div><strong>${orderData.customerName}</strong></div>
                    <div>${orderData.shippingDetails.address}</div>
                    <div>${orderData.shippingDetails.city}, ${orderData.shippingDetails.country}</div>
                    ${orderData.shippingDetails.phone ? `<div>Phone: ${orderData.shippingDetails.phone}</div>` : ''}
                </div>
            </div>
        `;

        await this.sendEmail({
            to: orderData.customerEmail,
            subject: isBankTransfer && !isPaid 
                ? `⏳ Action Required: Bank Transfer for Order #${orderData.orderId.slice(-8)}`
                : `🛍️ Order Confirmed #${orderData.orderId.slice(-8)} - GloTrade`,
            text: `Hi ${orderData.customerName}, thank you for your order #${orderData.orderId}! Total: ${formattedAmount}. View order: ${orderUrl}`,
            html: contentHtml,
            cta: {
                label: "View & Track Order",
                url: orderUrl,
            },
        });
    }
}

export default new EmailService();
