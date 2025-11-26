import PDFDocument from "pdfkit";

export async function generateTicketPDF({ fullName, company, role, qrBuffer }) {
    return new Promise((resolve) => {
        const doc = new PDFDocument({
            size: "A4",
            margin: 50,
        });

        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        // TÍTULO
        doc
            .font("Helvetica-Bold")
            .fontSize(26)
            .text("CyberCloud 2025", { align: "center" })
            .moveDown(1);

        // NOMBRE
        doc
            .font("Helvetica")
            .fontSize(18)
            .text(`Nombre: ${fullName}`)
            .moveDown(0.3);

        doc.text(`Empresa: ${company}`);
        doc.text(`Rol: ${role}`).moveDown(1);

        // QR
        doc.image(qrBuffer, {
            width: 220,
            align: "center",
        });

        doc.end();
    });
}
