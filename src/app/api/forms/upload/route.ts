import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { form_id, file_name, file_type } = body

        if (!form_id || !file_name) {
            return NextResponse.json({ error: 'Missing form_id or file_name' }, { status: 400 })
        }

        const filePath = `${form_id}/${Date.now()}_${file_name}`

        // Generate a pre-signed URL for direct upload from the browser
        const { data, error } = await supabase.storage
            .from('form_uploads')
            .createSignedUploadUrl(filePath)

        if (error) {
            console.error('Storage Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ 
            success: true, 
            upload_url: data.signedUrl,
            file_path: filePath,
            public_url: `${supabaseUrl}/storage/v1/object/public/form_uploads/${filePath}`
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
