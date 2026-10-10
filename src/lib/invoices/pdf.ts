/**
 * Velodesk invoice / receipt PDF (A4), issued by Crelligent: Crelligent logo and name in
 * the header and a faint logo watermark behind the content. Built with pdf-lib (pure JS, no fonts or files
 * on disk, works on Vercel). Standard Helvetica can't draw "₦", so amounts in the PDF
 * use ISO codes ("NGN 50,000.00"), which is also the accounting convention.
 */
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib'
import {
    customerDisplayName,
    formatDate,
    formatMoney,
    formatPeriod,
    type Invoice,
    type Party,
} from './model'
import { CRELLIGENT_LOGO_JPG_BASE64 } from './crelligent-logo'

export type DocumentKind = 'invoice' | 'receipt'

// Crelligent brand (design-system/crelligent/tokens.css, light mode)
const hex = (h: string) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255)
const INK = hex('#0B1626')
const TEXT = hex('#1F2A3B')
const MUTED = hex('#5B6B82')
const LINE = hex('#DDE6F0')
const GREEN = hex('#00C985') // lime: fills only
const GREEN_DARK = hex('#0F6E56') // accent as text
const MINT = hex('#E9FAF3')
const SOFT = hex('#F5F8FC')

const W = 595.28
const H = 841.89
const M = 48 // page margin

/** Helvetica (WinAnsi) can't encode everything a customer might type; never crash on it. */
function safe(text: string): string {
    return text
        .replace(/₦/g, 'NGN ')
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^\x20-\x7E–—• -ÿ]/g, '?')
}

interface Fonts {
    regular: PDFFont
    bold: PDFFont
}

function textWidth(font: PDFFont, s: string, size: number) {
    return font.widthOfTextAtSize(safe(s), size)
}

function draw(page: PDFPage, s: string, x: number, y: number, size: number, font: PDFFont, color = TEXT, opts: { charSpacing?: number } = {}) {
    if (!s) return
    if (opts.charSpacing) {
        // pdf-lib has no letter-spacing option: place characters one by one
        let cx = x
        for (const ch of safe(s)) {
            page.drawText(ch, { x: cx, y, size, font, color })
            cx += font.widthOfTextAtSize(ch, size) + opts.charSpacing
        }
        return
    }
    page.drawText(safe(s), { x, y, size, font, color })
}

function drawRight(page: PDFPage, s: string, right: number, y: number, size: number, font: PDFFont, color = TEXT) {
    draw(page, s, right - textWidth(font, s, size), y, size, font, color)
}

/** Greedy word wrap to a max width; returns lines. */
function wrap(font: PDFFont, s: string, size: number, maxWidth: number): string[] {
    const out: string[] = []
    for (const para of s.split('\n')) {
        let line = ''
        for (const word of para.split(/\s+/).filter(Boolean)) {
            const next = line ? `${line} ${word}` : word
            if (textWidth(font, next, size) <= maxWidth || !line) line = next
            else {
                out.push(line)
                line = word
            }
        }
        if (line) out.push(line)
    }
    return out
}

function partyLines(p: Party, isSeller: boolean, seller?: Invoice['seller']): string[] {
    const lines: string[] = []
    if (isSeller && seller) {
        lines.push(seller.name)
        if (seller.address) lines.push(...seller.address.split('\n'))
        if (seller.rcNumber) lines.push(`RC ${seller.rcNumber}`)
        if (seller.tin) lines.push(`TIN ${seller.tin}`)
        lines.push(seller.email)
        return lines
    }
    if (p.company) lines.push(p.company)
    if (p.name && p.name !== p.company) lines.push(p.name)
    if (p.address) lines.push(...p.address.split('\n'))
    if (p.taxId) lines.push(`Tax ID ${p.taxId}`)
    if (p.email) lines.push(p.email)
    if (!lines.length) lines.push(customerDisplayName(p))
    return lines
}

