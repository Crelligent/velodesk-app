/**
 * Velodesk billing emails (receipt, upcoming charge, payment failed), sent by Crelligent
 * from billing@crelligent.com in the CRELLIGENT look: navy header with the Crelligent logo
 * and name, lime accent. Pure: returns { subject, html, text }.
 * Tables + inline styles + hosted PNGs only, so they render in Gmail, Outlook, Apple Mail
 * and on phones.
 * Images live in public/email/ and are served from NEXT_PUBLIC_APP_URL.
 */
import {
    customerDisplayName,
    formatDate,
    formatMoney,
    formatPeriod,
    type Invoice,
} from './model'

// Crelligent brand (design-system/crelligent/tokens.css, light mode): navy + lime
const C = {
    navy: '#08111F',
    ink: '#0B1626',
    green: '#00C985',     // lime: fills only (fails as text on white)
    greenDark: '#0F6E56', // accent as text / links
    mint: '#E9FAF3',
    amber: '#9A5B0B',
    amberBg: '#FFF8EB',
    page: '#F5F8FC',
    text: '#1F2A3B',
    muted: '#5B6B82',
    line: '#DDE6F0',
}
const HEAD = "'Space Grotesk','Segoe UI',Roboto,Helvetica,Arial,sans-serif"
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

export interface EmailContent {
    subject: string
    html: string
    text: string
}

export const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function appUrl(base?: string) {
    return (base || process.env.NEXT_PUBLIC_APP_URL || 'https://velodesk.crelligent.com').replace(/\/+$/, '')
}

const P = (t: string, extra = '') =>
    `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.65;color:${C.text};${extra}">${t}</p>`

const button = (href: string, label: string) => `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 22px;">
          <tr><td align="center" style="border-radius:10px;background:${C.green};">
            <a href="${href}" style="display:inline-block;padding:13px 26px;font-family:${FONT};font-size:15px;font-weight:700;color:${C.navy};text-decoration:none;border-radius:10px;">${label}</a>
          </td></tr>
        </table>`

/** Label / value rows */
const detailRows = (rows: [string, string][]) =>
    rows
        .filter(([, v]) => v)
        .map(
            ([k, v]) => `
            <tr>
              <td style="padding:7px 0;font-family:${FONT};font-size:13px;color:${C.muted};">${esc(k)}</td>
              <td align="right" style="padding:7px 0;font-family:${FONT};font-size:13px;color:${C.ink};font-weight:600;">${esc(v)}</td>
            </tr>`
        )
        .join('')

