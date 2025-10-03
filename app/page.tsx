'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const SAMPLE_YAML = `client:
  business_name: "Green Fork"
  industry: "casual restaurant"
  city: "Albuquerque, NM"
  zip: "87106"
  goal: "foot_traffic"          # awareness | foot_traffic | leads | online_sales
  monthly_budget_usd: 4000
  time_horizon_days: 30         # length of planning window

data:
  first_party:
    crm_sample_rows: 800        # replace with CRM contacts count if available
    website_event_sample_rows: 6000   # e.g. GA events, clicks, form submits
    email_engagement_rows: 1200 # newsletter opens, clicks, etc.
  third_party:
    market_size_est: 45000      # estimated TAM for local market
    notes: "university neighborhood with lunch rush and seasonal demand"

constraints:
  local_focus: true
  max_segments: 4
  tone: "concise, agency-ready"
  require_json_then_markdown: true

attachments:
  crm_top_products: |
    product,orders
    Salad Bowls,350
    Smoothies,210
    Wraps,180
  website_top_pages: |
    path,views
    /menu,2500
    /order-online,1800
    /lunch-specials,1600`;

interface PlanResponse {
  id: string;
  json: any;
  markdown: string;
  warnings?: string[];
}

export default function Home() {
  const [yamlInput, setYamlInput] = useState(SAMPLE_YAML);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<PlanResponse | null>(null);
  const [showJson, setShowJson] = useState(false);

  const loadSample = () => {
    setYamlInput(SAMPLE_YAML);
    setError('');
  };

  const validateYaml = () => {
    try {
      if (!yamlInput.trim()) {
        setError('YAML input is empty');
        return;
      }
      setError('');
      showToast('YAML looks valid!', 'success');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const generatePlan = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/ait/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          yaml_input: yamlInput,
          options: {
            dry_run: false,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to generate plan');
      }

      const data: PlanResponse = await response.json();
      setResult(data);
      showToast('Plan generated successfully!', 'success');
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ait-${result.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadMarkdown = () => {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ait-${result.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    if (!result) return;

    try {
      showToast('Generating PDF...', 'success');
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPos = margin;

      // Helper to check if we need a new page
      const checkNewPage = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Helper to add text with wrapping
      const addText = (text: string, fontSize: number, fontStyle: string, color: string, indent: number = 0) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);

        // Parse color
        const colorMap: any = {
          '#1a1a1a': [26, 26, 26],
          '#2563eb': [37, 99, 235],
          '#374151': [55, 65, 81],
          '#333': [51, 51, 51],
        };
        const rgb = colorMap[color] || [51, 51, 51];
        pdf.setTextColor(rgb[0], rgb[1], rgb[2]);

        const lines = pdf.splitTextToSize(text, contentWidth - indent);
        const lineHeight = fontSize * 0.5;

        for (const line of lines) {
          checkNewPage(lineHeight);
          pdf.text(line, margin + indent, yPos);
          yPos += lineHeight;
        }
      };

      // Helper to draw line
      const drawLine = (color: string, thickness: number) => {
        const colorMap: any = {
          '#3b82f6': [59, 130, 246],
          '#e5e7eb': [229, 231, 235],
        };
        const rgb = colorMap[color] || [229, 231, 235];
        pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
        pdf.setLineWidth(thickness);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += thickness + 2;
      };

      // Helper to render text with inline bold/italic
      const renderInlineFormatting = (text: string, fontSize: number, baseX: number, startY: number): number => {
        pdf.setFontSize(fontSize);
        let xPos = baseX;
        let currentY = startY;
        const lineHeight = fontSize * 0.5;

        // Split by ** for bold
        const parts = text.split('**');
        const maxWidth = pageWidth - margin - baseX + margin;

        parts.forEach((part, idx) => {
          if (!part) return;

          if (idx % 2 === 0) {
            // Normal text
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(51, 51, 51);
          } else {
            // Bold text
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(26, 26, 26);
          }

          // Split part into words for proper wrapping
          const words = part.split(' ');
          words.forEach((word, wordIdx) => {
            if (wordIdx > 0) word = ' ' + word;
            const wordWidth = pdf.getTextWidth(word);

            // Check if word fits on current line
            if (xPos + wordWidth > pageWidth - margin && xPos > baseX) {
              // Move to next line
              currentY += lineHeight;
              xPos = baseX;
              checkNewPage(lineHeight);
              // Remove leading space if we wrapped
              if (word.startsWith(' ')) {
                word = word.substring(1);
              }
            }

            pdf.text(word, xPos, currentY);
            xPos += pdf.getTextWidth(word);
          });
        });

        return currentY;
      };

      // Parse markdown - filter out the footer line
      const lines = result.markdown.split('\n').filter(line =>
        !line.includes('*Generated by Audience Intelligence Tool*') &&
        !line.trim().startsWith('*Generated')
      );
      let inTable = false;
      let tableData: string[][] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // H1
        if (line.startsWith('# ')) {
          checkNewPage(15);
          yPos += 8;
          addText(line.substring(2), 20, 'bold', '#1a1a1a');
          yPos += 1;
          drawLine('#3b82f6', 1);
          yPos += 5;
        }
        // H2
        else if (line.startsWith('## ')) {
          checkNewPage(12);
          yPos += 6;
          addText(line.substring(3), 16, 'bold', '#2563eb');
          yPos += 1;
          drawLine('#e5e7eb', 0.5);
          yPos += 4;
        }
        // H3
        else if (line.startsWith('### ')) {
          checkNewPage(10);
          yPos += 5;
          addText(line.substring(4), 13, 'bold', '#374151');
          yPos += 3;
        }
        // Table
        else if (line.startsWith('|')) {
          if (!inTable) {
            inTable = true;
            tableData = [];
          }
          const cells = line.split('|').filter(cell => cell.trim()).map(cell => cell.trim());
          if (!cells[0].match(/^[-:]+$/)) {
            tableData.push(cells);
          }
        }
        // End of table
        else if (inTable && !line.startsWith('|')) {
          inTable = false;
          if (tableData.length > 0) {
            checkNewPage(tableData.length * 10 + 10);

            // Draw table
            const colWidth = contentWidth / tableData[0].length;
            const rowHeight = 10;

            tableData.forEach((row, rowIndex) => {
              // Calculate required height for this row
              let maxLines = 1;
              row.forEach((cell) => {
                const fontSize = rowIndex === 0 ? 11 : 10;
                pdf.setFontSize(fontSize);
                const cellLines = pdf.splitTextToSize(cell, colWidth - 4);
                maxLines = Math.max(maxLines, cellLines.length);
              });
              const actualRowHeight = Math.max(rowHeight, maxLines * 5 + 4);

              if (checkNewPage(actualRowHeight)) {
                // Redraw header if new page
                if (rowIndex > 0) {
                  pdf.setFillColor(243, 244, 246);
                  pdf.rect(margin, yPos, contentWidth, rowHeight, 'F');
                  pdf.setFontSize(11);
                  pdf.setFont('helvetica', 'bold');
                  pdf.setTextColor(51, 51, 51);
                  tableData[0].forEach((cell, colIndex) => {
                    pdf.text(cell, margin + colIndex * colWidth + 2, yPos + 6);
                  });
                  yPos += rowHeight;
                }
              }

              // Header row
              if (rowIndex === 0) {
                pdf.setFillColor(243, 244, 246);
                pdf.rect(margin, yPos, contentWidth, actualRowHeight, 'F');
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
              } else {
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
              }

              pdf.setTextColor(51, 51, 51);
              pdf.setDrawColor(209, 213, 219);

              row.forEach((cell, colIndex) => {
                pdf.rect(margin + colIndex * colWidth, yPos, colWidth, actualRowHeight);
                const cellLines = pdf.splitTextToSize(cell, colWidth - 4);
                let cellY = yPos + 6;
                cellLines.forEach((line: string) => {
                  pdf.text(line, margin + colIndex * colWidth + 2, cellY);
                  cellY += 5;
                });
              });

              yPos += actualRowHeight;
            });
            yPos += 5;
          }
          i--; // Reprocess current line
        }
        // Blockquote
        else if (line.trim().startsWith('>')) {
          checkNewPage(8);
          pdf.setDrawColor(59, 130, 246);
          pdf.setLineWidth(1);
          pdf.line(margin, yPos, margin, yPos + 6);
          addText(line.trim().substring(1).trim(), 10, 'italic', '#333', 5);
          yPos += 1;
        }
        // Numbered list
        else if (line.trim().match(/^\d+\.\s/)) {
          checkNewPage(6);
          const match = line.trim().match(/^(\d+\.)\s(.+)$/);
          if (match) {
            const number = match[1];
            const listText = match[2];

            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(26, 26, 26);
            pdf.text(number, margin + 2, yPos);

            // Handle inline formatting
            if (listText.includes('**')) {
              const finalY = renderInlineFormatting(listText, 11, margin + 12, yPos);
              yPos = finalY + 6.5;
            } else {
              pdf.setFont('helvetica', 'normal');
              const wrapped = pdf.splitTextToSize(listText, contentWidth - 12);
              wrapped.forEach((wLine: string, idx: number) => {
                if (idx > 0) {
                  checkNewPage(5.5);
                }
                pdf.text(wLine, margin + 12, yPos);
                yPos += 5.5;
              });
            }
          }
        }
        // Bullet list
        else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          checkNewPage(6);
          const bulletText = line.trim().substring(2);

          // Determine indentation level
          const leadingSpaces = line.length - line.trimStart().length;
          const indentLevel = Math.floor(leadingSpaces / 2);
          const indent = indentLevel * 8;

          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(51, 51, 51);
          pdf.text('•', margin + indent + 2, yPos);

          // Handle inline formatting
          if (bulletText.includes('**')) {
            const finalY = renderInlineFormatting(bulletText, 11, margin + indent + 8, yPos);
            yPos = finalY + 6;
          } else {
            const wrapped = pdf.splitTextToSize(bulletText, contentWidth - indent - 10);
            wrapped.forEach((wLine: string, idx: number) => {
              if (idx > 0) {
                checkNewPage(5.5);
              }
              pdf.text(wLine, margin + indent + 8, yPos);
              yPos += 5.5;
            });
          }
        }
        // HR
        else if (line.trim() === '---') {
          checkNewPage(5);
          yPos += 3;
          drawLine('#e5e7eb', 0.5);
          yPos += 3;
        }
        // Bold text on its own line
        else if (line.startsWith('**') && line.endsWith('**')) {
          checkNewPage(6);
          addText(line.substring(2, line.length - 2), 10, 'bold', '#1a1a1a');
          yPos += 1;
        }
        // Regular text
        else if (line.trim()) {
          checkNewPage(6);
          // Handle inline bold
          if (line.includes('**')) {
            const finalY = renderInlineFormatting(line, 11, margin, yPos);
            yPos = finalY + 6;
          } else {
            addText(line, 11, 'normal', '#333');
          }
        }
        // Empty line
        else {
          yPos += 3;
        }
      }

      pdf.save(`ait-${result.id}.pdf`);
      showToast('PDF downloaded successfully!', 'success');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      showToast('Failed to generate PDF: ' + err.message, 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white ${bgColor} shadow-lg z-50 animate-fade-in`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center gap-6">
          <img
            src="/logo.jpeg"
            alt="Roadrunner Marketing Logo"
            className="w-32 h-32 object-contain"
          />
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Audience Intelligence Tool
            </h1>
            <p className="text-gray-600">
              Generate audience segments, personas, and platform-ready targets
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Input
              </h2>
              <button
                onClick={loadSample}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition"
              >
                Load Sample
              </button>
            </div>

            <textarea
              value={yamlInput}
              onChange={(e) => setYamlInput(e.target.value)}
              className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Paste your YAML here..."
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={validateYaml}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition"
              >
                Validate YAML
              </button>
              <button
                onClick={generatePlan}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-md transition font-semibold"
              >
                {loading ? 'Generating...' : 'Generate Plan'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Generated Plan
              </h2>
              {result && (
                <div className="flex gap-2">
                  <button
                    onClick={downloadJson}
                    className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                  >
                    JSON
                  </button>
                  <button
                    onClick={downloadMarkdown}
                    className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition"
                  >
                    Markdown
                  </button>
                  <button
                    onClick={downloadPdf}
                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition"
                  >
                    PDF
                  </button>
                </div>
              )}
            </div>

            {loading && (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {!loading && !result && (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <p>No plan generated yet. Click "Generate Plan" to start.</p>
              </div>
            )}

            {!loading && result && (
              <div>
                {result.warnings && result.warnings.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-800 text-sm font-semibold mb-1">Warnings:</p>
                    <ul className="list-disc list-inside text-yellow-700 text-sm">
                      {result.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => setShowJson(false)}
                    className={`px-4 py-2 rounded-md transition ${
                      !showJson
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setShowJson(true)}
                    className={`px-4 py-2 rounded-md transition ${
                      showJson
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    JSON
                  </button>
                </div>

                <div className="border border-gray-300 rounded-md p-4 h-96 overflow-auto bg-gray-50">
                  {showJson ? (
                    <pre className="text-xs font-mono">
                      {JSON.stringify(result.json, null, 2)}
                    </pre>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{result.markdown}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
