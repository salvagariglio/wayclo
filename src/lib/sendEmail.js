export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Evento <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("RESEND_API_KEY no configurada; no se envía email.");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const t = await res.text();
    console.error("Resend error:", res.status, t);
  }
}
