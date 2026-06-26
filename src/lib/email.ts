/**
 * Velodesk Email Module
 * Email notifications using Resend
 */

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

interface PMFReportEmailData {
  recipientName: string
  recipientEmail: string
  companyName: string
  pmfScore: number
  insights: string[]
  reportUrl: string
}

interface WelcomeEmailData {
  name: string
  email: string
  companyName: string
}

// Send email via Resend API
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.log('Email not sent - RESEND_API_KEY not configured')
    console.log('Would send:', options)
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: options.from || 'Velodesk <noreply@velodesk.app>',
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Email send failed:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Email error:', error)
    return false
  }
}

// Welcome email for new users
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 300; margin: 0;">Welcome to Velodesk</h1>
    </div>
    
    <div style="background: #0a0a0a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px;">
      <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Hi ${data.name},
      </p>
      
      <p style="color: #a0a0a0; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        Welcome to Velodesk! We're excited to help ${data.companyName} achieve product-market fit.
      </p>
      
      <p style="color: #a0a0a0; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        Here's what you can do next:
      </p>
      
      <ul style="color: #a0a0a0; font-size: 15px; line-height: 1.8; padding-left: 20px; margin: 0 0 30px;">
        <li>Connect your data sources (analytics, CRM, payments)</li>
        <li>View your real-time PMF score</li>
        <li>Get AI-powered insights and recommendations</li>
        <li>Share investor-ready reports</li>
      </ul>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="display: inline-block; background: #ffffff; color: #000000; padding: 14px 32px; text-decoration: none; font-weight: 500; border-radius: 8px; font-size: 14px;">
          Go to Dashboard
        </a>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 40px;">
      <p style="color: #606060; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} Velodesk. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`

  return sendEmail({
    to: data.email,
    subject: `Welcome to Velodesk, ${data.name}!`,
    html,
  })
}

