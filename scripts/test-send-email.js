async function testSendEmail() {
  const testEmailData = {
    to: "geexspublic@gmail.com", // IMPORTANT: Replace with a different email you can access and verify
    subject: "Test Reservation Confirmation from Kuri Coffee (Re-run)",
    body: `
      <h1>Hello from Kuri Coffee Slowbar 195!</h1>
      <p>This is a re-test email to confirm that our email sending service is working correctly after domain verification.</p>
      <p>If you received this, the integration is successful!</p>
      <p>Remember to update 'transactional.kurislowbar195.tech' with your verified sender email in app/api/send-email/route.ts.</p>
      <p>Best regards,</p>
      <p>The Kuri Coffee Team</p>
    `,
  }

  console.log("Sending test email...")

  try {
    const response = await fetch("/api/send-email", {
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
