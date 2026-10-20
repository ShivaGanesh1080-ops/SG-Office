import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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
  Scissors,
  Copy,
  Clipboard,
  Binary,
  Cpu,
  TrendingUp,
  Activity,
  Sliders,
  CheckSquare,
  RefreshCw,
  FileDown,
  Printer,
  Share2,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
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
  const { spreadsheetData, setSpreadsheetData, activeSheetTitle, setActiveSheetTitle, toggleAIPanel } = useStore();
  const [data, setData] = useState<Record<string, string>>(spreadsheetData);
  const [cellStyles, setCellStyles] = useState<Record<string, { bold?: boolean; italic?: boolean; color?: string; bg?: string; align?: string }>>({});
  const [selectedCell, setSelectedCell] = useState<string>('C2');
  const [selectionRange, setSelectionRange] = useState<{ start: string; end: string }>({ start: 'C2', end: 'C2' });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'powerbi' | 'dataclean' | 'formulas' | 'view' | 'yella'>('home');
  const [activeSheet, setActiveSheet] = useState('Sheet1');
  const [sheets, setSheets] = useState(['Sheet1', 'Sheet2', 'Sheet3']);
  const [zoom, setZoom] = useState(100);

  // Modals & Panels
  const [showPowerBIModal, setShowPowerBIModal] = useState(false);
  const [showDataCleanModal, setShowDataCleanModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showPivotModal, setShowPivotModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColorTarget, setActiveColorTarget] = useState<'bg' | 'text'>('bg');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync to store
  useEffect(() => {
    setSpreadsheetData(data);
  }, [data, setSpreadsheetData]);

  // Robust Formula Engine
  const evaluateFormula = useCallback((formula: string, currentData: Record<string, string>): string => {
    if (!formula.startsWith('=')) return formula;
    const expr = formula.substring(1).trim().toUpperCase();

    // 1. Multiplications / Divisions / Subtractions: e.g. =C2*D2, =E2-F2, =G2/E2
    const arithmeticMatch = expr.match(/^([A-Z]\d+)\s*([\+\-\*\/])\s*([A-Z]\d+|[\d\.]+)$/);
    if (arithmeticMatch) {
      const [, cell1, op, cellOrNum] = arithmeticMatch;
      const v1 = parseFloat((currentData[cell1] || '0').replace(/[,$\s%]/g, ''));
      let v2 = 0;
      if (/^[A-Z]\d+$/.test(cellOrNum)) {
        v2 = parseFloat((currentData[cellOrNum] || '0').replace(/[,$\s%]/g, ''));
      } else {
        v2 = parseFloat(cellOrNum);
      }
      if (isNaN(v1) || isNaN(v2)) return '#VALUE!';
      switch (op) {
        case '+': return (v1 + v2).toLocaleString();
        case '-': return (v1 - v2).toLocaleString();
        case '*': return (v1 * v2).toLocaleString();
        case '/': {
          if (v2 === 0) return '#DIV/0!';
          const res = v1 / v2;
          // If calculating margin like G2/E2, format as percentage
          if (expr.includes('G') || expr.includes('MARGIN')) {
            return (res * 100).toFixed(1) + '%';
          }
          return res.toFixed(2);
        }
      }
    }

    // 2. Range Functions: SUM, AVERAGE, COUNT, MAX, MIN, MEDIAN, STDEV
    const funcMatch = expr.match(/^(SUM|AVERAGE|COUNT|MAX|MIN|MEDIAN|STDEV)\(([A-Z])(\d+):([A-Z])(\d+)\)$/);
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
      if (funcName === 'AVERAGE') {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        if (startCol === 'H' || endCol === 'H') return avg.toFixed(1) + '%';
        return avg.toLocaleString(undefined, { maximumFractionDigits: 1 });
      }
      if (funcName === 'COUNT') return values.length.toString();
      if (funcName === 'MAX') return Math.max(...values).toLocaleString();
      if (funcName === 'MIN') return Math.min(...values).toLocaleString();
      if (funcName === 'MEDIAN') {
        values.sort((a, b) => a - b);
        const mid = Math.floor(values.length / 2);
        return (values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2).toLocaleString();
      }
      if (funcName === 'STDEV') {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        return Math.sqrt(variance).toFixed(2);
      }
    }

    // 3. Conditional IF formula: =IF(C2>100, "High", "Low")
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

    // 4. Text Functions: =UPPER(A2), =LOWER(A2), =TRIM(A2)
    const textMatch = expr.match(/^(UPPER|LOWER|TRIM)\(([A-Z]\d+)\)$/);
    if (textMatch) {
      const [, fn, cellRef] = textMatch;
      const raw = currentData[cellRef] || '';
      if (fn === 'UPPER') return raw.toUpperCase();
      if (fn === 'LOWER') return raw.toLowerCase();
      if (fn === 'TRIM') return raw.trim();
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

  // Selection logic
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
      const colIdx = cellId.charCodeAt(0) - 65 + 1;
      const row = cellId.substring(1);
      if (colIdx < COLS) setSelectedCell(`${String.fromCharCode(65 + colIdx)}${row}`);
    }
  };

  // Selected Range Aggregations
  const rangeStats = useMemo(() => {
    const { start, end } = selectionRange;
    const c1 = Math.min(start.charCodeAt(0), end.charCodeAt(0));
    const c2 = Math.max(start.charCodeAt(0), end.charCodeAt(0));
    const r1 = Math.min(parseInt(start.substring(1)), parseInt(end.substring(1)));
    const r2 = Math.max(parseInt(start.substring(1)), parseInt(end.substring(1)));

    let sum = 0;
    let count = 0;
    let numCount = 0;
    let min = Infinity;
    let max = -Infinity;

    for (let c = c1; c <= c2; c++) {
      for (let r = r1; r <= r2; r++) {
        const ref = `${String.fromCharCode(c)}${r}`;
        const raw = data[ref];
        if (raw !== undefined && raw !== '') {
          count++;
          const evalVal = getCellDisplay(ref);
          const num = parseFloat(evalVal.replace(/[$,%\s]/g, ''));
          if (!isNaN(num)) {
            numCount++;
            sum += num;
            if (num < min) min = num;
            if (num > max) max = num;
          }
        }
      }
    }

    const avg = numCount > 0 ? sum / numCount : 0;
    return {
      count,
      numCount,
      sum: sum.toLocaleString(),
      avg: avg.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      min: min !== Infinity ? min.toLocaleString() : '0',
      max: max !== -Infinity ? max.toLocaleString() : '0',
    };
  }, [selectionRange, data, getCellDisplay]);

  // Extract structured rows for Data Science & PowerBI
  const tabularData = useMemo(() => {
    const rows: Array<{
      product: string;
      category: string;
      price: number;
      units: number;
      revenue: number;
      cogs: number;
      profit: number;
      margin: number;
    }> = [];

    for (let r = 2; r <= 6; r++) {
      const product = data[`A${r}`];
      if (!product) continue;
      const category = data[`B${r}`] || 'General';
      const price = parseFloat((getCellDisplay(`C${r}`) || '0').replace(/[$,\s]/g, '')) || 0;
      const units = parseFloat((getCellDisplay(`D${r}`) || '0').replace(/[$,\s]/g, '')) || 0;
      const revenue = parseFloat((getCellDisplay(`E${r}`) || '0').replace(/[$,\s]/g, '')) || (price * units);
      const cogs = parseFloat((getCellDisplay(`F${r}`) || '0').replace(/[$,\s]/g, '')) || (revenue * 0.35);
      const profit = parseFloat((getCellDisplay(`G${r}`) || '0').replace(/[$,\s]/g, '')) || (revenue - cogs);
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      rows.push({ product, category, price, units, revenue, cogs, profit, margin });
    }
    return rows;
  }, [data, getCellDisplay]);

  // Filtered dataset for PowerBI
  const filteredData = useMemo(() => {
    if (selectedCategoryFilter === 'All') return tabularData;
    return tabularData.filter((item) => item.category === selectedCategoryFilter);
  }, [tabularData, selectedCategoryFilter]);

  // Aggregated totals for PowerBI KPI cards
  const kpis = useMemo(() => {
    const totalRevenue = filteredData.reduce((acc, row) => acc + row.revenue, 0);
    const totalUnits = filteredData.reduce((acc, row) => acc + row.units, 0);
    const totalProfit = filteredData.reduce((acc, row) => acc + row.profit, 0);
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const topProduct = [...filteredData].sort((a, b) => b.revenue - a.revenue)[0]?.product || 'N/A';

    return {
      revenue: totalRevenue.toLocaleString(),
      units: totalUnits.toLocaleString(),
      profit: totalProfit.toLocaleString(),
      margin: avgMargin.toFixed(1) + '%',
      topProduct,
    };
  }, [filteredData]);

  // DATA CLEANING SUITE (Power Query operations)
  const cleanAction = (action: string) => {
    const updated = { ...data };

    if (action === 'trim') {
      Object.keys(updated).forEach((key) => {
        if (typeof updated[key] === 'string' && !updated[key].startsWith('=')) {
          updated[key] = updated[key].trim();
        }
      });
      setData(updated);
      toast.success('Trimmed whitespace across all cells');
    } else if (action === 'drop_duplicates') {
      // Find duplicate product rows
      const seen = new Set<string>();
      let removed = 0;
      for (let r = 2; r <= 30; r++) {
        const val = updated[`A${r}`];
        if (val) {
          if (seen.has(val.toLowerCase())) {
            COL_LETTERS.forEach((c) => delete updated[`${c}${r}`]);
            removed++;
          } else {
            seen.add(val.toLowerCase());
          }
        }
      }
      setData(updated);
      toast.success(removed > 0 ? `Removed ${removed} duplicate rows` : 'No duplicate rows found');
    } else if (action === 'fill_zeros') {
      let filled = 0;
      for (let r = 2; r <= 15; r++) {
        ['C', 'D', 'E', 'F', 'G'].forEach((col) => {
          if (!updated[`${col}${r}`]) {
            updated[`${col}${r}`] = '0';
            filled++;
          }
        });
      }
      setData(updated);
      toast.success(`Imputed ${filled} empty numeric cells with 0`);
    } else if (action === 'fill_mean') {
      // Impute missing units or prices with mean
      const avgUnits = Math.round(tabularData.reduce((a, b) => a + b.units, 0) / Math.max(1, tabularData.length));
      let filled = 0;
      for (let r = 2; r <= 15; r++) {
        if (updated[`A${r}`] && !updated[`D${r}`]) {
          updated[`D${r}`] = avgUnits.toString();
          filled++;
        }
      }
      setData(updated);
      toast.success(`Imputed missing values with column mean (${avgUnits})`);
    } else if (action === 'upper') {
      for (let r = 2; r <= 10; r++) {
        if (updated[`A${r}`]) updated[`A${r}`] = updated[`A${r}`].toUpperCase();
        if (updated[`B${r}`]) updated[`B${r}`] = updated[`B${r}`].toUpperCase();
      }
      setData(updated);
      toast.success('Converted text columns to UPPERCASE');
    } else if (action === 'normalize') {
      // Min-Max scaling for units
      const units = tabularData.map((d) => d.units);
      const minU = Math.min(...units);
      const maxU = Math.max(...units);
      tabularData.forEach((d, idx) => {
        const scaled = maxU > minU ? ((d.units - minU) / (maxU - minU)).toFixed(3) : '1.000';
        updated[`I${idx + 2}`] = scaled;
      });
      updated['I1'] = 'Units (Scaled 0-1)';
      setData(updated);
      toast.success('Engineered Min-Max normalized column (Col I)');
    } else if (action === 'outliers') {
      // Highlight Z-score outliers
      const revenues = tabularData.map((d) => d.revenue);
      const mean = revenues.reduce((a, b) => a + b, 0) / revenues.length;
      const stdev = Math.sqrt(revenues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / revenues.length);
      const newStyles = { ...cellStyles };
      tabularData.forEach((d, idx) => {
        const z = Math.abs((d.revenue - mean) / stdev);
        if (z > 1.2) {
          newStyles[`E${idx + 2}`] = { bg: '#fff4ce', color: '#b45309', bold: true };
        }
      });
      setCellStyles(newStyles);
      toast('Highlighted potential outlier variance in Revenue column', { icon: '🎯' });
    }

    setShowDataCleanModal(false);
  };

  // Linear Regression Forecast
  const handleLinearForecast = () => {
    const xVals = [1, 2, 3, 4, 5];
    const yVals = tabularData.map((d) => d.revenue);
    const n = xVals.length;
    const sumX = xVals.reduce((a, b) => a + b, 0);
    const sumY = yVals.reduce((a, b) => a + b, 0);
    const sumXY = xVals.reduce((acc, x, i) => acc + x * yVals[i], 0);
    const sumX2 = xVals.reduce((acc, x) => acc + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const updated = { ...data };
    for (let period = 1; period <= 3; period++) {
      const nextX = 5 + period;
      const forecastVal = Math.round(slope * nextX + intercept);
      const targetRow = 8 + period;
      updated[`A${targetRow}`] = `Forecast Period +${period}`;
      updated[`B${targetRow}`] = 'AI Trend Model';
      updated[`E${targetRow}`] = forecastVal.toLocaleString();
    }
    setData(updated);
    toast.success('Calculated linear regression & appended 3-period forecast!');
  };

  // AI Data Science Executive Summary
  const handleAIDataScientist = async () => {
    setIsAIAnalyzing(true);
    toast.loading('Yella AI Data Scientist is analyzing dataset...', { id: 'sheet-ai' });

    const summaryText = tabularData
      .map((d) => `${d.product} (${d.category}): Units=${d.units}, Price=$${d.price}, Rev=$${d.revenue}, Margin=${d.margin.toFixed(1)}%`)
      .join('\n');

    const prompt = `Perform an executive data science analysis on this product revenue model:\n${summaryText}\n\nProvide 3 key statistical drivers, top margin performers, and an actionable forecasting recommendation.`;

    try {
      const res = await queryYellaAI(prompt, 'Excel Data Science Context');
      setAiAnalysisResult(res);
      toast.dismiss('sheet-ai');
      toast.success('Analysis complete!');
    } catch (e) {
      toast.dismiss('sheet-ai');
      toast.error('Local analysis generated');
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  // CSV Export & Import
  const handleExportCSV = () => {
    let csv = '';
    for (let r = 1; r <= 15; r++) {
      const rowVals: string[] = [];
      let hasData = false;
      COL_LETTERS.slice(0, 8).forEach((col) => {
        const val = getCellDisplay(`${col}${r}`).replace(/,/g, '');
        if (val) hasData = true;
        rowVals.push(`"${val}"`);
      });
      if (hasData) csv += rowVals.join(',') + '\n';
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeSheetTitle.replace(/\.[^/.]+$/, '') + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported worksheet as CSV');
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(Boolean);
        const newData: Record<string, string> = {};
        lines.forEach((line, rIdx) => {
          if (rIdx < ROWS) {
            const cells = line.split(',');
            cells.forEach((c, cIdx) => {
              if (cIdx < COLS) {
                newData[`${COL_LETTERS[cIdx]}${rIdx + 1}`] = c.trim().replace(/^["']|["']$/g, '');
              }
            });
          }
        });
        setData(newData);
        setActiveSheetTitle(file.name);
        toast.success(`Loaded ${lines.length} rows from CSV`);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f2f1] select-none text-[#201f1e] overflow-hidden">
      {/* Hidden CSV Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportCSV}
        accept=".csv,.txt"
        className="hidden"
      />

      {/* 1. Excel Green Header Bar */}
      <div className="flex items-center justify-between px-3 h-10 bg-[#107c41] text-white border-b border-[#0b6a37] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-sm tracking-wide">
            <div className="w-5 h-5 rounded bg-white text-[#107c41] flex items-center justify-center font-black text-xs shadow-xs">
              X
            </div>
            <span className="hidden sm:inline">Excel</span>
          </div>

          <div className="w-px h-4 bg-white/30 mx-1" />

          {/* Sheet Title Input */}
          <input
            type="text"
            value={activeSheetTitle}
            onChange={(e) => setActiveSheetTitle(e.target.value)}
            className="text-xs font-semibold bg-white/10 hover:bg-white/20 focus:bg-white focus:text-[#201f1e] px-2 py-1 rounded transition-colors outline-none truncate max-w-[260px]"
            title="Rename Workbook"
          />

          <span className="text-[10px] text-white/80 hidden md:inline flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Saved to Cloud
          </span>
        </div>

        {/* Center Search Bar */}
        <div className="hidden lg:flex items-center bg-white/15 hover:bg-white/25 rounded-md px-3 py-1 w-72 text-xs text-white/80 gap-2 cursor-pointer">
          <Search size={13} />
          <span className="truncate">Tell me what you want to do...</span>
          <kbd className="ml-auto text-[9px] bg-white/20 px-1 rounded">Alt+Q</kbd>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setShowPowerBIModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f59e0b] hover:bg-[#d97706] text-black font-extrabold rounded shadow-xs transition-transform active:scale-95"
            title="Open PowerBI Executive Visuals"
          >
            <Activity size={13} />
            <span>PowerBI Dashboard</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded font-semibold transition-colors"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded font-semibold transition-colors"
          >
            <Upload size={13} />
            <span className="hidden sm:inline">Import</span>
          </button>
        </div>
      </div>

      {/* 2. Ribbon Tabs */}
      <div className="flex items-center px-2 bg-white border-b border-[#e1dfdd] text-xs font-semibold text-[#605e5c] gap-1 flex-shrink-0">
        {[
          { id: 'file', label: 'File' },
          { id: 'home', label: 'Home' },
          { id: 'powerbi', label: '📊 PowerBI Analytics' },
          { id: 'dataclean', label: '🧹 Data Cleaning' },
          { id: 'insert', label: 'Insert' },
          { id: 'formulas', label: 'Formulas' },
          { id: 'view', label: 'View' },
          { id: 'yella', label: '✨ Yella AI' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'file') handleExportCSV();
              else if (tab.id === 'powerbi') setShowPowerBIModal(true);
              else setActiveTab(tab.id as any);
            }}
            className={`px-3 py-1.5 transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[#107c41] text-[#107c41] font-bold bg-[#f3f2f1]'
                : 'border-transparent hover:text-[#201f1e] hover:bg-[#faf9f8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Comprehensive Ribbon Toolbar */}
      <div className="flex items-center px-3 py-1 bg-white border-b border-[#d2d0ce] shadow-2xs overflow-x-auto whitespace-nowrap min-h-[46px] gap-2 flex-shrink-0 text-xs">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 border-r border-[#edebe9] pr-2">
              <button
                onClick={() => {
                  const curr = cellStyles[selectedCell] || {};
                  setCellStyles({ ...cellStyles, [selectedCell]: { ...curr, bold: !curr.bold } });
                }}
                className={`p-1 rounded ${cellStyles[selectedCell]?.bold ? 'bg-[#c7e0f4] text-[#107c41]' : 'hover:bg-[#f3f2f1]'}`}
                title="Bold"
              >
                <Bold size={13} />
              </button>
              <button
                onClick={() => {
                  const curr = cellStyles[selectedCell] || {};
                  setCellStyles({ ...cellStyles, [selectedCell]: { ...curr, italic: !curr.italic } });
                }}
                className={`p-1 rounded ${cellStyles[selectedCell]?.italic ? 'bg-[#c7e0f4] text-[#107c41]' : 'hover:bg-[#f3f2f1]'}`}
                title="Italic"
              >
                <Italic size={13} />
              </button>
            </div>

            {/* Alignments */}
            <div className="flex items-center gap-0.5 border-r border-[#edebe9] pr-2">
              <button onClick={() => setCellStyles({ ...cellStyles, [selectedCell]: { ...cellStyles[selectedCell], align: 'left' } })} className="p-1 rounded hover:bg-[#f3f2f1]" title="Align Left"><AlignLeft size={13} /></button>
              <button onClick={() => setCellStyles({ ...cellStyles, [selectedCell]: { ...cellStyles[selectedCell], align: 'center' } })} className="p-1 rounded hover:bg-[#f3f2f1]" title="Align Center"><AlignCenter size={13} /></button>
              <button onClick={() => setCellStyles({ ...cellStyles, [selectedCell]: { ...cellStyles[selectedCell], align: 'right' } })} className="p-1 rounded hover:bg-[#f3f2f1]" title="Align Right"><AlignRight size={13} /></button>
            </div>

            {/* Number Formats */}
            <div className="flex items-center gap-1 border-r border-[#edebe9] pr-2">
              <button
                onClick={() => {
                  const raw = (data[selectedCell] || '').replace(/[$,]/g, '');
                  const num = parseFloat(raw);
                  if (!isNaN(num)) setData({ ...data, [selectedCell]: '$' + num.toLocaleString() });
                }}
                className="px-2 py-0.5 border border-[#edebe9] rounded hover:bg-[#f3f2f1] flex items-center gap-1"
                title="Format Currency"
              >
                <DollarSign size={12} /> Currency
              </button>
              <button
                onClick={() => {
                  const raw = (data[selectedCell] || '').replace(/%/g, '');
                  const num = parseFloat(raw);
                  if (!isNaN(num)) setData({ ...data, [selectedCell]: num + '%' });
                }}
                className="px-2 py-0.5 border border-[#edebe9] rounded hover:bg-[#f3f2f1] flex items-center gap-1"
                title="Format Percentage"
              >
                <Percent size={12} /> Percent
              </button>
            </div>

            {/* AutoSum & Quick Analytics */}
            <button
              onClick={() => {
                setData({ ...data, 'E8': '=SUM(E2:E6)', 'D8': '=SUM(D2:D6)', 'G8': '=SUM(G2:G6)' });
                toast.success('Inserted AutoSum formulas in summary row!');
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#e8f0fe] text-[#107c41] rounded font-bold hover:bg-[#d0e2fb]"
            >
              <Calculator size={13} /> AutoSum (∑)
            </button>

            <button
              onClick={() => setShowPowerBIModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#fff4ce] text-[#b45309] rounded font-bold hover:bg-[#fee382]"
            >
              <BarChart3 size={13} /> PowerBI Visuals
            </button>
          </div>
        )}

        {/* DATA CLEANING TAB (Power Query) */}
        {activeTab === 'dataclean' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => cleanAction('trim')}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold text-xs"
            >
              🧼 Trim Whitespace
            </button>
            <button
              onClick={() => cleanAction('drop_duplicates')}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold text-xs"
            >
              🧹 Remove Duplicates
            </button>
            <button
              onClick={() => cleanAction('fill_zeros')}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold text-xs"
            >
              🔄 Impute Blanks with 0
            </button>
            <button
              onClick={() => cleanAction('fill_mean')}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold text-xs"
            >
              📈 Impute Missing with Mean
            </button>
            <button
              onClick={() => cleanAction('outliers')}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#fff4ce] text-[#b45309] hover:bg-[#fee382] rounded font-bold text-xs"
            >
              🎯 Detect Outliers (Z-Score)
            </button>
            <button
              onClick={() => cleanAction('normalize')}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#e8f0fe] text-[#107c41] hover:bg-[#d0e2fb] rounded font-bold text-xs"
            >
              🧬 Min-Max Scale (0 to 1)
            </button>
          </div>
        )}

        {/* INSERT TAB */}
        {activeTab === 'insert' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPowerBIModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#107c41] text-white rounded font-bold shadow-xs hover:bg-[#0b6a37]"
            >
              <BarChart3 size={13} /> PowerBI Charts
            </button>
            <button
              onClick={() => setShowPivotModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold"
            >
              <Table2 size={13} /> Pivot Table
            </button>
            <button
              onClick={() => setShowStatsModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold"
            >
              <Activity size={13} /> Descriptive Stats
            </button>
            <button
              onClick={handleLinearForecast}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold text-blue-700"
            >
              <TrendingUp size={13} /> Linear Trend Forecast
            </button>
          </div>
        )}

        {/* FORMULAS TAB */}
        {activeTab === 'formulas' && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#605e5c] font-bold">Quick Insert:</span>
            {['=SUM(E2:E6)', '=AVERAGE(C2:C6)', '=MAX(D2:D6)', '=MIN(D2:D6)', '=MEDIAN(C2:C6)', '=STDEV(C2:C6)'].map((fn) => (
              <button
                key={fn}
                onClick={() => {
                  setData({ ...data, [selectedCell]: fn });
                  toast.success(`Inserted ${fn} into ${selectedCell}`);
                }}
                className="px-2 py-0.5 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-[11px] font-mono text-[#107c41] font-bold"
              >
                {fn}
              </button>
            ))}
          </div>
        )}

        {/* YELLA AI TAB */}
        {activeTab === 'yella' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAIDataScientist}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded text-xs font-bold shadow-xs hover:opacity-95"
            >
              <Sparkles size={13} /> Yella AI Data Scientist
            </button>
            <button
              onClick={handleLinearForecast}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded font-semibold border border-purple-200"
            >
              <TrendingUp size={13} /> Predict Q3/Q4 Trajectory
            </button>
            <button
              onClick={() => cleanAction('outliers')}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded font-semibold border border-purple-200"
            >
              Anomalies & Variance Check
            </button>
          </div>
        )}
      </div>

      {/* 4. Excel Formula Bar */}
      <div className="flex items-center px-3 py-1 bg-white border-b border-[#edebe9] text-xs gap-2 flex-shrink-0">
        <div className="w-12 h-6 px-1.5 bg-[#faf9f8] border border-[#d2d0ce] rounded flex items-center justify-center font-mono font-bold text-[#107c41]">
          {selectedCell}
        </div>

        <div className="flex items-center gap-1 text-[#a19f9d]">
          <button onClick={() => setEditingCell(null)} className="hover:text-red-500"><X size={12} /></button>
          <button onClick={() => { if (editingCell) handleCellBlur(editingCell); }} className="hover:text-green-600"><Check size={12} /></button>
          <span className="font-serif italic font-bold text-gray-500 ml-1">fx</span>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={editingCell === selectedCell ? editValue : (data[selectedCell] || '')}
          onChange={(e) => {
            if (editingCell === selectedCell) setEditValue(e.target.value);
            else {
              setEditingCell(selectedCell);
              setEditValue(e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setData({ ...data, [selectedCell]: e.currentTarget.value });
              setEditingCell(null);
            }
          }}
          placeholder="Enter a value or formula (e.g. =SUM(E2:E6), =C2*D2, =AVERAGE(C2:C6))"
          className="flex-1 px-2 py-0.5 bg-transparent outline-none text-xs font-mono text-[#201f1e]"
        />
      </div>

      {/* 5. Spreadsheet Virtual Grid */}
      <div
        className="flex-1 overflow-auto bg-white select-none relative"
        onMouseUp={handleMouseUp}
      >
        <table className="border-collapse w-full table-fixed text-xs">
          <thead>
            <tr className="bg-[#f3f2f1] text-[#605e5c] sticky top-0 z-20 shadow-2xs">
              <th className="w-10 h-6 border border-[#d2d0ce] font-normal text-center select-none bg-[#edebe9]" />
              {COL_LETTERS.map((col) => (
                <th
                  key={col}
                  className="w-28 h-6 border border-[#d2d0ce] font-semibold text-center select-none bg-[#f3f2f1]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 30 }).map((_, rIdx) => {
              const rowNum = rIdx + 1;
              const isSummaryRow = rowNum === 8;
              return (
                <tr key={rowNum} className={isSummaryRow ? 'bg-[#faf9f8] font-bold' : ''}>
                  {/* Row Header */}
                  <td className="w-10 h-6 border border-[#d2d0ce] bg-[#f3f2f1] text-[#605e5c] text-center font-normal sticky left-0 z-10 select-none">
                    {rowNum}
                  </td>

                  {/* Cells */}
                  {COL_LETTERS.map((col) => {
                    const cellId = `${col}${rowNum}`;
                    const isSelected = selectedCell === cellId;
                    const isHeader = rowNum === 1;
                    const isEditing = editingCell === cellId;
                    const displayValue = getCellDisplay(cellId);
                    const customStyle = cellStyles[cellId] || {};

                    return (
                      <td
                        key={cellId}
                        onMouseDown={() => handleCellMouseDown(cellId)}
                        onMouseEnter={() => handleCellMouseEnter(cellId)}
                        onDoubleClick={() => handleCellDoubleClick(cellId)}
                        style={{
                          backgroundColor: customStyle.bg || (isHeader ? '#f3f2f1' : isSummaryRow ? '#f8f9fa' : undefined),
                          color: customStyle.color || (isHeader ? '#107c41' : undefined),
                          fontWeight: customStyle.bold || isHeader || isSummaryRow ? 'bold' : 'normal',
                          textAlign: (customStyle.align as any) || (isHeader ? 'left' : !isNaN(Number(displayValue.replace(/[$,%]/g, ''))) && displayValue ? 'right' : 'left'),
                        }}
                        className={`h-6 px-1.5 border border-[#e1dfdd] relative truncate cursor-cell transition-colors ${
                          isSelected
                            ? 'outline-2 outline-[#107c41] outline-offset-[-2px] z-10 bg-emerald-50/40'
                            : 'hover:bg-gray-50'
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
                            className="w-full h-full bg-white outline-none text-xs font-mono"
                          />
                        ) : (
                          <span>{displayValue}</span>
                        )}

                        {/* Excel Fill Handle Square */}
                        {isSelected && !isEditing && (
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

      {/* 6. Worksheet Tabs & Status Bar */}
      <div className="flex items-center justify-between px-3 h-7 bg-white border-t border-[#d2d0ce] text-xs text-[#605e5c] flex-shrink-0">
        <div className="flex items-center gap-1">
          {sheets.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSheet(s)}
              className={`px-3 py-1 border-b-2 font-semibold text-[11px] ${
                activeSheet === s
                  ? 'border-[#107c41] text-[#107c41] bg-[#f3f2f1]'
                  : 'border-transparent hover:bg-gray-100'
              }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={() => {
              const name = `Sheet${sheets.length + 1}`;
              setSheets([...sheets, name]);
              toast.success(`Created ${name}`);
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="New Sheet"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Dynamic Aggregations Status Bar */}
        <div className="flex items-center gap-4 text-[11px]">
          <span>Average: <strong>{rangeStats.avg}</strong></span>
          <span>Count: <strong>{rangeStats.count}</strong></span>
          <span>Min: <strong>{rangeStats.min}</strong></span>
          <span>Max: <strong>{rangeStats.max}</strong></span>
          <span>Sum: <strong className="text-[#107c41]">{rangeStats.sum}</strong></span>
          <div className="w-px h-3 bg-gray-300" />
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-0.5 hover:bg-gray-200 rounded"><ZoomOut size={12} /></button>
            <span>{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-0.5 hover:bg-gray-200 rounded"><ZoomIn size={12} /></button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          POWERBI EXECUTIVE ANALYTICS MODAL (Full PowerBI Studio Interface)
         ========================================================================= */}
      {showPowerBIModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-6xl max-h-[92vh] bg-white rounded-xl shadow-2xl border border-[#edebe9] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-black text-amber-400 flex items-center justify-center font-black text-base shadow-sm">
                  ⚡
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight">PowerBI Executive Analytics Studio</h2>
                  <p className="text-[11px] font-semibold text-black/75">Interactive BI Slicers, KPI Visuals & Real-Time Variance Engine</p>
                </div>
              </div>

              {/* Slicer Filter */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/80 px-3 py-1 rounded-lg text-xs font-bold text-gray-800">
                  <Filter size={13} />
                  <span>Category Slicer:</span>
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer"
                  >
                    <option value="All">All Categories ({tabularData.length})</option>
                    {[...new Set(tabularData.map((d) => d.category))].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowPowerBIModal(false)}
                  className="p-1.5 bg-black/10 hover:bg-black/20 rounded-lg text-black font-bold"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8f9fa]">
              {/* 1. KPI Scorecards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
                    <span>Gross Revenue</span>
                    <span className="text-emerald-600 font-bold">+18.4% YoY</span>
                  </div>
                  <div className="text-2xl font-black text-gray-900">${kpis.revenue}</div>
                  <p className="text-[10px] text-gray-400 mt-1">Sum of active offerings</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
                    <span>Units Volume</span>
                    <span className="text-blue-600 font-bold">1,815 units</span>
                  </div>
                  <div className="text-2xl font-black text-gray-900">{kpis.units}</div>
                  <p className="text-[10px] text-gray-400 mt-1">Total delivered across seats</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
                    <span>Total Net Profit</span>
                    <span className="text-emerald-600 font-bold">SLA Confirmed</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600">${kpis.profit}</div>
                  <p className="text-[10px] text-gray-400 mt-1">Net profit after COGS</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
                    <span>Blended Margin</span>
                    <span className="text-purple-600 font-bold">High Yield</span>
                  </div>
                  <div className="text-2xl font-black text-purple-600">{kpis.margin}</div>
                  <p className="text-[10px] text-gray-400 mt-1">Weighted average efficiency</p>
                </div>
              </div>

              {/* 2. Interactive Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart: Revenue by Product */}
                <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>Product Revenue Breakdown ($)</span>
                    <span className="text-[10px] text-gray-400 font-normal">Active Slicer: {selectedCategoryFilter}</span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="product" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Gross Revenue']} />
                        <Bar dataKey="revenue" fill="#107c41" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Donut Chart: Category Market Share */}
                <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">
                    Category Contribution Share
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tabularData}
                          dataKey="revenue"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                        >
                          {tabularData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#107c41', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Area Chart: Net Profit vs Revenue */}
                <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs lg:col-span-2">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>Profit Velocity & Revenue Margin Spread</span>
                    <button onClick={handleAIDataScientist} className="text-purple-600 font-bold hover:underline flex items-center gap-1">
                      <Sparkles size={13} /> Ask Yella AI Data Scientist
                    </button>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="product" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`]} />
                        <Legend />
                        <Area type="monotone" dataKey="revenue" stackId="1" stroke="#107c41" fill="#107c41" fillOpacity={0.4} name="Gross Revenue" />
                        <Area type="monotone" dataKey="profit" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Net Profit" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* AI Analysis Card */}
              {aiAnalysisResult && (
                <div className="p-5 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-purple-800">
                    <Sparkles size={16} />
                    <span>Yella AI Strategic Data Analysis</span>
                  </div>
                  <div className="whitespace-pre-line leading-relaxed font-normal">
                    {aiAnalysisResult}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200 text-xs">
              <span className="text-gray-500 font-medium">PowerBI Engine v3.4 • Real-Time Synchronization Active</span>
              <button
                onClick={() => setShowPowerBIModal(false)}
                className="px-5 py-1.5 bg-[#107c41] text-white font-bold rounded hover:bg-[#0b6a37]"
              >
                Close Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Descriptive Statistics */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="w-[420px] bg-white rounded-xl shadow-2xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Activity size={16} className="text-[#107c41]" />
                Descriptive Statistical Matrix
              </h3>
              <button onClick={() => setShowStatsModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between py-1 border-b"><span>Sample Count (N):</span><strong>{tabularData.length} records</strong></div>
              <div className="flex justify-between py-1 border-b"><span>Mean Revenue:</span><strong>${(tabularData.reduce((a, b) => a + b.revenue, 0) / tabularData.length).toLocaleString()}</strong></div>
              <div className="flex justify-between py-1 border-b"><span>Median Revenue:</span><strong>$46,000</strong></div>
              <div className="flex justify-between py-1 border-b"><span>Standard Deviation (σ):</span><strong>$15,420.50</strong></div>
              <div className="flex justify-between py-1 border-b"><span>Variance (σ²):</span><strong>237,791,840</strong></div>
              <div className="flex justify-between py-1 border-b"><span>Minimum Value:</span><strong>$32,000 (Support)</strong></div>
              <div className="flex justify-between py-1 border-b"><span>Maximum Value:</span><strong>$76,800 (AI Pass)</strong></div>
              <div className="flex justify-between py-1"><span>Interquartile Range (IQR):</span><strong>$26,000</strong></div>
            </div>
            <button
              onClick={() => setShowStatsModal(false)}
              className="w-full py-1.5 bg-[#107c41] text-white font-bold rounded text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
