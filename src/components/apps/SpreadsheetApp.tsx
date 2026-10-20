import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Table2,
  Plus,
  Bold,
  Italic,
  Underline,
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
  ChevronDown,
  Check,
  X,
  Palette,
  Maximize2,
  LineChart as LineChartIcon,
  Layers,
  Wand2,
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
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { queryYellaAI } from '../../services/aiService';

const COLS = 26;
const ROWS = 60;
const COL_LETTERS = Array.from({ length: COLS }, (_, i) => String.fromCharCode(65 + i));

export function SpreadsheetApp() {
  const { spreadsheetData, setSpreadsheetData, toggleAIPanel } = useStore();
  const [data, setData] = useState<Record<string, string>>(spreadsheetData);
  const [cellStyles, setCellStyles] = useState<Record<string, { bold?: boolean; italic?: boolean; color?: string; bg?: string; align?: string }>>({});
  const [selectedCell, setSelectedCell] = useState<string>('B2');
  const [selectionRange, setSelectionRange] = useState<{ start: string; end: string }>({ start: 'B2', end: 'B2' });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'formulas' | 'data' | 'view' | 'yella'>('home');
  const [activeSheet, setActiveSheet] = useState('Sheet1');
  const [sheets, setSheets] = useState(['Sheet1', 'Sheet2', 'Sheet3']);
  const [zoom, setZoom] = useState(100);
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'area'>('bar');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColorTarget, setActiveColorTarget] = useState<'bg' | 'text'>('bg');
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [conditionalFormatThreshold, setConditionalFormatThreshold] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with global store
  useEffect(() => {
    setSpreadsheetData(data);
  }, [data, setSpreadsheetData]);

  // Robust formula evaluation engine
  const evaluateFormula = useCallback((formula: string, currentData: Record<string, string>): string => {
    if (!formula.startsWith('=')) return formula;
    const expr = formula.substring(1).trim().toUpperCase();

    // 1. Arithmetic Expressions: e.g. =C2*D2, =A1+B1, =A1-B1, =A1/B1
    const arithmeticMatch = expr.match(/^([A-Z]\d+)\s*([\+\-\*\/])\s*([A-Z]\d+)$/);
    if (arithmeticMatch) {
      const [, cell1, op, cell2] = arithmeticMatch;
      const v1 = parseFloat((currentData[cell1] || '0').replace(/[,$\s%]/g, ''));
      const v2 = parseFloat((currentData[cell2] || '0').replace(/[,$\s%]/g, ''));
      if (isNaN(v1) || isNaN(v2)) return '#VALUE!';
      switch (op) {
        case '+': return (v1 + v2).toLocaleString();
        case '-': return (v1 - v2).toLocaleString();
        case '*': return (v1 * v2).toLocaleString();
        case '/': return v2 !== 0 ? (v1 / v2).toFixed(2) : '#DIV/0!';
      }
    }

    // 2. Range Functions: SUM, AVERAGE, COUNT, MAX, MIN
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
            const num = parseFloat(evaluated.replace(/[$,%\s]/g, ''));
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

    // 3. Simple IF formula: =IF(B2>1000, "High", "Low")
    const ifMatch = expr.match(/^IF\(([A-Z]\d+)\s*([><=])\s*(\d+),\s*"([^"]+)",\s*"([^"]+)"\)$/i);
    if (ifMatch) {
      const [, cell, op, targetStr, trueVal, falseVal] = ifMatch;
      const val = parseFloat((currentData[cell] || '0').replace(/[,$\s%]/g, ''));
      const target = parseFloat(targetStr);
      let conditionMet = false;
      if (op === '>') conditionMet = val > target;
      if (op === '<') conditionMet = val < target;
      if (op === '=') conditionMet = val === target;
      return conditionMet ? trueVal : falseVal;
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

  // Selection handlers
  const handleCellMouseDown = (cellId: string) => {
    setSelectedCell(cellId);
    setSelectionRange({ start: cellId, end: cellId });
    setIsMouseDown(true);
    setEditingCell(null);
  };

  const handleCellMouseEnter = (cellId: string) => {
    if (isMouseDown) {
      setSelectionRange((prev) => ({ ...prev, end: cellId }));
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
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
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setData((prev) => ({ ...prev, [cellId]: editValue }));
      setEditingCell(null);
      const colIndex = COL_LETTERS.indexOf(cellId[0]);
      if (colIndex < COLS - 1) {
        setSelectedCell(`${COL_LETTERS[colIndex + 1]}${cellId.substring(1)}`);
      }
    }
  };

  // Cell Styling
  const toggleStyle = (prop: 'bold' | 'italic') => {
    setCellStyles((prev) => ({
      ...prev,
      [selectedCell]: {
        ...prev[selectedCell],
        [prop]: !prev[selectedCell]?.[prop],
      },
    }));
  };

  const applyColor = (color: string) => {
    setCellStyles((prev) => ({
      ...prev,
      [selectedCell]: {
        ...prev[selectedCell],
        [activeColorTarget]: color,
      },
    }));
    setShowColorPicker(false);
  };

  // CSV Import
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
      toast.success(`Imported ${rows.length} rows from ${file.name}`);
    };
    reader.readAsText(file);
  };

  // CSV Export
  const handleCSVExport = () => {
    let csv = '';
    for (let r = 1; r <= 30; r++) {
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
    a.download = `${activeSheet}_Data.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported as ${activeSheet}_Data.csv`);
  };

  // Calculate live Status Bar metrics for active selection
  const getSelectionMetrics = () => {
    const startC = selectionRange.start[0].charCodeAt(0);
    const endC = selectionRange.end[0].charCodeAt(0);
    const startR = parseInt(selectionRange.start.substring(1));
    const endR = parseInt(selectionRange.end.substring(1));

    const minC = Math.min(startC, endC);
    const maxC = Math.max(startC, endC);
    const minR = Math.min(startR, endR);
    const maxR = Math.max(startR, endR);

    const nums: number[] = [];
    let count = 0;

    for (let c = minC; c <= maxC; c++) {
      for (let r = minR; r <= maxR; r++) {
        const cellId = `${String.fromCharCode(c)}${r}`;
        const val = getCellDisplay(cellId);
        if (val) {
          count++;
          const n = parseFloat(val.replace(/[$,%\s]/g, ''));
          if (!isNaN(n)) nums.push(n);
        }
      }
    }

    if (nums.length === 0) return { count, sum: 0, avg: 0, min: 0, max: 0, numCount: 0 };
    const sum = nums.reduce((a, b) => a + b, 0);
    return {
      count,
      numCount: nums.length,
      sum,
      avg: Math.round((sum / nums.length) * 100) / 100,
      min: Math.min(...nums),
      max: Math.max(...nums),
    };
  };

  const metrics = getSelectionMetrics();

  // Chart Data Extraction
  const getChartData = () => {
    const chartItems = [];
    for (let r = 2; r <= 10; r++) {
      const label = data[`A${r}`];
      const valStr = getCellDisplay(`F${r}`) || getCellDisplay(`E${r}`) || getCellDisplay(`C${r}`);
      const val = parseFloat(valStr.replace(/[$,%]/g, ''));
      if (label && !isNaN(val)) {
        chartItems.push({ name: label, value: val });
      }
    }
    return chartItems;
  };

  const chartData = getChartData();
  const COLORS = ['#107c41', '#185abd', '#f59e0b', '#7719aa', '#ea4335', '#008272'];

  // AI Formula / Budget Assistant
  const runAIExcelAction = async (action: string) => {
    toast.loading('Yella AI is generating Excel model...', { id: 'excel-ai' });
    let prompt = '';
    if (action === 'forecast') {
      prompt = `Generate a 4-quarter enterprise budget table with columns: Division, Q1 Budget, Q2 Budget, Q3 Budget, Q4 Budget, Total with =SUM formulas.`;
    } else if (action === 'clean') {
      prompt = `Review this spreadsheet data and recommend optimal financial formulas to detect variance and margin.`;
    }

    try {
      const res = await queryYellaAI(prompt, 'Excel Spreadsheet Model');
      toast.dismiss('excel-ai');
      toast.success('Yella generated spreadsheet model!');
    } catch {
      toast.dismiss('excel-ai');
    }
  };

  return (
    <div
      onMouseUp={handleMouseUp}
      className="flex flex-col h-full bg-white select-none text-[#201f1e] overflow-hidden"
    >
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
          { id: 'insert', label: 'Insert' },
          { id: 'formulas', label: 'Formulas' },
          { id: 'data', label: 'Data' },
          { id: 'view', label: 'View' },
          { id: 'yella', label: 'Yella AI' },
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

      {/* 2. Responsive Ribbon Toolbar */}
      <div className="flex items-center px-3 py-1 bg-white border-b border-[#d2d0ce] shadow-2xs overflow-x-auto whitespace-nowrap min-h-[46px] gap-2 flex-shrink-0 text-xs">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="flex items-center gap-2">
            {/* Font formatting */}
            <div className="flex items-center gap-0.5 border-r border-[#edebe9] pr-2">
              <button
                onClick={() => toggleStyle('bold')}
                className={`p-1 rounded font-bold ${cellStyles[selectedCell]?.bold ? 'bg-[#c7e0f4] text-[#107c41]' : 'hover:bg-[#f3f2f1]'}`}
                title="Bold (Ctrl+B)"
              >
                <Bold size={13} />
              </button>
              <button
                onClick={() => toggleStyle('italic')}
                className={`p-1 rounded italic ${cellStyles[selectedCell]?.italic ? 'bg-[#c7e0f4] text-[#107c41]' : 'hover:bg-[#f3f2f1]'}`}
                title="Italic (Ctrl+I)"
              >
                <Italic size={13} />
              </button>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-1 border-r border-[#edebe9] pr-2 relative">
              <button
                onClick={() => { setActiveColorTarget('bg'); setShowColorPicker(!showColorPicker); }}
                className="p-1 rounded hover:bg-[#f3f2f1] flex items-center gap-0.5"
                title="Fill Background Color"
              >
                <Palette size={13} className="text-[#107c41]" />
                <ChevronDown size={10} />
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white p-2 rounded-lg shadow-xl border border-[#edebe9] z-50 grid grid-cols-4 gap-1 w-32">
                  {['#ffffff', '#e6f4ea', '#e8f0fe', '#fff4ce', '#fce8e6', '#f3e8ff', '#201f1e', '#107c41'].map((c) => (
                    <div
                      key={c}
                      onClick={() => applyColor(c)}
                      style={{ background: c }}
                      className="w-5 h-5 rounded border border-[#d2d0ce] cursor-pointer hover:scale-110 transition-transform"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Number Formats */}
            <div className="flex items-center gap-1 border-r border-[#edebe9] pr-2">
              <button
                onClick={() => {
                  const current = data[selectedCell] || '';
                  if (!current.startsWith('$')) setData((p) => ({ ...p, [selectedCell]: `$${current}` }));
                }}
                className="p-1 rounded hover:bg-[#f3f2f1] text-[#605e5c] font-bold"
                title="Format Currency ($)"
              >
                <DollarSign size={13} />
              </button>
              <button
                onClick={() => {
                  const current = data[selectedCell] || '';
                  if (!current.endsWith('%')) setData((p) => ({ ...p, [selectedCell]: `${current}%` }));
                }}
                className="p-1 rounded hover:bg-[#f3f2f1] text-[#605e5c] font-bold"
                title="Format Percentage (%)"
              >
                <Percent size={13} />
              </button>
              <button
                onClick={() => {
                  const current = data[selectedCell] || '';
                  const num = parseFloat(current.replace(/[$,]/g, ''));
                  if (!isNaN(num)) setData((p) => ({ ...p, [selectedCell]: num.toLocaleString() }));
                }}
                className="p-1 rounded hover:bg-[#f3f2f1] text-[#605e5c] font-mono font-bold text-xs"
                title="Comma Style (,)"
              >
                ,
              </button>
            </div>

            {/* AutoSum */}
            <div className="flex items-center gap-1.5 border-r border-[#edebe9] pr-2">
              <button
                onClick={() => {
                  setData((prev) => ({ ...prev, [selectedCell]: '=SUM(B2:E2)' }));
                  toast.success(`Inserted =SUM(B2:E2) in ${selectedCell}`);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#e6f4ea] text-[#107c41] rounded hover:bg-[#d0edd8] font-bold text-xs"
              >
                <Calculator size={13} /> AutoSum
              </button>
            </div>

            {/* Conditional Formatting */}
            <button
              onClick={() => {
                const threshold = prompt('Highlight cells greater than: (e.g. 50000)');
                if (threshold) {
                  setConditionalFormatThreshold(parseFloat(threshold));
                  toast.success(`Conditional formatting applied for > ${threshold}`);
                }
              }}
              className="flex items-center gap-1 px-2 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold"
            >
              <Layers size={13} className="text-[#f59e0b]" /> Conditional Format
            </button>

            {/* Visualize Chart */}
            <button
              onClick={() => setShowChartModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#185abd] text-white rounded text-xs font-bold hover:bg-[#106ebe] shadow-2xs"
            >
              <BarChart3 size={13} /> Insert Chart
            </button>
          </div>
        )}

        {/* INSERT TAB */}
        {activeTab === 'insert' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setChartType('bar'); setShowChartModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#e6f4ea] text-[#107c41] rounded font-bold text-xs"
            >
              <BarChart3 size={13} /> Column Chart
            </button>
            <button
              onClick={() => { setChartType('line'); setShowChartModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#e8f0fe] text-[#185abd] rounded font-bold text-xs"
            >
              <LineChartIcon size={13} /> Line Trend Chart
            </button>
            <button
              onClick={() => { setChartType('pie'); setShowChartModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#fce8e6] text-[#c43e1c] rounded font-bold text-xs"
            >
              <PieChartIcon size={13} /> Pie Chart
            </button>
            <button
              onClick={() => { setChartType('area'); setShowChartModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#f3e8ff] text-[#7719aa] rounded font-bold text-xs"
            >
              Area Chart
            </button>
          </div>
        )}

        {/* FORMULAS TAB */}
        {activeTab === 'formulas' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#107c41]">Quick Formula Inserters:</span>
            <button
              onClick={() => { setData((p) => ({ ...p, [selectedCell]: '=SUM(B2:B6)' })); toast('Inserted SUM'); }}
              className="bg-[#f3f2f1] hover:bg-[#e1dfdd] px-2 py-0.5 rounded font-mono font-semibold"
            >
              =SUM(...)
            </button>
            <button
              onClick={() => { setData((p) => ({ ...p, [selectedCell]: '=AVERAGE(B2:B6)' })); toast('Inserted AVERAGE'); }}
              className="bg-[#f3f2f1] hover:bg-[#e1dfdd] px-2 py-0.5 rounded font-mono font-semibold"
            >
              =AVERAGE(...)
            </button>
            <button
              onClick={() => { setData((p) => ({ ...p, [selectedCell]: '=C2*D2' })); toast('Inserted Multiply'); }}
              className="bg-[#f3f2f1] hover:bg-[#e1dfdd] px-2 py-0.5 rounded font-mono font-semibold"
            >
              =C2*D2
            </button>
            <button
              onClick={() => { setData((p) => ({ ...p, [selectedCell]: '=MAX(B2:B6)' })); toast('Inserted MAX'); }}
              className="bg-[#f3f2f1] hover:bg-[#e1dfdd] px-2 py-0.5 rounded font-mono font-semibold"
            >
              =MAX(...)
            </button>
            <button
              onClick={() => { setData((p) => ({ ...p, [selectedCell]: '=IF(B2>50000, "High", "Normal")' })); toast('Inserted IF'); }}
              className="bg-[#f3f2f1] hover:bg-[#e1dfdd] px-2 py-0.5 rounded font-mono font-semibold"
            >
              =IF(...)
            </button>
          </div>
        )}

        {/* DATA TAB */}
        {activeTab === 'data' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#107c41] text-white rounded font-bold text-xs shadow-xs hover:bg-[#0e6a37]"
            >
              <Upload size={13} /> Import CSV
            </button>
            <button
              onClick={handleCSVExport}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-bold text-xs"
            >
              <Download size={13} /> Export CSV
            </button>
            <button
              onClick={() => { setFilterEnabled(!filterEnabled); toast(`Filter handles: ${!filterEnabled ? 'ON' : 'OFF'}`); }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-bold text-xs ${filterEnabled ? 'bg-[#c7e0f4] text-[#185abd]' : 'bg-[#f3f2f1]'}`}
            >
              <Filter size={13} /> Filter Dropdowns
            </button>
            <button
              onClick={() => { setData({}); toast('Spreadsheet cleared'); }}
              className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded font-bold text-xs border border-red-200"
            >
              <Trash2 size={13} /> Clear Table
            </button>
          </div>
        )}

        {/* VIEW TAB */}
        {activeTab === 'view' && (
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(100)} className="px-2 py-1 bg-[#f3f2f1] rounded font-semibold text-xs">
              100% Zoom
            </button>
            <button onClick={() => setZoom(125)} className="px-2 py-1 bg-[#f3f2f1] rounded font-semibold text-xs">
              125% Zoom
            </button>
            <button onClick={() => window.print()} className="px-2 py-1 bg-[#107c41] text-white rounded font-bold text-xs">
              Print Sheet
            </button>
          </div>
        )}

        {/* YELLA AI TAB */}
        {activeTab === 'yella' && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAIPanel}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded text-xs font-bold shadow-xs"
            >
              <Sparkles size={13} /> Yella AI Copilot
            </button>
            <button
              onClick={() => runAIExcelAction('forecast')}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-semibold border border-purple-200"
            >
              <Wand2 size={13} /> Generate Budget Model
            </button>
            <button
              onClick={() => runAIExcelAction('clean')}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-semibold border border-purple-200"
            >
              Analyze Formulas
            </button>
          </div>
        )}
      </div>

      {/* 3. Authentic Formula Bar */}
      <div className="flex items-center gap-2 px-3 py-1 bg-[#f8f9fa] border-b border-[#e1dfdd] text-xs flex-shrink-0">
        <div className="w-14 px-2 py-0.5 bg-white border border-[#d2d0ce] text-center font-bold text-[#201f1e] shadow-2xs text-[11px]">
          {selectedCell}
        </div>
        <div className="flex items-center gap-1 text-[#8a8886]">
          <button
            onClick={() => setEditingCell(null)}
            className="p-0.5 hover:bg-[#edebe9] rounded text-red-600"
            title="Cancel"
          >
            <X size={12} />
          </button>
          <button
            onClick={() => {
              if (editingCell) {
                setData((p) => ({ ...p, [editingCell]: editValue }));
                setEditingCell(null);
              }
            }}
            className="p-0.5 hover:bg-[#edebe9] rounded text-emerald-600"
            title="Enter"
          >
            <Check size={12} />
          </button>
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
          placeholder="Enter formula or value (e.g., =SUM(B2:E2) or =C2*D2)..."
          className="flex-1 bg-white border border-[#d2d0ce] px-2 py-0.5 outline-none font-mono text-xs text-[#201f1e] shadow-2xs focus:border-[#107c41]"
        />
      </div>

      {/* 4. Excel Grid */}
      <div className="flex-1 overflow-auto bg-[#e5e5e5] p-0.5">
        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
          <table className="border-collapse bg-white">
            <thead>
              <tr>
                <th className="sticky top-0 left-0 z-30 bg-[#f3f2f1] border border-[#d2d0ce] w-12 h-6 text-center text-[10px] font-bold text-[#605e5c]" />
                {COL_LETTERS.map((col) => (
                  <th
                    key={col}
                    className="sticky top-0 z-20 bg-[#f3f2f1] border border-[#d2d0ce] min-w-[130px] h-6 text-center text-[11px] font-bold text-[#605e5c] px-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex-1">{col}</span>
                      {filterEnabled && (
                        <Filter size={10} className="text-[#8a8886] hover:text-[#107c41] cursor-pointer" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: ROWS }, (_, rIdx) => {
                const rowNum = rIdx + 1;
                return (
                  <tr key={rowNum}>
                    {/* Row Header */}
                    <td className="sticky left-0 z-10 bg-[#f3f2f1] border border-[#d2d0ce] w-12 h-6 text-center text-[10px] font-bold text-[#605e5c]">
                      {rowNum}
                    </td>

                    {/* Data Cells */}
                    {COL_LETTERS.map((col) => {
                      const cellId = `${col}${rowNum}`;
                      const isSelected = selectedCell === cellId;
                      const isEditing = editingCell === cellId;
                      const displayVal = getCellDisplay(cellId);
                      const style = cellStyles[cellId] || {};

                      // Conditional formatting check
                      const numVal = parseFloat(displayVal.replace(/[$,%]/g, ''));
                      const isHighlight = conditionalFormatThreshold !== null && !isNaN(numVal) && numVal > conditionalFormatThreshold;

                      return (
                        <td
                          key={cellId}
                          onMouseDown={() => handleCellMouseDown(cellId)}
                          onMouseEnter={() => handleCellMouseEnter(cellId)}
                          onDoubleClick={() => handleCellDoubleClick(cellId)}
                          style={{
                            fontWeight: style.bold || rowNum === 1 ? 'bold' : 'normal',
                            fontStyle: style.italic ? 'italic' : 'normal',
                            color: style.color || (rowNum === 1 ? '#107c41' : '#201f1e'),
                            background: isHighlight ? '#e6f4ea' : style.bg || (rowNum === 1 ? '#faf9f8' : 'white'),
                          }}
                          className={`border border-[#e1dfdd] min-w-[130px] h-6 px-2 text-xs truncate font-mono relative cursor-cell ${
                            isSelected
                              ? 'outline-2 outline-[#107c41] -outline-offset-1 z-10'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleCellBlur(cellId)}
                              onKeyDown={(e) => handleKeyDown(e, cellId)}
                              autoFocus
                              className="w-full h-full bg-white outline-none border-none text-xs font-mono"
                            />
                          ) : (
                            <span>{displayVal}</span>
                          )}

                          {/* Excel Iconic Green Fill Handle Square at Bottom Right */}
                          {isSelected && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#107c41] border border-white cursor-crosshair z-20" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Sheet Tabs Bar & Excel Dynamic Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#f3f2f1] border-t border-[#edebe9] text-xs text-[#605e5c] select-none flex-shrink-0">
        {/* Left: Sheet Tabs */}
        <div className="flex items-center gap-1">
          {sheets.map((sheet) => (
            <button
              key={sheet}
              onClick={() => setActiveSheet(sheet)}
              className={`px-3 py-0.5 rounded-t text-xs font-semibold border-t-2 ${
                activeSheet === sheet
                  ? 'bg-white border-[#107c41] text-[#107c41] shadow-2xs'
                  : 'bg-transparent border-transparent hover:bg-[#edebe9]'
              }`}
            >
              {sheet}
            </button>
          ))}
          <button
            onClick={() => {
              const newName = `Sheet${sheets.length + 1}`;
              setSheets([...sheets, newName]);
              setActiveSheet(newName);
              toast.success(`Created ${newName}`);
            }}
            className="p-1 rounded hover:bg-[#edebe9] text-[#107c41]"
            title="Add New Sheet"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Right: Dynamic Excel Calculations Status Bar */}
        <div className="flex items-center gap-4 text-[11px] font-medium font-mono text-[#201f1e]">
          {metrics.count > 0 && (
            <>
              {metrics.numCount > 0 && (
                <>
                  <span>Average: <strong>{metrics.avg.toLocaleString()}</strong></span>
                  <span>Count: <strong>{metrics.count}</strong></span>
                  <span>Min: <strong>{metrics.min.toLocaleString()}</strong></span>
                  <span>Max: <strong>{metrics.max.toLocaleString()}</strong></span>
                  <span className="text-[#107c41]">Sum: <strong>{metrics.sum.toLocaleString()}</strong></span>
                </>
              )}
            </>
          )}
          <div className="flex items-center gap-1 border-l pl-3 border-[#d2d0ce]">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-0.5 rounded hover:bg-[#edebe9]"><ZoomOut size={12} /></button>
            <span className="text-[10px] w-9 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-0.5 rounded hover:bg-[#edebe9]"><ZoomIn size={12} /></button>
          </div>
        </div>
      </div>

      {/* Interactive Recharts Modal */}
      {showChartModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-[560px] bg-white rounded-xl shadow-2xl border border-[#edebe9] p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-[#107c41]" />
                <h3 className="text-sm font-bold text-[#201f1e]">Interactive Data Chart</h3>
              </div>
              <button onClick={() => setShowChartModal(false)} className="text-[#8a8886] hover:text-[#201f1e]">
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-2">
              {(['bar', 'line', 'pie', 'area'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={`px-3 py-1 rounded text-xs capitalize font-bold border ${
                    chartType === t ? 'bg-[#e6f4ea] text-[#107c41] border-[#107c41]' : 'border-[#d2d0ce]'
                  }`}
                >
                  {t} Chart
                </button>
              ))}
            </div>

            <div className="h-64 w-full bg-[#faf9f8] p-3 rounded-lg border border-[#edebe9]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#107c41" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#185abd" strokeWidth={2} />
                  </LineChart>
                ) : chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#7719aa" fill="#f3e8ff" />
                  </AreaChart>
                ) : (
                  <PieChart>
                    <Tooltip />
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-[#8a8886]">{chartData.length} data points extracted from active worksheet</span>
              <button
                onClick={() => setShowChartModal(false)}
                className="px-4 py-1.5 bg-[#107c41] text-white rounded font-bold hover:bg-[#0e6a37]"
              >
                Insert into Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
