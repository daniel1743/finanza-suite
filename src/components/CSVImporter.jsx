import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileSpreadsheet, AlertCircle, CheckCircle, X,
  ChevronDown, ArrowRight, Trash2, Eye, Download, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from '@/components/ui/use-toast';

// Columnas esperadas y sus variaciones
const COLUMN_MAPPINGS = {
  date: ['fecha', 'date', 'dia', 'day', 'f.', 'fch'],
  amount: ['monto', 'amount', 'valor', 'value', 'importe', 'cantidad', 'total', '$'],
  description: ['descripcion', 'description', 'concepto', 'detalle', 'nota', 'memo', 'desc'],
  category: ['categoria', 'category', 'tipo', 'type', 'cat', 'rubro'],
  type: ['tipo_transaccion', 'transaction_type', 'ingreso_gasto', 'tipo', 'type', 'movimiento']
};

// Categorías válidas
const VALID_CATEGORIES = [
  'Transporte', 'Salud', 'Alimentacion', 'Servicios',
  'Entretenimiento', 'Ocio', 'Educacion', 'Otros'
];

// Parser de CSV
const parseCSV = (text) => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  // Detectar separador (coma, punto y coma, tab)
  const firstLine = lines[0];
  let separator = ',';
  if (firstLine.includes(';')) separator = ';';
  else if (firstLine.includes('\t')) separator = '\t';

  const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, '').toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(separator).map(v => v.trim().replace(/"/g, ''));
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx];
      });
      rows.push(row);
    }
  }

  return { headers, rows, separator };
};

// Detectar mapeo de columnas automáticamente
const autoDetectColumns = (headers) => {
  const mapping = {};

  Object.entries(COLUMN_MAPPINGS).forEach(([field, variations]) => {
    const found = headers.find(h => {
      const normalized = h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return variations.some(v => normalized.includes(v.toLowerCase()));
    });
    if (found) {
      mapping[field] = found;
    }
  });

  return mapping;
};

// Detectar tipo de transacción
const detectTransactionType = (row, mapping) => {
  // Si hay columna de tipo
  if (mapping.type && row[mapping.type]) {
    const typeValue = row[mapping.type].toLowerCase();
    if (typeValue.includes('ingreso') || typeValue.includes('income') || typeValue.includes('+')) {
      return 'income';
    }
    return 'expense';
  }

  // Detectar por monto negativo
  if (mapping.amount && row[mapping.amount]) {
    const amount = parseFloat(row[mapping.amount].replace(/[^0-9.-]/g, ''));
    if (amount < 0) return 'expense';
    // Por defecto, asumir gasto
    return 'expense';
  }

  return 'expense';
};

// Normalizar categoría
const normalizeCategory = (category) => {
  if (!category) return 'Otros';

  const normalized = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const categoryMap = {
    'transporte': 'Transporte',
    'transport': 'Transporte',
    'uber': 'Transporte',
    'taxi': 'Transporte',
    'gasolina': 'Transporte',
    'salud': 'Salud',
    'health': 'Salud',
    'farmacia': 'Salud',
    'alimentacion': 'Alimentacion',
    'comida': 'Alimentacion',
    'food': 'Alimentacion',
    'restaurante': 'Alimentacion',
    'supermercado': 'Alimentacion',
    'servicios': 'Servicios',
    'services': 'Servicios',
    'luz': 'Servicios',
    'agua': 'Servicios',
    'internet': 'Servicios',
    'entretenimiento': 'Entretenimiento',
    'entertainment': 'Entretenimiento',
    'netflix': 'Entretenimiento',
    'spotify': 'Entretenimiento',
    'ocio': 'Ocio',
    'educacion': 'Educacion',
    'education': 'Educacion',
    'curso': 'Educacion'
  };

  for (const [key, value] of Object.entries(categoryMap)) {
    if (normalized.includes(key)) return value;
  }

  return 'Otros';
};

// Parsear fecha
const parseDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString().split('T')[0];

  // Intentar varios formatos
  const formats = [
    // DD/MM/YYYY
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
    // YYYY-MM-DD
    /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,
    // DD-MM-YY
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let year, month, day;

      if (match[1].length === 4) {
        // YYYY-MM-DD
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      } else if (match[3].length === 4) {
        // DD/MM/YYYY
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]);
      } else {
        // DD-MM-YY
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = 2000 + parseInt(match[3]);
      }

      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
  }

  // Intentar parseo nativo
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
};

