// This script is for testing the Cloudflare Worker locally or in a Node.js environment.
// It is NOT part of the Next.js application's runtime code.

async function testSendEmail() {
  const CLOUDFLARE_EMAIL_WORKER_URL = process.env.CLOUDFLARE_EMAIL_WORKER_URL || "http://127.0.0.1:8787" // Default for local development

  if (!CLOUDFLARE_EMAIL_WORKER_URL) {
    console.error("CLOUDFLARE_EMAIL_WORKER_URL environment variable is not set.")
    console.error("Please set it to your deployed Cloudflare Worker URL or 'http://127.0.0.1:8787' for local testing.")
    return
  }

  console.log(`Attempting to send email via Cloudflare Worker at: ${CLOUDFLARE_EMAIL_WORKER_URL}`)

  try {
    const response = await fetch(CLOUDFLARE_EMAIL_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "your-email@example.com", // <<< IMPORTANT: Change this to your actual email address for testing
        subject: "Test Email from Kuri Coffee Reservation System",
        body: `
          <h1>Hello from Kuri Coffee!</h1>
          <p>This is a test email sent from your Cloudflare Worker integrated with Resend.</p>
          <p>If you received this, your email sending setup is working!</p>
          <p>Best regards,<br>The Kuri Coffee Team</p>
        `,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log("Email sent successfully:", data)
    } else {
      console.error("Failed to send email:", data)
      console.error("Status:", response.status)
    }
  } catch (error) {
    console.error("Error during fetch:", error)
  }
}

testSendEmail()
