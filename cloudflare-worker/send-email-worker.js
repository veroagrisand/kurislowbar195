import { Resend } from "resend"

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 })
    }

    try {
      const { to, subject, body } = await request.json()

      if (!to || !subject || !body) {
        return new Response(JSON.stringify({ error: "Missing required email fields (to, subject, body)" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }

      // Initialize Resend with the API key from Cloudflare Worker secrets
      const resend = new Resend(env.RESEND_API_KEY)

      const { data, error } = await resend.emails.send({
        from: "admin@transactional.kurislowbar195.tech", // IMPORTANT: Replace with your verified sender domain
        to: to,
        subject: subject,
        html: body,
      })

      if (error) {
        console.error("Resend API error:", error)
        return new Response(JSON.stringify({ error: error.message || "Failed to send email via Resend" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      }

      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } catch (error) {
      console.error("Worker error:", error)
      return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
  },
}
