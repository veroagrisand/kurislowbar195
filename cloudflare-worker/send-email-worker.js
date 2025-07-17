addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  const { to, subject, body } = await request.json()

  if (!to || !subject || !body) {
    return new Response(JSON.stringify({ error: "Missing required fields: to, subject, body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const RESEND_API_KEY_SECRET = "your_api_key_here" // Declare the variable here or import it from a secure source
  const RESEND_API_KEY = RESEND_API_KEY_SECRET // Bound as a secret in Cloudflare Worker settings

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY_SECRET is not set in Cloudflare Worker environment variables.")
    return new Response(JSON.stringify({ error: "Server configuration error: API key missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Kuri Coffee <onboarding@resend.dev>", // Replace with your verified Resend domain email
      to: to,
      subject: subject,
      html: body,
    }),
  })

  const resendData = await resendResponse.json()

  if (resendResponse.ok) {
    console.log("Email sent successfully via Resend:", resendData)
    return new Response(JSON.stringify({ message: "Email sent successfully", data: resendData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } else {
    console.error("Failed to send email via Resend:", resendData)
    return new Response(JSON.stringify({ error: resendData.message || "Failed to send email", details: resendData }), {
      status: resendResponse.status,
      headers: { "Content-Type": "application/json" },
    })
  }
}
