import { useState, useRef, useCallback } from 'react';
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
  Filter,
  DollarSign,
  Percent,
  Hash,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Calculator,
  Grid,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';

const COLS = 26;
const ROWS = 50;
const COL_LETTERS = Array.from({ length: COLS }, (_, i) => String.fromCharCode(65 + i));

const initialData: Record<string, string> = {
  'A1': 'Product Line', 'B1': 'Q1 Revenue', 'C1': 'Q2 Revenue', 'D1': 'Q3 Revenue', 'E1': 'Q4 Projected', 'F1': 'Annual Total', 'G1': 'Margin %',
  'A2': 'Enterprise Cloud', 'B2': '145000', 'C2': '162000', 'D2': '184000', 'E2': '210000', 'F2': '=SUM(B2:E2)', 'G2': '72%',
  'A3': 'AI Copilot Seats', 'B3': '42000', 'C3': '68000', 'D3': '95000', 'E3': '138000', 'F3': '=SUM(B3:E3)', 'G3': '84%',
  'A4': 'Professional Services', 'B4': '38000', 'C4': '41000', 'D4': '45000', 'E4': '48000', 'F4': '=SUM(B4:E4)', 'G4': '45%',
  'A5': 'Security & Compliance', 'B5': '29000', 'C5': '33000', 'D5': '38000', 'E5': '42000', 'F5': '=SUM(B5:E5)', 'G5': '68%',
  'A6': '', 'B6': '', 'C6': '', 'D6': '', 'E6': '', 'F6': '', 'G6': '',
  'A7': 'Total Gross', 'B7': '=SUM(B2:B5)', 'C7': '=SUM(C2:C5)', 'D7': '=SUM(D2:D5)', 'E7': '=SUM(E2:E5)', 'F7': '=SUM(F2:F5)',
};

function evaluateFormula(formula: string, data: Record<string, string>): string {
  if (!formula.startsWith('=')) return formula;
  const expr = formula.substring(1);
  
  const sumMatch = expr.match(/SUM\(([A-Z])(\d+):([A-Z])(\d+)\)/i);
  if (sumMatch) {
    const [, startCol, startRow, endCol, endRow] = sumMatch;
    let sum = 0;
    const colStart = startCol.charCodeAt(0);
    const colEnd = endCol.charCodeAt(0);
    const rowStart = parseInt(startRow);
    const rowEnd = parseInt(endRow);
    for (let c = colStart; c <= colEnd; c++) {
      for (let r = rowStart; r <= rowEnd; r++) {
        const cellRef = `${String.fromCharCode(c)}${r}`;
        const val = data[cellRef] || '0';
        const evaluated = val.startsWith('=') ? evaluateFormula(val, data) : val;
        const num = parseFloat(evaluated.replace(/,/g, ''));
        if (!isNaN(num)) sum += num;
      }
    }
    return sum.toLocaleString();
  }

  const avgMatch = expr.match(/AVERAGE\(([A-Z])(\d+):([A-Z])(\d+)\)/i);
  if (avgMatch) {
    const [, startCol, startRow, endCol, endRow] = avgMatch;
    let sum = 0, count = 0;
    const colStart = startCol.charCodeAt(0);
    const colEnd = endCol.charCodeAt(0);
    const rowStart = parseInt(startRow);
    const rowEnd = parseInt(endRow);
    for (let c = colStart; c <= colEnd; c++) {
      for (let r = rowStart; r <= rowEnd; r++) {
        const cellRef = `${String.fromCharCode(c)}${r}`;
        const val = data[cellRef] || '';
        const evaluated = val.startsWith('=') ? evaluateFormula(val, data) : val;
        const num = parseFloat(evaluated.replace(/,/g, ''));
        if (!isNaN(num)) { sum += num; count++; }
      }
    }
    return count > 0 ? (sum / count).toLocaleString() : '0';
  }

  return formula;
}

