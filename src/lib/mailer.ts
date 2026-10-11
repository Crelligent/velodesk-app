/**
 * Transactional email over SMTP (cPanel mailbox, same setup as the admin app). Server only.
 * Env: SMTP_HOST, SMTP_PORT (587), SMTP_USER, SMTP_PASS (the billing@crelligent.com mailbox),
 * optional BILLING_FROM (default billing@crelligent.com) and BILLING_FROM_NAME.
 * Never throws when SMTP isn't configured: returns { sent: false }.
 */
import type { Transporter } from 'nodemailer'

// Trim env values: a stray space or quote pasted into Vercel breaks SMTP login (535).
const env = (name: string) => (process.env[name] || '').trim().replace(/^["']|["']$/g, '')

let transporter: Transporter | null = null

export function mailerConfigured(): boolean {
    return Boolean(env('SMTP_HOST') && env('SMTP_USER') && env('SMTP_PASS'))
}

/** Billing emails always come from billing@crelligent.com unless overridden. */
export function billingFromAddress(): string {
    return env('BILLING_FROM') || 'billing@crelligent.com'
}

/** Tests only: replace the SMTP transport. */
export function __setTransporterForTests(t: Pick<Transporter, 'sendMail'> | null) {
    transporter = t as Transporter | null
}

// Loaded on first send (not at import), so a bundling problem shows up as a send error
// with a message instead of crashing every route that imports this module.
async function getTransporter(): Promise<Transporter> {
    if (transporter) return transporter
    const nodemailer = (await import('nodemailer')).default
    const port = parseInt(env('SMTP_PORT') || '587', 10)
    transporter = nodemailer.createTransport({
        host: env('SMTP_HOST'),
        port,
        secure: port === 465,
        auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
    })
    return transporter
}

export interface MailAttachment {
    filename: string
    content: Buffer | Uint8Array
    contentType?: string
}

export async function sendMail(msg: {
    to: string
    subject: string
    html: string
    text: string
    attachments?: MailAttachment[]
}): Promise<{ sent: true; messageId: string } | { sent: false; error: string }> {
    if (!mailerConfigured()) return { sent: false, error: 'smtp_not_configured' }
    try {
        const address = billingFromAddress()
        const from = `"${env('BILLING_FROM_NAME') || 'Velodesk by Crelligent'}" <${address}>`
        const info = await (await getTransporter()).sendMail({
            from,
            replyTo: env('BILLING_SUPPORT_EMAIL') || address,
            to: msg.to,
            subject: msg.subject,
            html: msg.html,
            text: msg.text,
            attachments: msg.attachments?.map(a => ({
                filename: a.filename,
                content: Buffer.from(a.content),
                contentType: a.contentType,
            })),
        })
        return { sent: true, messageId: info.messageId }
    } catch (error) {
        // SMTP errors can echo credentials or addresses: keep only a short code
        const code = (error as { code?: string; responseCode?: number })?.responseCode ?? (error as { code?: string })?.code
        console.error('SMTP send failed:', code ?? '', error instanceof Error ? error.message.slice(0, 200) : '')
        return { sent: false, error: `smtp_error${code ? `_${code}` : ''}` }
    }
}