function layout(opts: { title: string; preheader: string; base: string; body: string }) {
    const A = `${opts.base}/email`
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(opts.title)}</title>
<style>
  @media only screen and (max-width:480px) {
    .vd-tag { display:none !important; }
    .vd-pad { padding-left:22px !important; padding-right:22px !important; }
    .vd-amount { font-size:30px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${C.line};">
      <tr><td style="background:${C.navy};padding:20px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td valign="middle">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td valign="middle" style="padding-right:12px;"><img src="${A}/crelligent-logo.png" width="36" height="36" alt="Crelligent" style="display:block;border:0;outline:none;width:36px;height:36px;"></td>
              <td valign="middle" style="font-family:${HEAD};font-size:21px;font-weight:700;letter-spacing:-0.2px;color:#ffffff;line-height:24px;">Crelligent</td>
            </tr></table>
          </td>
          <td class="vd-tag" align="right" style="font-family:${FONT};font-size:12px;color:#8A94A6;">Billing &middot; Velodesk</td>
        </tr></table>
      </td></tr>
      <tr><td style="height:4px;line-height:4px;font-size:0;background:${C.green};">&nbsp;</td></tr>
${opts.body}
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px auto 0;">
      <tr><td align="center" style="font-family:${FONT};font-size:12px;line-height:1.6;color:${C.muted};">
        <strong style="color:${C.ink};">Crelligent &amp; Company Ltd</strong> &middot; <a href="https://crelligent.com" style="color:${C.muted};text-decoration:underline;">crelligent.com</a><br>
        Velodesk is a product of Crelligent
      </td></tr>
      <tr><td align="center" style="padding:12px 0 4px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding:0 5px;"><a href="https://linkedin.com/company/crelligent" style="text-decoration:none;"><img src="${A}/icon-linkedin.png" width="28" height="28" alt="LinkedIn" style="display:block;border:0;outline:none;width:28px;height:28px;"></a></td>
          <td style="padding:0 5px;"><a href="https://x.com/crelligent" style="text-decoration:none;"><img src="${A}/icon-x.png" width="28" height="28" alt="X" style="display:block;border:0;outline:none;width:28px;height:28px;"></a></td>
          <td style="padding:0 5px;"><a href="https://instagram.com/crelligent" style="text-decoration:none;"><img src="${A}/icon-instagram.png" width="28" height="28" alt="Instagram" style="display:block;border:0;outline:none;width:28px;height:28px;"></a></td>
        </tr></table>
      </td></tr>
      <tr><td align="center" style="padding-top:8px;font-family:${FONT};font-size:11px;color:#8A97AA;">Lagos, Nigeria &middot; Sent from billing@crelligent.com</td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

const FOOTER_TEXT = 'Crelligent & Company Ltd · crelligent.com\nVelodesk is a product of Crelligent'

// ---------------------------------------------------------------------------
// Receipt (sent when a charge succeeds; invoice + receipt PDFs attached)
// ---------------------------------------------------------------------------

export function receiptEmail(inv: Invoice, opts: { appUrl?: string } = {}): EmailContent {
    const base = appUrl(opts.appUrl)
    const billingUrl = `${base}/billing`
    const amount = formatMoney(inv.total, inv.currency)
    const firstName = (inv.customer.name || '').trim().split(/\s+/)[0] || 'there'
    const period = formatPeriod(inv.period_start, inv.period_end)
    const renews = inv.period_end ? formatDate(inv.period_end) : ''

    const subject = `Your Velodesk receipt ${inv.receipt_number}`
    const preheader = `We received ${amount} for your ${planShort(inv)}. Receipt and invoice attached.`

    const lineRows = [
        `<tr>
              <td style="padding:10px 0;font-family:${FONT};font-size:14px;line-height:1.5;color:${C.text};">${esc(inv.description)}${period ? `<br><span style="font-size:12px;color:${C.muted};">${esc(period)}</span>` : ''}</td>
              <td align="right" valign="top" style="padding:10px 0;font-family:${FONT};font-size:14px;color:${C.text};white-space:nowrap;">${esc(formatMoney(inv.subtotal, inv.currency))}</td>
            </tr>`,
        inv.tax_label
            ? `<tr>
              <td style="padding:6px 0;font-family:${FONT};font-size:13px;color:${C.muted};">${esc(inv.tax_label)}</td>
              <td align="right" style="padding:6px 0;font-family:${FONT};font-size:13px;color:${C.muted};white-space:nowrap;">${esc(formatMoney(inv.tax, inv.currency))}</td>
            </tr>`
            : '',
        `<tr>
              <td style="padding:12px 0 2px;border-top:1px solid ${C.line};font-family:${FONT};font-size:14px;font-weight:700;color:${C.ink};">Total paid</td>
              <td align="right" style="padding:12px 0 2px;border-top:1px solid ${C.line};font-family:${FONT};font-size:14px;font-weight:700;color:${C.ink};white-space:nowrap;">${esc(amount)}</td>
            </tr>`,
    ].join('')

    const body = `
      <tr><td class="vd-pad" style="padding:30px 32px 6px;">
        <p style="margin:0 0 6px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.greenDark};">Payment received</p>
        <p class="vd-amount" style="margin:0 0 4px;font-family:${FONT};font-size:36px;line-height:1.15;font-weight:700;color:${C.ink};">${esc(amount)}</p>
        <p style="margin:0 0 24px;font-family:${FONT};font-size:13px;color:${C.muted};">Paid ${esc(formatDate(inv.paid_at))}${inv.payment_method ? ` &middot; ${esc(inv.payment_method)}` : ''}</p>

        ${P(`Hi ${esc(firstName)},`)}
        ${P(`Thank you. Your <strong>${esc(planShort(inv))}</strong> is active${renews ? ` and renews on <strong>${esc(renews)}</strong>` : ''}. Your receipt and invoice are attached as PDFs for your records.`)}

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 20px;">
          <tr><td style="background:#FAFBFD;border:1px solid ${C.line};border-radius:10px;padding:16px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${detailRows([
        ['Receipt number', inv.receipt_number],
        ['Invoice number', inv.number],
        ['Billed to', customerDisplayName(inv.customer)],
        ['Payment method', inv.payment_method ?? ''],
    ])}
            </table>
          </td></tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;">
${lineRows}
        </table>

        ${button(billingUrl, 'View billing &amp; invoices &rarr;')}
      </td></tr>

      <tr><td style="background:#FAFBFD;border-top:1px solid ${C.line};padding:16px 32px;">
        <p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.6;color:${C.muted};">Questions about this charge? Reply to this email or write to <a href="mailto:${esc(inv.seller.email)}" style="color:${C.greenDark};text-decoration:underline;">${esc(inv.seller.email)}</a>. You can cancel any time from <a href="${billingUrl}" style="color:${C.greenDark};text-decoration:underline;">Billing</a>.</p>
      </td></tr>`

    const text = [
        `PAYMENT RECEIVED: ${amount}`,
        `Paid ${formatDate(inv.paid_at)}${inv.payment_method ? ` · ${inv.payment_method}` : ''}`,
        '',
        `Hi ${firstName},`,
        `Thank you. Your ${planShort(inv)} is active${renews ? ` and renews on ${renews}` : ''}. Your receipt and invoice are attached as PDFs for your records.`,
        '',
        `Receipt number: ${inv.receipt_number}`,
        `Invoice number: ${inv.number}`,
        `Billed to: ${customerDisplayName(inv.customer)}`,
        '',
        `${inv.description}${period ? ` (${period})` : ''}: ${formatMoney(inv.subtotal, inv.currency)}`,
        ...(inv.tax_label ? [`${inv.tax_label}: ${formatMoney(inv.tax, inv.currency)}`] : []),
        `Total paid: ${amount}`,
        '',
        `View billing and invoices: ${billingUrl}`,
        `Questions? Reply to this email or write to ${inv.seller.email}.`,
        '',
        FOOTER_TEXT,
    ].join('\n')

    return { subject, html: layout({ title: subject, preheader, base, body }), text }
}

// ---------------------------------------------------------------------------
// Payment failed (first failure of an episode; access continues for the grace period)
// ---------------------------------------------------------------------------

export interface PaymentFailedInput {
    name: string | null
    planName: string
    amountMinor: number | null
    currency: string | null
    paymentMethod: string | null
    accessUntil: string // ISO: end of the grace period
}

export function paymentFailedEmail(input: PaymentFailedInput, opts: { appUrl?: string } = {}): EmailContent {
    const base = appUrl(opts.appUrl)
    const billingUrl = `${base}/billing`
    const firstName = (input.name || '').trim().split(/\s+/)[0] || 'there'
    const amount = input.amountMinor != null && input.currency ? formatMoney(input.amountMinor, input.currency) : null
    const until = formatDate(input.accessUntil)
    const card = input.paymentMethod ? ` on your ${input.paymentMethod}` : ''

    const subject = `Action needed: your Velodesk payment didn't go through`
    const preheader = `Update your card by ${until} to keep your PMF Score, integrations and data room running.`

    const body = `
      <tr><td class="vd-pad" style="padding:30px 32px 6px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
          <tr><td style="background:${C.amberBg};border:1px solid #FDE68A;border-radius:10px;padding:16px 20px;">
            <p style="margin:0 0 4px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.amber};">Payment declined</p>
            <p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.55;color:${C.text};">Your access continues until <strong>${esc(until)}</strong>. Update your card before then to avoid interruption.</p>
          </td></tr>
        </table>

        ${P(`Hi ${esc(firstName)},`)}
        ${P(`We tried to charge ${amount ? `<strong>${esc(amount)}</strong>` : 'your subscription'}${esc(card)} for your <strong>${esc(input.planName)}</strong>, but the payment was declined. This usually means the card has expired, has insufficient funds, or your bank blocked the charge.`)}
        ${P(`Updating your card takes a minute, and we'll retry the payment automatically.`)}
        ${button(billingUrl, 'Update payment card &rarr;')}
        ${P(`If you'd rather not continue, you can cancel in one click from <a href="${billingUrl}" style="color:${C.greenDark};text-decoration:underline;">Billing</a>.`, `font-size:14px;color:${C.muted};`)}
      </td></tr>

      <tr><td style="background:#FAFBFD;border-top:1px solid ${C.line};padding:16px 32px;">
        <p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.6;color:${C.muted};">Need help? Reply to this email and we'll sort it out with you.</p>
      </td></tr>`

    const text = [
        `PAYMENT DECLINED`,
        `Your access continues until ${until}. Update your card before then to avoid interruption.`,
        '',
        `Hi ${firstName},`,
        `We tried to charge ${amount ?? 'your subscription'}${card} for your ${input.planName}, but the payment was declined. This usually means the card has expired, has insufficient funds, or your bank blocked the charge.`,
        `Updating your card takes a minute, and we'll retry the payment automatically.`,
        '',
        `Update payment card: ${billingUrl}`,
        '',
        `If you'd rather not continue, you can cancel from Billing: ${billingUrl}`,
        `Need help? Reply to this email.`,
        '',
        FOOTER_TEXT,
    ].join('\n')

    return { subject, html: layout({ title: subject, preheader, base, body }), text }
}

// ---------------------------------------------------------------------------
// Upcoming charge (heads-up a few days before each renewal / the first charge after a trial)
// ---------------------------------------------------------------------------

export interface UpcomingChargeInput {
    name: string | null
    planName: string            // 'Velodesk Startup plan'
    amountMinor: number | null
    currency: string | null
    chargeDate: string          // ISO
    trialEnding: boolean        // first charge after a free trial
    paymentMethod?: string | null
}

export function upcomingChargeEmail(input: UpcomingChargeInput, opts: { appUrl?: string } = {}): EmailContent {
    const base = appUrl(opts.appUrl)
    const billingUrl = `${base}/billing`
    const firstName = (input.name || '').trim().split(/\s+/)[0] || 'there'
    const amount = input.amountMinor != null && input.currency ? formatMoney(input.amountMinor, input.currency) : null
    const date = formatDate(input.chargeDate)
    const card = input.paymentMethod ? `your ${input.paymentMethod}` : 'the card on file'

    const subject = input.trialEnding
        ? `Your Velodesk free trial ends on ${date}`
        : `Your Velodesk plan renews on ${date}${amount ? ` (${amount})` : ''}`
    const preheader = `${amount ?? 'Your plan price'} will be charged to ${card} on ${date}. No action needed to continue.`
    const lead = input.trialEnding
        ? `Your free trial of the <strong>${esc(input.planName)}</strong> ends on <strong>${esc(date)}</strong>. To keep your PMF Score, integrations and data room running, we'll charge ${amount ? `<strong>${esc(amount)}</strong>` : 'your plan price'} to ${esc(card)} that day, and then every month.`
        : `Just a heads-up: your <strong>${esc(input.planName)}</strong> renews on <strong>${esc(date)}</strong>, and we'll charge ${amount ? `<strong>${esc(amount)}</strong>` : 'your plan price'} to ${esc(card)}.`

    const body = `
      <tr><td class="vd-pad" style="padding:30px 32px 6px;">
        <p style="margin:0 0 6px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.greenDark};">${input.trialEnding ? 'Trial ending soon' : 'Upcoming charge'}</p>
        <p class="vd-amount" style="margin:0 0 4px;font-family:${FONT};font-size:36px;line-height:1.15;font-weight:700;color:${C.ink};">${esc(amount ?? input.planName)}</p>
        <p style="margin:0 0 24px;font-family:${FONT};font-size:13px;color:${C.muted};">On ${esc(date)} &middot; ${esc(card.replace(/^your /, ''))}</p>

        ${P(`Hi ${esc(firstName)},`)}
        ${P(lead)}
        ${P(`There's nothing you need to do to continue. You'll get a receipt and invoice by email as soon as the payment goes through.`)}
        ${button(billingUrl, 'Manage billing &rarr;')}
        ${P(`Want to change your card or cancel? Do it from <a href="${billingUrl}" style="color:${C.greenDark};text-decoration:underline;">Billing</a> before ${esc(date)} and you won't be charged.`, `font-size:14px;color:${C.muted};`)}
      </td></tr>

      <tr><td style="background:#FAFBFD;border-top:1px solid ${C.line};padding:16px 32px;">
        <p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.6;color:${C.muted};">Questions? Reply to this email and we'll help.</p>
      </td></tr>`

    const text = [
        input.trialEnding ? 'TRIAL ENDING SOON' : 'UPCOMING CHARGE',
        `${amount ?? input.planName} on ${date}`,
        '',
        `Hi ${firstName},`,
        lead.replace(/<[^>]+>/g, ''),
        `There's nothing you need to do to continue. You'll get a receipt and invoice by email as soon as the payment goes through.`,
        '',
        `Manage billing: ${billingUrl}`,
        `Want to change your card or cancel? Do it from Billing before ${date} and you won't be charged.`,
        '',
        FOOTER_TEXT,
    ].join('\n')

    return { subject, html: layout({ title: subject, preheader, base, body }), text }
}

/** 'Velodesk Startup plan (monthly subscription)' -> 'Velodesk Startup plan' */
function planShort(inv: Pick<Invoice, 'description'>) {
    return inv.description.replace(/\s*\(.*\)\s*$/, '')
}
