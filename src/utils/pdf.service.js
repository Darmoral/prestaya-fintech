const PDFDocument = require('pdfkit');

exports.generateContract = (user, loan, res) => {

  const doc = new PDFDocument();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=contrato_${loan.id}.pdf`
  );

  doc.pipe(res);

  // 🟢 TÍTULO
  doc.fontSize(20).text('CONTRATO DE PRÉSTAMO', { align: 'center' });

  doc.moveDown();

  // 👤 CLIENTE
  doc.fontSize(12).text(`Cliente: ${user.name}`);
  doc.text(`Email: ${user.email}`);

  doc.moveDown();

  // 💰 PRÉSTAMO
  doc.text(`ID: ${loan.id}`);
  doc.text(`Monto: $${loan.amount}`);
  doc.text(`Interés: $${loan.interest}`);
  doc.text(`Total a pagar: $${loan.total}`);
  doc.text(`Cuotas: ${loan.days} días`);

  doc.moveDown();

  // ⚖️ LEGAL ARGENTINA
  doc.text(`
Este contrato se rige bajo las leyes de la República Argentina.

Ley 25.326 - Protección de datos personales.
El cliente autoriza el uso de sus datos para evaluación crediticia.
`);

  doc.moveDown();

  doc.text("Firma digital del cliente: ____________________");

  doc.end();
};