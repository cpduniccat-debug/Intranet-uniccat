/**
 * Export Utility Functions for UNICCAT Intranet Reports
 * Supports UTF-8 CSV export with Excel BOM, and printable HTML reports.
 */

export function exportToCSV(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  // Add UTF-8 BOM so Microsoft Excel correctly reads Portuguese characters (ã, ç, é, etc.)
  const BOM = '\uFEFF';

  const formatCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(formatCell).join(';');
  const rowLines = rows.map(row => row.map(formatCell).join(';'));
  const csvContent = BOM + [headerLine, ...rowLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printFormattedReport(title: string, subtitle: string, headers: string[], rows: (string | number)[][]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${title} - UNICCAT Relatório</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #1e293b; background: #fff; }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 22px; color: #1e293b; }
        .header p { margin: 4px 0 0; font-size: 12px; color: #64748b; }
        .badge { display: inline-block; padding: 4px 8px; background: #dbeafe; color: #1e40af; font-size: 10px; font-weight: bold; border-radius: 4px; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
        th { background: #f8fafc; color: #334155; text-align: left; padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; text-transform: uppercase; }
        td { padding: 8px; border: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
        .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; pt: 10px; font-size: 10px; color: #94a3b8; display: flex; justify-between; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div style="margin-bottom: 12px;">
        <button onclick="window.print()" style="padding: 8px 16px; background: #2563eb; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
          🖨️ Imprimir / Salvar em PDF
        </button>
      </div>

      <div class="header">
        <div class="badge">UNICCAT INTRANET CORPORATIVA</div>
        <h1>${title}</h1>
        <p>${subtitle} — Gerado em ${new Date().toLocaleString('pt-BR')}</p>
      </div>

      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map(c => `<td>${c ?? ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <span>Relatório emitido pela Intranet UNICCAT</span>
        <span>Página 1 de 1</span>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
