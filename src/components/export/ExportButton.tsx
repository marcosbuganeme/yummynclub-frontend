import { Download, ChevronDown } from 'lucide-react'
import { Button } from '../ui/button'
import { exportToCSV, type ExportData } from '../../utils/export/csvExporter'
import { exportToPDF, type PDFExportOptions } from '../../utils/export/pdfExporter'
import { useState } from 'react'

interface ExportButtonProps {
  data: ExportData[]
  filename: string
  columns: string[]
  pdfOptions?: Omit<PDFExportOptions, 'filename'>
  className?: string
}

export function ExportButton({
  data,
  filename,
  columns,
  pdfOptions,
  className,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleExportCSV = () => {
    exportToCSV(data, filename)
    setIsOpen(false)
  }

  const handleExportPDF = () => {
    exportToPDF(data, columns, {
      title: pdfOptions?.title || 'Relatório',
      subtitle: pdfOptions?.subtitle,
      filename,
      orientation: pdfOptions?.orientation,
    })
    setIsOpen(false)
  }

  if (data.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        className={className}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Download className="h-4 w-4 mr-2" />
        Exportar
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border">
            <button
              onClick={handleExportCSV}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-t-md"
            >
              Exportar como CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-b-md"
            >
              Exportar como PDF
            </button>
          </div>
        </>
      )}
    </div>
  )
}