export async function renderInvoicePdf(inv: Invoice, kind: DocumentKind): Promise<Uint8Array> {
    const doc = await PDFDocument.create()
    const isReceipt = kind === 'receipt'
    const title = isReceipt ? 'Receipt' : 'Invoice'
    const docNumber = isReceipt ? inv.receipt_number : inv.number
    doc.setTitle(`Velodesk ${title} ${docNumber}`)
    doc.setAuthor(inv.seller.name)
    doc.setSubject(`${title} ${docNumber}`)
    doc.setCreator('Velodesk')
    doc.setProducer('Velodesk')

    const page = doc.addPage([W, H])
    const f: Fonts = {
        regular: await doc.embedFont(StandardFonts.Helvetica),
        bold: await doc.embedFont(StandardFonts.HelveticaBold),
    }
    const money = (minor: number) => formatMoney(minor, inv.currency, { code: true })

    const logo = await doc.embedJpg(Buffer.from(CRELLIGENT_LOGO_JPG_BASE64, 'base64'))

    // ---- Watermark: large, faint Crelligent logo behind everything ------------------
    const wmW = 400
    const wmH = (logo.height / logo.width) * wmW
    page.drawImage(logo, { x: (W - wmW) / 2, y: (H - wmH) / 2 - 40, width: wmW, height: wmH, opacity: 0.07 })

    // ---- Header: Crelligent logo + name | title + number ----------------------------
    const logoH = 38
    const logoW = (logo.width / logo.height) * logoH
    let y = H - M - logoH
    page.drawImage(logo, { x: M, y, width: logoW, height: logoH })
    draw(page, 'Crelligent', M + logoW + 10, y + 17, 18, f.bold, INK)
    draw(page, '& Company Ltd  ·  Velodesk', M + logoW + 10, y + 3, 9, f.regular, MUTED)

    drawRight(page, title.toUpperCase(), W - M, y + 14, 22, f.bold, INK)
    drawRight(page, docNumber, W - M, y - 2, 10, f.regular, MUTED)

    y -= 18
    page.drawRectangle({ x: M, y, width: W - 2 * M, height: 3, color: GREEN })

    // ---- Status band ------------------------------------------------------------------
    y -= 58
    page.drawRectangle({ x: M, y, width: W - 2 * M, height: 46, color: MINT, opacity: 0.85, borderColor: hex('#C8F1E1'), borderWidth: 1 })
    const statusLabel = inv.status === 'refunded' ? 'REFUNDED' : inv.status === 'void' ? 'VOID' : 'PAID'
    // pill
    const pillW = textWidth(f.bold, statusLabel, 9) + 18
    page.drawRectangle({ x: M + 14, y: y + 15, width: pillW, height: 17, color: inv.status === 'paid' ? GREEN : MUTED })
    draw(page, statusLabel, M + 23, y + 20.5, 9, f.bold, inv.status === 'paid' ? INK : rgb(1, 1, 1))
    draw(
        page,
        isReceipt ? `Payment received ${formatDate(inv.paid_at)}` : `Paid in full on ${formatDate(inv.paid_at)}`,
        M + 14 + pillW + 10, y + 20.5, 10, f.regular, TEXT
    )
    drawRight(page, money(inv.total), W - M - 14, y + 18, 16, f.bold, INK)
    drawRight(page, isReceipt ? 'Amount paid' : 'Total', W - M - 14 - textWidth(f.bold, money(inv.total), 16) - 10, y + 20, 9, f.regular, MUTED)

    // ---- From / Billed to -------------------------------------------------------------
    y -= 34
    const colW = (W - 2 * M - 24) / 2
    const leftX = M
    const rightX = M + colW + 24
    draw(page, 'FROM', leftX, y, 8, f.bold, MUTED, { charSpacing: 1 })
    draw(page, 'BILLED TO', rightX, y, 8, f.bold, MUTED, { charSpacing: 1 })
    const sellerLines = partyLines({ name: inv.seller.name }, true, inv.seller)
    const customerLines = partyLines(inv.customer, false)
    let ly = y - 16
    sellerLines.forEach((l, i) => {
        for (const w of wrap(i === 0 ? f.bold : f.regular, l, 10, colW)) {
            draw(page, w, leftX, ly, 10, i === 0 ? f.bold : f.regular, i === 0 ? INK : TEXT)
            ly -= 14
        }
    })
    let ry = y - 16
    customerLines.forEach((l, i) => {
        for (const w of wrap(i === 0 ? f.bold : f.regular, l, 10, colW)) {
            draw(page, w, rightX, ry, 10, i === 0 ? f.bold : f.regular, i === 0 ? INK : TEXT)
            ry -= 14
        }
    })
    y = Math.min(ly, ry) - 14

    // ---- Details grid -----------------------------------------------------------------
    const details: [string, string][] = isReceipt
        ? [
            ['Receipt number', inv.receipt_number],
            ['For invoice', inv.number],
            ['Payment date', formatDate(inv.paid_at)],
            ['Payment method', inv.payment_method ?? 'Card'],
            ['Payment reference', inv.provider_reference],
            ['Billing period', formatPeriod(inv.period_start, inv.period_end)],
        ]
        : [
            ['Invoice number', inv.number],
            ['Invoice date', formatDate(inv.issued_at)],
            ['Date paid', formatDate(inv.paid_at)],
            ['Billing period', formatPeriod(inv.period_start, inv.period_end)],
            ['Payment method', inv.payment_method ?? 'Card'],
            ['Currency', inv.currency],
        ]
    const shown = details.filter(([, v]) => v)
    const cellW = (W - 2 * M) / 3
    const rows = Math.ceil(shown.length / 3)
    const gridH = rows * 38 + 10
    page.drawRectangle({ x: M, y: y - gridH, width: W - 2 * M, height: gridH, color: SOFT, opacity: 0.6, borderColor: LINE, borderWidth: 1 })
    shown.forEach(([k, v], i) => {
        const cx = M + 14 + (i % 3) * cellW
        const cy = y - 20 - Math.floor(i / 3) * 38
        draw(page, k, cx, cy, 8, f.regular, MUTED)
        const val = wrap(f.bold, v, 9.5, cellW - 20)[0] ?? ''
        draw(page, val, cx, cy - 14, 9.5, f.bold, INK)
    })
    y -= gridH + 30

    // ---- Line items -------------------------------------------------------------------
    const amountX = W - M
    draw(page, 'DESCRIPTION', M, y, 8, f.bold, MUTED, { charSpacing: 1 })
    drawRight(page, 'AMOUNT', amountX, y, 8, f.bold, MUTED)
    y -= 8
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: LINE })
    y -= 18
    const descLines = wrap(f.regular, inv.description, 10.5, W - 2 * M - 140)
    descLines.forEach((l, i) => {
        draw(page, l, M, y - i * 14, 10.5, f.regular, INK)
    })
    drawRight(page, money(inv.subtotal), amountX, y, 10.5, f.regular, INK)
    y -= descLines.length * 14
    const period = formatPeriod(inv.period_start, inv.period_end)
    if (period) {
        draw(page, period, M, y, 9, f.regular, MUTED)
        y -= 14
    }
    y -= 8
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: LINE })

    // ---- Totals -----------------------------------------------------------------------
    const labelX = W - M - 230
    y -= 20
    draw(page, inv.tax_label ? 'Subtotal (excl. VAT)' : 'Subtotal', labelX, y, 10, f.regular, TEXT)
    drawRight(page, money(inv.subtotal), amountX, y, 10, f.regular, TEXT)
    if (inv.tax_label) {
        y -= 18
        draw(page, inv.tax_label, labelX, y, 10, f.regular, TEXT)
        drawRight(page, money(inv.tax), amountX, y, 10, f.regular, TEXT)
    }
    y -= 14
    page.drawLine({ start: { x: labelX, y }, end: { x: W - M, y }, thickness: 1, color: LINE })
    y -= 20
    draw(page, isReceipt ? 'Amount paid' : 'Total', labelX, y, 12, f.bold, INK)
    drawRight(page, money(inv.total), amountX, y, 12, f.bold, INK)
    if (!isReceipt) {
        y -= 18
        draw(page, 'Amount due', labelX, y, 10, f.regular, MUTED)
        drawRight(page, money(0), amountX, y, 10, f.regular, MUTED)
    }

    // ---- Notes ------------------------------------------------------------------------
    y -= 46
    const note = isReceipt
        ? `This receipt confirms payment of ${money(inv.total)} for invoice ${inv.number}. Thank you for building with Velodesk.`
        : `This invoice was paid in full by card on ${formatDate(inv.paid_at)}. Your subscription renews automatically; cancel any time from Billing in your Velodesk dashboard.`
    for (const l of wrap(f.regular, note, 9.5, W - 2 * M)) {
        draw(page, l, M, y, 9.5, f.regular, TEXT)
        y -= 14
    }
    if (!inv.tax_label) {
        y -= 2
        draw(page, 'No VAT charged.', M, y, 8.5, f.regular, MUTED)
    }

    // ---- Footer -----------------------------------------------------------------------
    const fy = M + 6
    page.drawLine({ start: { x: M, y: fy + 26 }, end: { x: W - M, y: fy + 26 }, thickness: 1, color: LINE })
    const legal = [inv.seller.name, inv.seller.rcNumber ? `RC ${inv.seller.rcNumber}` : '', inv.seller.tin ? `TIN ${inv.seller.tin}` : '']
        .filter(Boolean)
        .join('  ·  ')
    draw(page, 'Velodesk is a product of Crelligent', M, fy + 10, 8.5, f.bold, INK)
    draw(page, legal, M, fy - 2, 8, f.regular, MUTED)
    drawRight(page, inv.seller.website, W - M, fy + 10, 8.5, f.bold, GREEN_DARK)
    drawRight(page, inv.seller.email, W - M, fy - 2, 8, f.regular, MUTED)

    return doc.save()
}

export function pdfFilename(inv: Pick<Invoice, 'number' | 'receipt_number'>, kind: DocumentKind) {
    return `Velodesk-${kind === 'receipt' ? 'Receipt' : 'Invoice'}-${kind === 'receipt' ? inv.receipt_number : inv.number}.pdf`
}
