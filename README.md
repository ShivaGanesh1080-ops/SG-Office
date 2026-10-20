# 🏢 SG-Office — Next-Gen AI Office Suite with Yella AI

**SG-Office** is a clean, modern, white Microsoft Office alternative designed with authentic Fluent Ribbon toolbars, Google **Gmail** integration, real CSV/Excel dataset processing, and our personalized autonomous AI assistant, **Yella**.

![SG-Office Banner](https://img.shields.io/badge/SG--Office-Personalized%20AI%20Suite-0078d4?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19.3-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.3-646cff?style=for-the-badge&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4.3-38bdf8?style=for-the-badge&logo=tailwind-css)

---

## 🌟 Key Applications & Features

### 1. 📄 Word (`SG-Word`)
- **Authentic Ribbon Interface**: Single-row compact toolbar tuned specifically for 14-inch laptop screens (no wrapped text or cramped icons).
- **Rich Formatting Tools**:
  - Headings (H1, H2, H3, Normal), Aptos/Calibri font selection, size picker.
  - Bold, Italic, Underline, Strikethrough, Text Highlighting.
  - Bulleted, Numbered, and Quote lists.
  - Left, Center, Right, Justify text alignment.
- **Insert Tools**: Insert 3x3 Tables, upload local images directly from disk, embed web links, and horizontal dividers.
- **Review Tools**: Built-in **Read Aloud** Text-to-Speech (speechSynthesis), Find & Replace modal, live word and character count stats.
- **Exporting**: Download as `.docx`, Markdown (`.md`), HTML, or print to PDF!

### 2. 📊 Excel (`SG-Excel`)
- **Real CSV File Upload & Parsing**: Pick any `.csv` or `.txt` file from your computer — automatically maps all rows and columns to the spreadsheet.
- **Real CSV Export**: 1-click download of your workbook as a `.csv` file.
- **Formula Engine**:
  - Range formulas: `=SUM(A1:A10)`, `=AVERAGE(A1:A10)`, `=COUNT(...)`, `=MAX(...)`, `=MIN(...)`.
  - Arithmetic formulas: `=C2*D2`, `=A1+B1`, `=A1-B1`, `=A1/B1`.
- **Live Recharts Data Visualization**: Generate dynamic **Bar Charts** and **Pie Charts** from numerical spreadsheet columns!
- **Wide 130px Column Headers**: No truncated labels (`Pr...`), full visibility on 14-inch laptops.
- Number formatting (`$`, `%`), AutoSum, and multi-sheet support.

### 3. 🖥️ PowerPoint (`SG-PowerPoint`)
- 16:9 widescreen presentation canvas with slide deck thumbnail panel.
- Slide creation, duplication, deletion, and slide reordering (Move Up / Down).
- Layouts: Title Slide, Title & Content, Two Columns, Blank.
- Speaker Notes drawer at bottom of canvas.
- 1-click **Full-Screen Presenter Mode** with keyboard navigation (`Esc`, Arrow keys).

### 4. 📬 Google Gmail (`SG-Gmail`)
- Replaces legacy Outlook with genuine **Google Gmail** experience.
- Authentic Material Design with the Google Compose pill button.
- Primary, Promotions, and Social category tabs.
- **Google Account Sign-In**: Dedicated connect modal to link Google Workspace / Gmail OAuth credentials.
- Floating Gmail compose window with formatting tools and Yella polish.

### 5. 🤖 Yella AI — Your Personalized Autonomous Assistant
- **Interactive Document Generation**: Type *"Create a project proposal document on cloud migration"* — Yella generates the complete structured document and writes it directly into Word!
- **Spreadsheet & CSV Ingestion**: Upload any CSV into Yella's chat window or prompt bar — Yella analyzes the metrics and populates Excel!
- **Available Everywhere**: Accessible as a full dedicated chat hub or as an instant slide-out sidekick drawer (`TopBar > Yella AI`).
- **Global Command Palette**: Press **`Ctrl + K`** anywhere to search apps, files, or trigger Yella.

---

## 🚀 Quick Start Guide

```bash
# Clone the repository
git clone https://github.com/ShivaGanesh1080-ops/SG-Office.git
cd SG-Office

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

## 💻 Production Build

```bash
npm run build
npm run preview
```

---

## 🔒 Data Privacy Guarantee
- **Zero Telemetry**: All documents and spreadsheets are stored locally in your browser workspace. No keystroke monitoring or unauthorized data leakage.
