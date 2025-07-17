async function testSendEmail() {
  // Replace with your deployed Cloudflare Worker URL
  const emailEndpoint = "https://resend.agrisandavero.workers.dev/" // IMPORTANT: Replace with your actual Cloudflare Worker URL

  const testEmailData = {
    to: "geexspublic@gmail.com", // IMPORTANT: Replace with a different email you can access and verify
    subject: "Test Reservation Confirmation from Kuri Coffee (External Test)",
    body: `
      <h1>Hello from Kuri Coffee Slowbar 195!</h1>
      <p>This is an external re-test email to confirm that our email sending service is working correctly after domain verification.</p>
      <p>If you received this, the integration is successful!</p>
      <p>Remember to update 'admin@transactional.kurislowbar195.tech' with your verified sender email in the Cloudflare Worker code.</p>
      <p>Best regards,</p>
      <p>The Kuri Coffee Team</p>
    `,
  }

  console.log(`Sending test email to ${emailEndpoint}...`)

  try {
    const response = await fetch(emailEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testEmailData),
    })

    const result = await response.json()

    if (response.ok) {
      console.log("Email send successful:", result)
      console.log(`Please check the inbox of '${testEmailData.to}' for the confirmation.`)
    } else {
      console.error("Email send failed:", result.error || "Unknown error")
    }
  } catch (error) {
    console.error("Error during email send test:", error)
  }
}

testSendEmail()
