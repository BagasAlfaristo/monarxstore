// lib/email.ts
import nodemailer from "nodemailer";

// ---------- ENV HELPER ----------
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT
  ? Number(process.env.SMTP_PORT)
  : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

// MODE: kalau env belum lengkap → fallback ke "mock log"
const EMAIL_ENABLED =
  !!SMTP_HOST && !!SMTP_PORT && !!SMTP_USER && !!SMTP_PASS;

// Cache transporter biar nggak bikin ulang terus
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!EMAIL_ENABLED) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // 465 = SSL, selain itu STARTTLS
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!EMAIL_ENABLED) {
    // fallback: hanya log ke console
    console.log("=== MOCK EMAIL (SMTP NOT CONFIGURED) ===");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("Text:", options.text);
    console.log("HTML:", options.html);
    console.log("=======================================");
    return;
  }

  const t = getTransporter();
  if (!t) return;

  await t.sendMail({
    from: SMTP_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

// ---------- TYPES SEDERHANA UNTUK TEMPLATE ----------

type PublicOrder = {
  id: string;
  createdAt: Date;
  email: string;
};

type PublicProduct = {
  name: string;
  price: number;
  currency: string;
  slug: string;
};

type PublicItem = {
  id: string;
  type: string;
  value: string;
  note: string | null;
};

// ---------- TEMPLATE: EMAIL ORDER PAID (INFO) ----------

export async function sendOrderPaidEmail(params: {
  to: string;
  order: PublicOrder;
  product: PublicProduct;
}) {
  const { to, order, product } = params;

  const subject = `[MonarxStore] Payment successful for order ${order.id}`;
  const text = [
    `Hello,`,
    ``,
    `We have received the payment for order ${order.id}.`,
    `Product: ${product.name}`,
    `Price: ${product.price} ${product.currency}`,
    ``,
    `The item will be sent to this email shortly.`,
  ].join("\n");

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #0f172a;">
      <p>Hello,</p>
      <p>We have received the payment for order <strong>${order.id}</strong>.</p>

      <table style="margin-top: 12px; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 8px; color: #64748b;">Product</td>
          <td style="padding: 4px 8px;"><strong>${product.name}</strong></td>
        </tr>
        <tr>
          <td style="padding: 4px 8px; color: #64748b;">Price</td>
          <td style="padding: 4px 8px;">${product.price} ${product.currency}</td>
        </tr>
      </table>

      <p style="margin-top: 16px;">
        The item will be sent to this email shortly. Thank you for shopping at <strong>MonarxStore</strong>.
      </p>

      <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
        Order ID: ${order.id}<br/>
        Recipient Email: ${order.email}
      </p>
    </div>
  `;

  await sendEmail({ to, subject, text, html });
}

// ---------- TEMPLATE: EMAIL DELIVERY ITEM ----------

export async function sendDeliveryEmail(params: {
  to: string;
  order: PublicOrder;
  product: PublicProduct;
  items: PublicItem[];
}) {
  const { to, order, product, items } = params;

  const subject = `[MonarxStore] Delivery item for order ${order.id}`;

  const lines = items.map((item, index) => {
    return `#${index + 1} [${item.type}] ${item.value}${
      item.note ? ` (${item.note})` : ""
    }`;
  });

  const text = [
    `Hello,`,
    ``,
    `Below are the items for your order ${order.id}:`,
    `Product: ${product.name}`,
    ``,
    ...lines,
    ``,
    `Please keep this information secure.`,
  ].join("\n");

  const itemsHtml = items
    .map((item, index) => {
      return `
        <tr>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0;">
            ${index + 1}
          </td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0;">
            <code style="font-family: Menlo, Consolas, monospace; font-size: 12px;">
              [${item.type}] ${item.value}
            </code>
          </td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            ${item.note || "-"}
          </td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #0f172a;">
      <p>Hello,</p>
      <p>Below are the items for your order <strong>${order.id}</strong> (product: <strong>${product.name}</strong>):</p>

      <table style="margin-top: 12px; border-collapse: collapse; width: 100%; max-width: 640px;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th align="left" style="padding: 6px 8px; font-size: 12px; color: #64748b;">#</th>
            <th align="left" style="padding: 6px 8px; font-size: 12px; color: #64748b;">Item</th>
            <th align="left" style="padding: 6px 8px; font-size: 12px; color: #64748b;">Note</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <p style="margin-top: 16px;">
        Please keep this information secure. If there is an issue with the account/code, please reply to this email.
      </p>

      <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
        Order ID: ${order.id}<br/>
        Email tujuan: ${order.email}
      </p>
    </div>
  `;

  await sendEmail({ to, subject, text, html });
}
