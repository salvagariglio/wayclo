export default async function sitemap() {
    const base = "https://tudominio.com"; // <— cambialo
    const now = new Date();
    return [
        { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
        { url: `${base}/#features`, lastModified: now },
        { url: `${base}/#how`, lastModified: now },
        { url: `${base}/#apps`, lastModified: now },
        { url: `${base}/#faq`, lastModified: now }
    ];
}
