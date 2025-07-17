async function testSendEmail() {
  const testEmailData = {
    to: "mouscrack29@gmail.com", // Replace with an email you can access
    subject: "Test Reservation Confirmation from Kuri Coffee",
    body: `
      <h1>Hello from Kuri Coffee Slowbar 195!</h1>
      <p>This is a test email to confirm that our email sending service is working correctly.</p>
      <p>If you received this, the integration is successful!</p>
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
      console.log("Please check the inbox of 'test@example.com' (or the email you provided) for the confirmation.")
    } else {
      console.error("Email send failed:", result.error || "Unknown error")
    }
  } catch (error) {
    console.error("Error during email send test:", error)
  }
}

testSendEmail()