// PMF Report shared notification
export async function sendPMFReportEmail(data: PMFReportEmailData): Promise<boolean> {
  const scoreColor = data.pmfScore >= 70 ? '#22c55e' : data.pmfScore >= 50 ? '#3b82f6' : '#f59e0b'
  const scoreLabel = data.pmfScore >= 80 ? 'Strong PMF' : data.pmfScore >= 60 ? 'Emerging PMF' : data.pmfScore >= 40 ? 'Searching' : 'Pre-PMF'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 300; margin: 0;">PMF Report from ${data.companyName}</h1>
    </div>
    
    <div style="background: #0a0a0a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px;">
      <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Hi ${data.recipientName},
      </p>
      
      <p style="color: #a0a0a0; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
        ${data.companyName} has shared their Product-Market Fit report with you.
      </p>
      
      <!-- PMF Score Card -->
      <div style="text-align: center; background: rgba(255,255,255,0.03); border-radius: 12px; padding: 30px; margin-bottom: 30px;">
        <div style="font-size: 64px; font-weight: 200; color: ${scoreColor}; margin-bottom: 8px;">
          ${data.pmfScore}
        </div>
        <div style="font-size: 14px; color: #606060; text-transform: uppercase; letter-spacing: 2px;">
          ${scoreLabel}
        </div>
      </div>
      
      <!-- Insights -->
      ${data.insights.length > 0 ? `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #ffffff; font-size: 14px; font-weight: 500; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">
          Key Insights
        </h3>
        <ul style="color: #a0a0a0; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
          ${data.insights.slice(0, 3).map(insight => `<li>${insight}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      
      <div style="text-align: center;">
        <a href="${data.reportUrl}" 
           style="display: inline-block; background: #ffffff; color: #000000; padding: 14px 32px; text-decoration: none; font-weight: 500; border-radius: 8px; font-size: 14px;">
          View Full Report
        </a>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 40px;">
      <p style="color: #606060; font-size: 12px; margin: 0 0 8px;">
        Verified by Velodesk
      </p>
      <p style="color: #404040; font-size: 11px; margin: 0;">
        © ${new Date().getFullYear()} Velodesk. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`

  return sendEmail({
    to: data.recipientEmail,
    subject: `PMF Report from ${data.companyName} - Score: ${data.pmfScore}`,
    html,
  })
}

// Weekly digest email
export async function sendWeeklyDigest(
  email: string,
  name: string,
  data: {
    currentScore: number
    previousScore: number
    topInsight: string
    connectedIntegrations: number
  }
): Promise<boolean> {
  const scoreDiff = data.currentScore - data.previousScore
  const scoreChange = scoreDiff > 0 ? `+${scoreDiff}` : `${scoreDiff}`
  const changeColor = scoreDiff > 0 ? '#22c55e' : scoreDiff < 0 ? '#ef4444' : '#606060'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 300; margin: 0;">Your Weekly PMF Update</h1>
    </div>
    
    <div style="background: #0a0a0a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px;">
      <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
        Hi ${name}, here's your PMF summary for this week.
      </p>
      
      <div style="display: flex; gap: 20px; margin-bottom: 30px;">
        <div style="flex: 1; text-align: center; background: rgba(255,255,255,0.03); border-radius: 8px; padding: 20px;">
          <div style="font-size: 36px; font-weight: 200; color: #ffffff;">${data.currentScore}</div>
          <div style="font-size: 12px; color: #606060;">Current Score</div>
        </div>
        <div style="flex: 1; text-align: center; background: rgba(255,255,255,0.03); border-radius: 8px; padding: 20px;">
          <div style="font-size: 36px; font-weight: 200; color: ${changeColor};">${scoreChange}</div>
          <div style="font-size: 12px; color: #606060;">Change</div>
        </div>
      </div>
      
      ${data.topInsight ? `
      <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <div style="font-size: 12px; color: #606060; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
          This Week's Top Insight
        </div>
        <p style="color: #e0e0e0; font-size: 14px; line-height: 1.6; margin: 0;">
          ${data.topInsight}
        </p>
      </div>
      ` : ''}
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="display: inline-block; background: #ffffff; color: #000000; padding: 14px 32px; text-decoration: none; font-weight: 500; border-radius: 8px; font-size: 14px;">
          View Dashboard
        </a>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 40px;">
      <p style="color: #404040; font-size: 11px; margin: 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="color: #606060;">Unsubscribe</a> from weekly updates
      </p>
    </div>
  </div>
</body>
</html>`

  return sendEmail({
    to: email,
    subject: `Weekly PMF Update: Score ${data.currentScore} (${scoreChange})`,
    html,
  })
}

// Team invite email
export async function sendTeamInviteEmail(
  inviteeEmail: string,
  data: {
    orgName: string
    inviterName: string
    role: string
    inviteUrl: string
  }
): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 300; margin: 0;">You're Invited to Join ${data.orgName}</h1>
    </div>
    
    <div style="background: #0a0a0a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px;">
      <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Hi there,
      </p>
      
      <p style="color: #a0a0a0; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        ${data.inviterName} has invited you to join <strong style="color: #ffffff;">${data.orgName}</strong> on Velodesk as a <strong style="color: #22c55e;">${data.role}</strong>.
      </p>
      
      <p style="color: #a0a0a0; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
        With Velodesk, you'll be able to:
      </p>
      
      <ul style="color: #a0a0a0; font-size: 15px; line-height: 1.8; padding-left: 20px; margin: 0 0 30px;">
        <li>Track your team's PMF score in real-time</li>
        <li>Collaborate on experiments and validations</li>
        <li>Access shared reports and insights</li>
      </ul>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${data.inviteUrl}" 
           style="display: inline-block; background: #22c55e; color: #000000; padding: 14px 32px; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 14px;">
          Accept Invitation
        </a>
      </div>
      
      <p style="color: #606060; font-size: 12px; text-align: center; margin-top: 30px;">
        This invitation expires in 7 days.
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 40px;">
      <p style="color: #606060; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} Velodesk. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`

  return sendEmail({
    to: inviteeEmail,
    subject: `${data.inviterName} invited you to join ${data.orgName} on Velodesk`,
    html,
  })
}

