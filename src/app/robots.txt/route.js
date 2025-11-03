export function GET() {
    const body = `User-agent: *
Allow: /
Sitemap: https://tudominio.com/sitemap.xml`;
    return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
