import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { pdfFilename, renderInvoicePdf, type DocumentKind } from '@/lib/invoices/pdf'
import type { Invoice } from '@/lib/invoices/model'

/**
 * GET /api/billing/invoices/:id/pdf?doc=invoice|receipt (session user only)
 * Read through the user's own client, so RLS guarantees they only get their own invoices.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const doc: DocumentKind = new URL(request.url).searchParams.get('doc') === 'receipt' ? 'receipt' : 'invoice'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data, error } = await supabase
        .from('invoices')
        .select('id, number, receipt_number, status, provider, provider_reference, currency, subtotal, tax, total, tax_rate, tax_label, plan, description, period_start, period_end, issued_at, paid_at, payment_method, customer, seller')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle()
    if (error) return NextResponse.json({ error: 'Could not load invoice' }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const pdf = await renderInvoicePdf(data as Invoice, doc)
    return new NextResponse(Buffer.from(pdf), {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${pdfFilename(data as Invoice, doc)}"`,
            'Cache-Control': 'private, no-store',
        },
    })
}
