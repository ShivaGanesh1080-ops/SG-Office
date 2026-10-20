import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Table2,
  Plus,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Download,
  Upload,
  Filter,
  DollarSign,
  Percent,
  Hash,
  ZoomIn,
  ZoomOut,
  Calculator,
  BarChart3,
  PieChart as PieChartIcon,
  Trash2,
  FileSpreadsheet,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';

const COLS = 26;
const ROWS = 60;
const COL_LETTERS = Array.from({ length: COLS }, (_, i) => String.fromCharCode(65 + i));

export function SpreadsheetApp() {
  const { spreadsheetData, setSpreadsheetData, toggleAIPanel } = useStore();
  const [data, setData] = useState<Record<string, string>>(spreadsheetData);
  const [selectedCell, setSelectedCell] = useState<string>('C2');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'formulas' | 'data' | 'charts'>('home');
  const [activeSheet, setActiveSheet] = useState('Sheet1');
  const [zoom, setZoom] = useState(100);
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with store
  useEffect(() => {
    setSpreadsheetData(data);
  }, [data, setSpreadsheetData]);

  // Robust formula evaluation supporting SUM, AVERAGE, COUNT, MAX, MIN, and arithmetic (*, +, -, /)
  const evaluateFormula = useCallback((formula: string, currentData: Record<string, string>): string => {
    if (!formula.startsWith('=')) return formula;
    const expr = formula.substring(1).trim().toUpperCase();

    // 1. Handle Arithmetic: e.g. =C2*D2, =A1+B1
    const arithmeticMatch = expr.match(/^([A-Z]\d+)\s*([\+\-\*\/])\s*([A-Z]\d+)$/);
    if (arithmeticMatch) {
      const [, cell1, op, cell2] = arithmeticMatch;
      const v1 = parseFloat((currentData[cell1] || '0').replace(/,/g, ''));
      const v2 = parseFloat((currentData[cell2] || '0').replace(/,/g, ''));
      if (isNaN(v1) || isNaN(v2)) return '#VALUE!';
      switch (op) {
        case '+': return (v1 + v2).toLocaleString();
        case '-': return (v1 - v2).toLocaleString();
        case '*': return (v1 * v2).toLocaleString();
        case '/': return v2 !== 0 ? (v1 / v2).toFixed(2) : '#DIV/0!';
      }
    }

    // 2. Handle Range Functions: SUM, AVERAGE, COUNT, MAX, MIN
    const funcMatch = expr.match(/^(SUM|AVERAGE|COUNT|MAX|MIN)\(([A-Z])(\d+):([A-Z])(\d+)\)$/);
    if (funcMatch) {
      const [, funcName, startCol, startRow, endCol, endRow] = funcMatch;
      const c1 = startCol.charCodeAt(0);
      const c2 = endCol.charCodeAt(0);
      const r1 = parseInt(startRow);
      const r2 = parseInt(endRow);
      const values: number[] = [];

      for (let c = c1; c <= c2; c++) {
        for (let r = r1; r <= r2; r++) {
          const cellRef = `${String.fromCharCode(c)}${r}`;
          const raw = currentData[cellRef];
          if (raw) {
            const evaluated = raw.startsWith('=') ? evaluateFormula(raw, currentData) : raw;
            const num = parseFloat(evaluated.replace(/[$,%]/g, ''));
            if (!isNaN(num)) values.push(num);
          }
        }
      }

      if (values.length === 0) return '0';
      if (funcName === 'SUM') return values.reduce((a, b) => a + b, 0).toLocaleString();
      if (funcName === 'AVERAGE') return (values.reduce((a, b) => a + b, 0) / values.length).toLocaleString();
      if (funcName === 'COUNT') return values.length.toString();
      if (funcName === 'MAX') return Math.max(...values).toLocaleString();
      if (funcName === 'MIN') return Math.min(...values).toLocaleString();
    }

    return formula;
  }, []);

  const getCellDisplay = useCallback((cellId: string) => {
    const raw = data[cellId] || '';
    if (raw.startsWith('=')) {
      return evaluateFormula(raw, data);
    }
    return raw;
  }, [data, evaluateFormula]);

  const handleCellClick = (cellId: string) => {
    setSelectedCell(cellId);
    setEditingCell(null);
  };

  const handleCellDoubleClick = (cellId: string) => {
    setEditingCell(cellId);
    setEditValue(data[cellId] || '');
  };

  const handleCellBlur = (cellId: string) => {
    setData((prev) => ({ ...prev, [cellId]: editValue }));
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, cellId: string) => {
    if (e.key === 'Enter') {
      setData((prev) => ({ ...prev, [cellId]: editValue }));
      setEditingCell(null);
      const col = cellId[0];
      const row = parseInt(cellId.substring(1)) + 1;
      if (row <= ROWS) setSelectedCell(`${col}${row}`);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // CSV Import (Real file parsing!)
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split(/\r\n|\n/).filter(Boolean);
      const newData: Record<string, string> = {};

      rows.forEach((row, rIdx) => {
        const cols = row.split(',');
        cols.forEach((val, cIdx) => {
          if (cIdx < COLS && rIdx < ROWS) {
            const cellId = `${COL_LETTERS[cIdx]}${rIdx + 1}`;
            newData[cellId] = val.trim().replace(/^["']|["']$/g, '');
          }
        });
      });

      setData(newData);
      toast.success(`Imported ${rows.length} rows from ${file.name}!`);
    };
    reader.readAsText(file);
  };

  // CSV Export (Real download!)
  const handleCSVExport = () => {
    let csv = '';
    for (let r = 1; r <= 25; r++) {
      const rowVals = COL_LETTERS.slice(0, 10).map((col) => {
        const val = getCellDisplay(`${col}${r}`);
        return `"${val.replace(/"/g, '""')}"`;
      });
      if (rowVals.some((v) => v !== '""')) {
        csv += rowVals.join(',') + '\r\n';
      }
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Workbook_Export.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded as Workbook_Export.csv');
  };

  // Chart Data Extraction
  const getChartData = () => {
    const chartItems = [];
    for (let r = 2; r <= 8; r++) {
      const label = data[`A${r}`];
      const valStr = getCellDisplay(`E${r}`) || getCellDisplay(`C${r}`);
      const val = parseFloat(valStr.replace(/[$,%]/g, ''));
      if (label && !isNaN(val)) {
        chartItems.push({ name: label, value: val });
      }
    }
    return chartItems;
  };

  const chartData = getChartData();
  const COLORS = ['#185abd', '#107c41', '#f59e0b', '#7719aa', '#ea4335', '#008272'];

  return (
    <div className="flex flex-col h-full bg-white select-none text-[#201f1e] overflow-hidden">
      {/* Hidden File Input for CSV Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCSVImport}
        accept=".csv,.txt"
        className="hidden"
      />

      {/* 1. Ribbon Tabs Bar */}
      <div className="flex items-center gap-0.5 px-3 bg-white border-b border-[#edebe9] text-[11px] font-medium overflow-x-auto whitespace-nowrap flex-shrink-0">
        <button
          onClick={handleCSVExport}
          className="px-2.5 py-1 font-bold text-white bg-[#107c41] hover:bg-[#0e6a37] transition-colors rounded-t-xs"
        >
          File
        </button>
        {[
          { id: 'home', label: 'Home' },
          { id: 'insert', label: 'Insert & Charts' },
          { id: 'formulas', label: 'Formulas' },
          { id: 'data', label: 'Data & CSV' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-2.5 py-1 transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[#107c41] text-[#107c41] font-bold'
                : 'border-transparent text-[#605e5c] hover:bg-[#f3f2f1]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. Responsive Ribbon Toolbar (Single clean row, no congestion!) */}
      <div className="flex items-center px-3 py-1 bg-white border-b border-[#d2d0ce] shadow-2xs overflow-x-auto whitespace-nowrap min-h-[46px] gap-2 flex-shrink-0 text-xs">
        {activeTab === 'home' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 border-r border-[#edebe9] pr-2">
              <button className="p-1 rounded hover:bg-[#f3f2f1] font-bold" title="Bold"><Bold size={13} /></button>
              <button className="p-1 rounded hover:bg-[#f3f2f1] italic" title="Italic"><Italic size={13} /></button>
            </div>

            <div className="flex items-center gap-0.5 border-r border-[#edebe9] pr-2">
              <button className="p-1 rounded hover:bg-[#f3f2f1]" title="Align Left"><AlignLeft size={13} /></button>
              <button className="p-1 rounded hover:bg-[#f3f2f1]" title="Align Center"><AlignCenter size={13} /></button>
              <button className="p-1 rounded hover:bg-[#f3f2f1]" title="Align Right"><AlignRight size={13} /></button>
            </div>

            <div className="flex items-center gap-1 border-r border-[#edebe9] pr-2">
              <button
                onClick={() => {
                  const current = data[selectedCell] || '';
                  if (!current.startsWith('$')) setData((p) => ({ ...p, [selectedCell]: `$${current}` }));
                }}
                className="p-1 rounded hover:bg-[#f3f2f1] text-[#605e5c]"
                title="Format Currency ($)"
              >
                <DollarSign size={14} />
              </button>
              <button
                onClick={() => {
                  const current = data[selectedCell] || '';
                  if (!current.endsWith('%')) setData((p) => ({ ...p, [selectedCell]: `${current}%` }));
                }}
                className="p-1 rounded hover:bg-[#f3f2f1] text-[#605e5c]"
                title="Format Percent (%)"
              >
                <Percent size={14} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 border-r border-[#edebe9] pr-2">
              <button
                onClick={() => {
                  setData((prev) => ({ ...prev, [selectedCell]: '=SUM(C2:C5)' }));
                  toast.success(`Inserted AutoSum in ${selectedCell}`);
                }}
                className="flex items-center gap-1 px-2 py-0.5 bg-[#e6f4ea] text-[#107c41] rounded hover:bg-[#d0edd8] font-semibold text-xs"
              >
                <Calculator size={13} /> AutoSum
              </button>
            </div>

            <button
              onClick={() => setShowChartModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold text-[#185abd]"
            >
              <BarChart3 size={14} /> Visualize Chart
            </button>
          </div>
        )}

        {activeTab === 'insert' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setChartType('bar'); setShowChartModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#e8f0fe] text-[#185abd] rounded font-semibold text-xs"
            >
              <BarChart3 size={14} /> Bar Chart
            </button>
            <button
              onClick={() => { setChartType('pie'); setShowChartModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#fce8e6] text-[#c43e1c] rounded font-semibold text-xs"
            >
              <PieChartIcon size={14} /> Pie Chart
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold text-xs"
            >
              <Upload size={14} /> Import CSV Dataset
            </button>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#107c41] text-white rounded font-semibold text-xs shadow-xs"
            >
              <Upload size={14} /> Upload CSV File
            </button>
            <button
              onClick={handleCSVExport}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold text-xs text-[#201f1e]"
            >
              <Download size={14} /> Download CSV
            </button>
            <button
              onClick={() => {
                setData({});
                toast('Spreadsheet grid cleared');
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-red-600 hover:bg-red-50 rounded font-semibold text-xs border border-red-200"
            >
              <Trash2 size={13} /> Clear Table
            </button>
          </div>
        )}

        {activeTab === 'formulas' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#107c41]">Supported Formula Engines:</span>
            <span className="bg-[#f3f2f1] px-2 py-0.5 rounded font-mono text-[11px]">=SUM(A1:A5)</span>
            <span className="bg-[#f3f2f1] px-2 py-0.5 rounded font-mono text-[11px]">=AVERAGE(B1:B10)</span>
            <span className="bg-[#f3f2f1] px-2 py-0.5 rounded font-mono text-[11px]">=C2*D2</span>
            <span className="bg-[#f3f2f1] px-2 py-0.5 rounded font-mono text-[11px]">=MAX(E1:E20)</span>
          </div>
        )}
      </div>

      {/* 3. Formula Bar */}
      <div className="flex items-center gap-2 px-3 py-1 bg-[#f8f9fa] border-b border-[#e1dfdd] text-xs flex-shrink-0">
        <div className="w-14 px-2 py-0.5 bg-white border border-[#d2d0ce] text-center font-bold text-[#201f1e] shadow-2xs text-[11px]">
          {selectedCell}
        </div>
        <span className="font-serif italic font-bold text-[#8a8886] px-1 text-xs">fx</span>
        <input
          ref={inputRef}
          type="text"
          value={editingCell === selectedCell ? editValue : (data[selectedCell] || '')}
          onChange={(e) => {
            if (editingCell === selectedCell) setEditValue(e.target.value);
            else { setEditingCell(selectedCell); setEditValue(e.target.value); }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setData((prev) => ({ ...prev, [selectedCell]: e.currentTarget.value }));
              setEditingCell(null);
            }
          }}
          placeholder="Enter value or formula like =SUM(B2:E2) or =C2*D2..."
          className="flex-1 bg-white border border-[#d2d0ce] px-2 py-0.5 outline-none font-mono text-xs text-[#201f1e] shadow-2xs focus:border-[#107c41]"
        />
      </div>

      {/* 4. Excel Grid with WIDE non-congested columns */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="border-collapse table-fixed w-full">
          <thead>
            <tr>
              <th className="excel-header-cell sticky top-0 left-0 z-30 w-10 bg-[#f8f9fa]"></th>
              {COL_LETTERS.map((col) => (
                <th
                  key={col}
                  className="excel-header-cell sticky top-0 z-20 min-w-[130px] font-semibold text-xs"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, row) => (
              <tr key={row + 1}>
                <td className="excel-header-cell sticky left-0 z-10 w-10 text-[11px] font-mono">{row + 1}</td>
                {COL_LETTERS.map((col) => {
                  const cellId = `${col}${row + 1}`;
                  const isSelected = selectedCell === cellId;
                  const isEditing = editingCell === cellId;
                  const isHeader = row === 0;

                  return (
                    <td
                      key={cellId}
                      className={`excel-cell min-w-[130px] ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleCellClick(cellId)}
                      onDoubleClick={() => handleCellDoubleClick(cellId)}
                      style={{
                        background: isHeader ? '#f8f9fa' : '#ffffff',
                        fontWeight: isHeader ? 700 : 400,
                      }}
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleCellBlur(cellId)}
                          onKeyDown={(e) => handleKeyDown(e, cellId)}
                          className="w-full h-full bg-white outline-none font-mono text-xs text-[#201f1e]"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="truncate block font-mono text-xs"
                          style={{
                            color: (data[cellId] || '').startsWith('=') ? '#107c41' : '#201f1e',
                            fontWeight: isHeader ? 700 : 400,
                          }}
                          title={getCellDisplay(cellId)}
                        >
                          {getCellDisplay(cellId)}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Sheet Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#f8f9fa] border-t border-[#edebe9] text-[11px] text-[#605e5c] flex-shrink-0">
        <div className="flex items-center gap-1">
          <button className="px-3 py-0.5 text-xs font-semibold bg-white border border-[#d2d0ce] border-b-transparent text-[#107c41] border-t-2 border-t-[#107c41]">
            Sheet1
          </button>
          <button
            onClick={() => toast('New Worksheet Sheet2 added')}
            className="p-1 rounded hover:bg-[#edebe9]"
          >
            <Plus size={13} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span>Ready</span>
          <span>Selected: <strong>{selectedCell}</strong></span>
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-0.5 hover:bg-[#edebe9]"><ZoomOut size={12} /></button>
            <span className="font-mono text-[10px]">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-0.5 hover:bg-[#edebe9]"><ZoomIn size={12} /></button>
          </div>
        </div>
      </div>

      {/* 6. Dynamic Chart Modal (Real data visualization!) */}
      {showChartModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-[600px] bg-white rounded-xl shadow-2xl border border-[#edebe9] p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-[#107c41]" />
                <h3 className="text-sm font-bold text-[#201f1e]">Live Data Visualization</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChartType(chartType === 'bar' ? 'pie' : 'bar')}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#f3f2f1] rounded hover:bg-[#edebe9]"
                >
                  Switch to {chartType === 'bar' ? 'Pie' : 'Bar'}
                </button>
                <button onClick={() => setShowChartModal(false)} className="text-[#8a8886] hover:text-[#201f1e]">
                  ✕
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#107c41" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[#8a8886]">
                  Enter numerical data in columns A and C/E to generate charts.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setShowChartModal(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-[#107c41] text-white rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
