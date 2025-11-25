import "server-only";

async function getAccessToken() {
    const url = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`;

    const params = new URLSearchParams();
    params.append("client_id", process.env.AZURE_CLIENT_ID);
    params.append("scope", "https://graph.microsoft.com/.default");
    params.append("client_secret", process.env.AZURE_CLIENT_SECRET);
    params.append("grant_type", "client_credentials");

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
    });

    const data = await res.json();

    if (!data.access_token) {
        console.error("❌ Error obteniendo token:", data);
        throw new Error("No access token");
    }

    return data.access_token;
}

export async function sendEmailGraph({ to, subject, html }) {
    try {
        const token = await getAccessToken();

        const body = {
            message: {
                subject,
                body: { contentType: "HTML", content: html },
                toRecipients: [{ emailAddress: { address: to } }],
            },
            saveToSentItems: true
        };

        const res = await fetch(
            `https://graph.microsoft.com/v1.0/users/${process.env.GRAPH_USER}/sendMail`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );

        if (!res.ok) {
            const text = await res.text();
            console.error("❌ Error enviando correo via Graph:", text);
            throw new Error(text);
        }

        console.log("📧 Enviado via Graph API");
        return true;
    } catch (e) {
        console.error("❌ Error sendEmailGraph:", e);
        throw e;
    }
}