export function SpreadsheetApp() {
  const [data, setData] = useState<Record<string, string>>(initialData);
  const [selectedCell, setSelectedCell] = useState<string>('B2');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'formulas' | 'data'>('home');
  const [activeSheet, setActiveSheet] = useState('Sheet1');
  const [zoom, setZoom] = useState(100);
  const { toggleAIPanel } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const getCellDisplay = useCallback((cellId: string) => {
    const raw = data[cellId] || '';
    if (raw.startsWith('=')) {
      return evaluateFormula(raw, data);
    }
    return raw;
  }, [data]);

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

  return (
    <div className="flex flex-col h-full bg-white select-none text-[#201f1e]">
      {/* 1. Excel Ribbon Tabs Bar */}
      <div className="flex items-center gap-1 px-4 bg-white border-b border-[#edebe9] text-xs font-medium">
        <button className="px-3 py-1.5 font-bold text-white bg-[#107c41] hover:bg-[#0e6a37] transition-colors rounded-t-sm">
          File
        </button>
        {[
          { id: 'home', label: 'Home' },
          { id: 'insert', label: 'Insert' },
          { id: 'formulas', label: 'Formulas' },
          { id: 'data', label: 'Data' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[#107c41] text-[#107c41] font-semibold'
                : 'border-transparent text-[#605e5c] hover:bg-[#f3f2f1]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. Excel Ribbon Toolbar */}
      <div className="flex items-center px-4 bg-white border-b border-[#d2d0ce] shadow-xs overflow-x-auto min-h-[82px]">
        {/* Font formatting */}
        <div className="ribbon-group">
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-[#f3f2f1] font-bold"><Bold size={14} /></button>
            <button className="p-1.5 rounded hover:bg-[#f3f2f1] italic"><Italic size={14} /></button>
            <button className="p-1.5 rounded hover:bg-[#f3f2f1]"><AlignLeft size={14} /></button>
            <button className="p-1.5 rounded hover:bg-[#f3f2f1]"><AlignCenter size={14} /></button>
            <button className="p-1.5 rounded hover:bg-[#f3f2f1]"><AlignRight size={14} /></button>
          </div>
          <span className="ribbon-label">Alignment</span>
        </div>

        {/* Number Formats */}
        <div className="ribbon-group">
          <div className="flex items-center gap-1">
            <button title="Accounting Format" className="p-1.5 rounded hover:bg-[#f3f2f1] text-[#605e5c]"><DollarSign size={14} /></button>
            <button title="Percent Style" className="p-1.5 rounded hover:bg-[#f3f2f1] text-[#605e5c]"><Percent size={14} /></button>
            <button title="Comma Style" className="p-1.5 rounded hover:bg-[#f3f2f1] text-[#605e5c]"><Hash size={14} /></button>
          </div>
          <span className="ribbon-label">Number</span>
        </div>

        {/* Copilot Formulas */}
        <div className="ribbon-group border-r-0 pl-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast.success('Copilot: Suggesting formula for growth rate...');
                toggleAIPanel();
              }}
              className="flex flex-col items-center p-1 rounded hover:bg-[#f3f2f1]"
            >
              <div className="w-6 h-6 rounded-md copilot-gradient flex items-center justify-center text-white mb-0.5">
                <Sparkles size={13} />
              </div>
              <span className="text-[10px] font-semibold copilot-text">Copilot</span>
            </button>
            <button
              onClick={() => {
                setData((prev) => ({ ...prev, 'E7': '=AVERAGE(E2:E5)' }));
                toast.success('AutoSum formula applied to E7');
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#e6f4ea] text-[#107c41] rounded hover:bg-[#cbe8d5]"
            >
              <Calculator size={13} /> AutoSum
            </button>
          </div>
          <span className="ribbon-label font-semibold copilot-text">AI Calculation</span>
        </div>
      </div>

      {/* 3. Excel Formula Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8f9fa] border-b border-[#e1dfdd] text-xs">
        {/* Name Box */}
        <div className="w-16 px-2 py-0.5 bg-white border border-[#d2d0ce] text-center font-semibold text-[#201f1e] shadow-xs">
          {selectedCell}
        </div>
        {/* fx symbol */}
        <span className="font-serif italic font-bold text-[#8a8886] px-1 text-sm">fx</span>
        {/* Formula Input */}
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
          placeholder="Enter formula or value..."
          className="flex-1 bg-white border border-[#d2d0ce] px-2 py-0.5 outline-none font-mono text-xs text-[#201f1e] shadow-xs focus:border-[#107c41]"
        />
      </div>

      {/* 4. Excel Grid */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="border-collapse table-fixed excel-grid w-full">
          <thead>
            <tr>
              <th className="excel-header-cell sticky top-0 left-0 z-30 w-12 bg-[#f8f9fa]"></th>
              {COL_LETTERS.map((col) => (
                <th key={col} className="excel-header-cell sticky top-0 z-20 min-w-[110px]">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, row) => (
              <tr key={row + 1}>
                <td className="excel-header-cell sticky left-0 z-10">{row + 1}</td>
                {COL_LETTERS.map((col) => {
                  const cellId = `${col}${row + 1}`;
                  const isSelected = selectedCell === cellId;
                  const isEditing = editingCell === cellId;
                  const isHeader = row === 0;

                  return (
                    <td
                      key={cellId}
                      className={`excel-cell ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleCellClick(cellId)}
                      onDoubleClick={() => handleCellDoubleClick(cellId)}
                      style={{
                        background: isHeader ? '#fdfdfd' : '#ffffff',
                        fontWeight: isHeader ? 600 : 400,
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
                        <span className="truncate block font-mono text-xs" style={{ color: (data[cellId] || '').startsWith('=') ? '#107c41' : '#201f1e' }}>
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

      {/* 5. Excel Clean Sheet Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#f8f9fa] border-t border-[#edebe9] text-xs text-[#605e5c]">
        <div className="flex items-center gap-1">
          <button className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#d2d0ce] border-b-transparent text-[#107c41] border-t-2 border-t-[#107c41]">
            Sheet1
          </button>
          <button
            onClick={() => toast('New Sheet added')}
            className="p-1 rounded hover:bg-[#edebe9] text-[#605e5c]"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>Ready</span>
          <span className="text-[#8a8886]">Average: 74,250 | Count: 5 | Sum: 297,000</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-0.5 hover:bg-[#edebe9]"><ZoomOut size={12} /></button>
            <span className="font-mono">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-0.5 hover:bg-[#edebe9]"><ZoomIn size={12} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
