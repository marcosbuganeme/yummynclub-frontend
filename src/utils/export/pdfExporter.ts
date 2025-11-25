import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface ExportData {
  [key: string]: string | number | boolean | null | undefined
}

export interface PDFExportOptions {
  title: string
  subtitle?: string
  filename?: string
  orientation?: 'portrait' | 'landscape'
}

export function exportToPDF(
  data: ExportData[],
  columns: string[],
  options: PDFExportOptions
): void {
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Adicionar título
  doc.setFontSize(18)
  doc.text(options.title, 14, 20)

  // Adicionar subtítulo se fornecido
  if (options.subtitle) {
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(options.subtitle, 14, 28)
    doc.setTextColor(0, 0, 0)
  }

  // Preparar dados para a tabela
  const tableData = data.map((row) =>
    columns.map((col) => {
      const value = row[col]
      if (value === null || value === undefined) return ''
      if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
      return String(value)
    })
  )

  // Adicionar tabela
  autoTable(doc, {
    head: [columns],
    body: tableData,
    startY: options.subtitle ? 35 : 30,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Azul
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  })

  // Adicionar rodapé
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `Gerado em ${new Date().toLocaleString('pt-BR')} - Página ${i} de ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    )
  }

  // Salvar PDF
  const filename = options.filename
    ? `${options.filename}_${new Date().toISOString().split('T')[0]}_${Date.now()}.pdf`
    : `export_${new Date().toISOString().split('T')[0]}_${Date.now()}.pdf`

  doc.save(filename)
}

