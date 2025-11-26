import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateTicketPDF({ fullName, company, role, qrBuffer }) {
    // Crear documento
    const pdfDoc = await PDFDocument.create();

    // Página A4
    const page = pdfDoc.addPage([595.28, 841.89]); // tamaño A4 estándar

    const { width, height } = page.getSize();

    // Fuente
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSizeTitle = 26;
    const fontSizeText = 16;

    // Título
    page.drawText("CyberCloud 2025", {
        x: width / 2 - bold.widthOfTextAtSize("CyberCloud 2025", fontSizeTitle) / 2,
        y: height - 80,
        size: fontSizeTitle,
        font: bold,
        color: rgb(0, 0, 0),
    });

    // Datos del usuario
    const startY = height - 140;

    page.drawText(`Nombre: ${fullName}`, {
        x: 60,
        y: startY,
        size: fontSizeText,
        font,
    });

    page.drawText(`Empresa: ${company}`, {
        x: 60,
        y: startY - 30,
        size: fontSizeText,
        font,
    });

    page.drawText(`Rol: ${role}`, {
        x: 60,
        y: startY - 60,
        size: fontSizeText,
        font,
    });

    // Insertar QR
    const qrImage = await pdfDoc.embedPng(qrBuffer);
    const qrSize = 220;

    page.drawImage(qrImage, {
        x: width / 2 - qrSize / 2,
        y: startY - 260,
        width: qrSize,
        height: qrSize,
    });

    // Generar buffer final
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}
