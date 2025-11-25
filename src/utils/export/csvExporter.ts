import Papa from 'papaparse'

export interface ExportData {
  [key: string]: string | number | boolean | null | undefined
}

export function exportToCSV(
  data: ExportData[],
  filename: string
): void {
  // Preparar dados para exportação
  const csvData = data.map((row) => {
    const csvRow: Record<string, string> = {}
    Object.keys(row).forEach((key) => {
      const value = row[key]
      csvRow[key] = value === null || value === undefined ? '' : String(value)
    })
    return csvRow
  })

  // Gerar CSV
  const csv = Papa.unparse(csvData, {
    header: true,
    delimiter: ',',
    newline: '\n',
  })

  // Adicionar BOM para Excel reconhecer UTF-8
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })

  // Criar link de download
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}_${Date.now()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

