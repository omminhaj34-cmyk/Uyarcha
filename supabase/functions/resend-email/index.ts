// resend-email: Supabase Edge Function to send contact form emails using Resend
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // 1. Handle CORS Preflight (OPTIONS)
  console.log(`[REQ METHOD]: ${req.method}`)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Parse and log payload
    const payload = await req.json()
    console.log('[PAYLOAD RECEIVED]:', JSON.stringify(payload, null, 2))

    const { name, email, subject, message } = payload

    // 3. Validation
    if (!name || !email || !subject || !message) {
      console.error('[VALIDATION FAILED]: Missing fields')
      return new Response(
        JSON.stringify({ success: false, error: 'All fields are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('[VALIDATION FAILED]: Invalid email format')
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!RESEND_API_KEY) {
      console.error('[CONFIG ERROR]: RESEND_API_KEY is not set in secrets')
      return new Response(
        JSON.stringify({ success: false, error: 'Internal server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // 4. Send email using Resend
    console.log('[RESEND]: Sending request...')
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Uyarcha Contact <onboarding@resend.dev>',
        to: 'uyarchatech@gmail.com',
        reply_to: email,
        subject: `New Contact Message: ${subject}`,
        html: `
          <h1>New Contact Message</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <br/>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        `,
      }),
    })

    const resData = await res.json()
    console.log('[RESEND RESPONSE]:', JSON.stringify(resData, null, 2))

    if (!res.ok) {
        return new Response(
          JSON.stringify({ success: false, error: resData.message || 'Failed to send email via Resend' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }

    return new Response(
      JSON.stringify({ success: true, data: resData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error('[CATCH ERROR]:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
