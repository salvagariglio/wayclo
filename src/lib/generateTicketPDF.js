import PDFDocument from "pdfkit";

/**
 * Genera un PDF con QR y datos del invitado.
 * Devuelve un Buffer listo para subir a storage o enviar por email.
 */
export async function generateTicketPDF({ fullName, company, role, qrBuffer }) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: "A4",
                margin: 50
            });

            const buffers = [];
            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", () => resolve(Buffer.concat(buffers)));

            // TÍTULO
            doc.fontSize(26).text("CyberCloud 2025", { align: "center" });
            doc.moveDown();

            doc.fontSize(16).text(`Invitado: ${fullName}`);
            doc.text(`Empresa: ${company}`);
            doc.text(`Rol: ${role}`);
            doc.moveDown(2);

            doc.fontSize(14).text("Presentá este pase digital en la entrada del evento.");
            doc.moveDown(2);

            // QR IMAGE (convert buffer png to image)
            doc.image(qrBuffer, {
                fit: [220, 220],
                align: "center",
                valign: "center"
            });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}
