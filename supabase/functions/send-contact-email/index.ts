// Supabase Edge Function to send emails via Resend with hardened security
/// <reference path="../deno.d.ts" />

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const TURNSTILE_SECRET_KEY = Deno.env.get('TURNSTILE_SECRET_KEY')
const CONTACT_RECIPIENT_EMAIL = Deno.env.get('CONTACT_RECIPIENT_EMAIL') || 'uyarchatech@gmail.com'

// Production allowed origin
const ALLOWED_ORIGIN = 'https://uyarcha.tech'

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || ''
  // Allow production domain and localhost in local development
  const allowOrigin = (origin === ALLOWED_ORIGIN || origin.startsWith('http://localhost:')) 
    ? origin 
    : ALLOWED_ORIGIN

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

// Basic per-IP in-memory rate limiting: max 5 requests per 10 minutes
const ipRateLimits = new Map<string, { count: number; expiresAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = ipRateLimits.get(ip)

  if (!record || record.expiresAt < now) {
    ipRateLimits.set(ip, { count: 1, expiresAt: now + 10 * 60 * 1000 })
    return true
  }

  if (record.count >= 5) {
    return false
  }

  record.count += 1
  return true
}

// Clean up expired rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of ipRateLimits.entries()) {
    if (record.expiresAt < now) {
      ipRateLimits.delete(ip)
    }
  }
}, 60 * 1000)

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  }

  try {
    // 1. Rate Limiting Check
    const clientIp = req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      'unknown'

    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please wait a few minutes before trying again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }

    const payload = await req.json()
    const { name, email, subject, message, honeypot, turnstileToken } = payload

    // 2. Honeypot check (hidden bot field: if filled, silently discard)
    if (honeypot && String(honeypot).trim().length > 0) {
      console.warn(`Honeypot triggered from IP: ${clientIp}`)
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 3. Cloudflare Turnstile Verification (if secret configured)
    if (TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return new Response(
          JSON.stringify({ error: 'Bot verification token missing' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET_KEY,
          response: turnstileToken,
          remoteip: clientIp,
        }),
      })

      const turnstileData = await turnstileRes.json()
      if (!turnstileData.success) {
        console.error('Turnstile verification failed:', turnstileData)
        return new Response(
          JSON.stringify({ error: 'Anti-bot verification failed. Please try again.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
    }

    // 4. Input Validations and Length Limits
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Name is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    if (name.length > 100) {
      return new Response(JSON.stringify({ error: 'Name exceeds maximum length of 100 characters' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    if (email.length > 255) {
      return new Response(JSON.stringify({ error: 'Email exceeds maximum length of 255 characters' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address format' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Subject is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    if (subject.length > 200) {
      return new Response(JSON.stringify({ error: 'Subject exceeds maximum length of 200 characters' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    if (message.length > 5000) {
      return new Response(JSON.stringify({ error: 'Message exceeds maximum length of 5000 characters' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      return new Response(JSON.stringify({ error: 'Email delivery service is currently not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // 5. HTML Escape all inputs before template interpolation
    const safeName = escapeHtml(name.trim())
    const safeEmail = escapeHtml(email.trim())
    const safeSubject = escapeHtml(subject.trim())
    const safeMessage = escapeHtml(message.trim())

    // 6. Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Uyarcha Contact <onboarding@resend.dev>',
        to: CONTACT_RECIPIENT_EMAIL,
        reply_to: email.trim(),
        subject: `New Contact Message: ${safeSubject}`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 24px;">
            <h2 style="color: #ff6600; margin-top: 0;">New Contact Inquiry from Uyarcha.tech</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            <p><strong>Subject:</strong> ${safeSubject}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p><strong>Message:</strong></p>
            <div style="background: #f9f9f9; padding: 16px; border-radius: 6px; white-space: pre-wrap; font-size: 14px;">${safeMessage}</div>
            <p style="font-size: 11px; color: #999; margin-top: 24px;">Sent securely from Uyarcha Edge Function.</p>
          </div>
        `,
      }),
    })

    const resData = await res.json()

    if (!res.ok) {
      console.error('Resend delivery failed:', resData)
      return new Response(JSON.stringify({ error: resData.message || 'Failed to dispatch email' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Edge function handler error:', error.message)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