// Componente de mapeo de columnas
const ColumnMapper = ({ headers, mapping, onMappingChange }) => {
  const fields = [
    { key: 'date', label: 'Fecha', required: true },
    { key: 'amount', label: 'Monto', required: true },
    { key: 'description', label: 'Descripción', required: false },
    { key: 'category', label: 'Categoría', required: false },
    { key: 'type', label: 'Tipo (ingreso/gasto)', required: false }
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Mapear columnas:</p>
      {fields.map(field => (
        <div key={field.key} className="flex items-center gap-3">
          <span className="w-32 text-sm">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </span>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <select
            value={mapping[field.key] || ''}
            onChange={(e) => onMappingChange(field.key, e.target.value)}
            className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">-- Seleccionar --</option>
            {headers.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          {mapping[field.key] && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
        </div>
      ))}
    </div>
  );
};

// Vista previa de datos
const DataPreview = ({ rows, mapping }) => {
  const previewRows = rows.slice(0, 5);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Monto</th>
              <th className="px-3 py-2 text-left">Descripción</th>
              <th className="px-3 py-2 text-left">Categoría</th>
              <th className="px-3 py-2 text-left">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, idx) => {
              const type = detectTransactionType(row, mapping);
              return (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-2">
                    {mapping.date ? parseDate(row[mapping.date]) : '-'}
                  </td>
                  <td className="px-3 py-2">
                    ${mapping.amount ? Math.abs(parseFloat(row[mapping.amount].replace(/[^0-9.-]/g, '') || 0)).toLocaleString() : '-'}
                  </td>
                  <td className="px-3 py-2 max-w-[200px] truncate">
                    {mapping.description ? row[mapping.description] : '-'}
                  </td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 bg-accent rounded text-xs">
                      {mapping.category ? normalizeCategory(row[mapping.category]) : 'Otros'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      type === 'income' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'
                    }`}>
                      {type === 'income' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length > 5 && (
        <p className="text-xs text-muted-foreground text-center py-2 bg-muted">
          +{rows.length - 5} filas más
        </p>
      )}
    </div>
  );
};

// Componente principal del importador
const CSVImporter = ({ isOpen, onClose }) => {
  const { addTransaction } = useFinance();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(1); // 1: upload, 2: map, 3: preview, 4: importing, 5: done
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState({ headers: [], rows: [] });
  const [columnMapping, setColumnMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState({ success: 0, errors: 0 });

  // Reset al cerrar
  const handleClose = () => {
    setStep(1);
    setFile(null);
    setParsedData({ headers: [], rows: [] });
    setColumnMapping({});
    setImporting(false);
    setImportResult({ success: 0, errors: 0 });
    onClose();
  };

  // Manejar archivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(csv|txt)$/i)) {
      toast({
        title: 'Formato no soportado',
        description: 'Por favor sube un archivo CSV o TXT',
        variant: 'destructive'
      });
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const parsed = parseCSV(text);
        setParsedData(parsed);

        // Auto-detectar columnas
        const detected = autoDetectColumns(parsed.headers);
        setColumnMapping(detected);

        setStep(2);
      }
    };
    reader.readAsText(selectedFile);
  };

  // Manejar drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const fakeEvent = { target: { files: [droppedFile] } };
      handleFileChange(fakeEvent);
    }
  }, []);

  // Actualizar mapeo
  const handleMappingChange = (field, value) => {
    setColumnMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validar mapeo
  const isMappingValid = () => {
    return columnMapping.date && columnMapping.amount;
  };

  // Importar transacciones
  const handleImport = async () => {
    if (!isMappingValid()) {
      toast({
        title: 'Mapeo incompleto',
        description: 'Fecha y Monto son requeridos',
        variant: 'destructive'
      });
      return;
    }

    setStep(4);
    setImporting(true);

    let success = 0;
    let errors = 0;

    for (const row of parsedData.rows) {
      try {
        const type = detectTransactionType(row, columnMapping);
        const amount = Math.abs(parseFloat(
          (row[columnMapping.amount] || '0').replace(/[^0-9.-]/g, '')
        ));

        if (isNaN(amount) || amount === 0) {
          errors++;
          continue;
        }

        const transaction = {
          type,
          amount,
          description: row[columnMapping.description] || 'Importado de CSV',
          category: normalizeCategory(row[columnMapping.category]),
          date: parseDate(row[columnMapping.date]),
          person: 'Usuario',
          necessity: 'Necesario'
        };

        await addTransaction(transaction);
        success++;

        // Pequeña pausa para no saturar
        await new Promise(r => setTimeout(r, 50));
      } catch (e) {
        errors++;
      }
    }

    setImportResult({ success, errors });
    setStep(5);
    setImporting(false);
  };

  // Descargar plantilla
  const downloadTemplate = () => {
    const template = `fecha,monto,descripcion,categoria,tipo
15/01/2024,50000,Supermercado mensual,Alimentacion,gasto
01/01/2024,1500000,Salario,Otros,ingreso
20/01/2024,35000,Netflix y Spotify,Entretenimiento,gasto`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_financia.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-500" />
            Importar desde CSV
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium">Arrastra tu archivo CSV aquí</p>
              <p className="text-sm text-muted-foreground mt-1">o haz clic para seleccionar</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">¿No tienes un archivo? Descarga la plantilla</span>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Plantilla CSV
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Map columns */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">
                Archivo cargado: <strong>{file?.name}</strong> ({parsedData.rows.length} filas)
              </span>
            </div>

            <ColumnMapper
              headers={parsedData.headers}
              mapping={columnMapping}
              onMappingChange={handleMappingChange}
            />

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Volver
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!isMappingValid()}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Eye className="w-4 h-4 mr-2" />
                Vista Previa
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Revisa los datos antes de importar:
            </p>

            <DataPreview rows={parsedData.rows} mapping={columnMapping} />

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Volver
              </Button>
              <Button
                onClick={handleImport}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar {parsedData.rows.length} transacciones
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Importing */}
        {step === 4 && (
          <div className="py-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <FileSpreadsheet className="w-16 h-16 text-primary" />
            </motion.div>
            <p className="font-medium">Importando transacciones...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Esto puede tardar unos segundos
            </p>
          </div>
        )}

        {/* Step 5: Done */}
        {step === 5 && (
          <div className="py-8 text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold">¡Importación completada!</h3>
              <p className="text-muted-foreground mt-1">
                {importResult.success} transacciones importadas correctamente
              </p>
              {importResult.errors > 0 && (
                <p className="text-sm text-orange-500 mt-1">
                  {importResult.errors} filas con errores fueron omitidas
                </p>
              )}
            </div>
            <Button onClick={handleClose} className="bg-gradient-to-r from-purple-500 to-pink-500">
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CSVImporter;
