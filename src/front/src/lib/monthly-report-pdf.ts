import type { jsPDF } from 'jspdf';
import {
  DashboardGastosDTO,
  FuncionarioResumoDTO,
  GastoProdutoResumoDTO,
  IndicadorManutencaoCategoriaDTO,
  ManutencaoResumoDTO,
} from '@/lib/api';
import { getCategoriaManutencaoLabel, getTipoManutencaoLabel } from '@/lib/manutencao';

type PdfDoc = jsPDF;

type ReportRows = {
  funcionarios: FuncionarioResumoDTO[];
  manutencoes: ManutencaoResumoDTO[];
  gastosProdutos: GastoProdutoResumoDTO[];
};

type BuildMonthlyReportPdfParams = {
  data: DashboardGastosDTO;
  relatorioRows: ReportRows;
  ano: number;
  mes: number;
  requestedBy?: { nome?: string; role?: string } | null;
  generatedAt?: Date;
};

type PaletteColor = [number, number, number];

type LegendItem = {
  label: string;
  value: number;
  color: string;
};

type MaintenanceChartItem = {
  categoria: string;
  quantidade: number;
  valorTotal: number;
};

type SummaryMetric = {
  label: string;
  value: string;
  tone?: 'neutral' | 'positive' | 'negative';
};

type SummaryDetail = {
  label: string;
  value: string;
};

type SummaryCardData = {
  period: string;
  condoName: string;
  metrics: SummaryMetric[];
  details: SummaryDetail[];
};

const palette = {
  navy: '#183A72',
  blue: '#2F6FEA',
  cyan: '#16AEEA',
  green: '#00A676',
  deepGreen: '#00875A',
  red: '#D92323',
  border: '#DDE6F2',
  text: '#16304F',
  secondary: '#5F6F89',
  softBlue: '#F7FAFF',
  softGray: '#F5F8FC',
  white: '#FFFFFF',
  shadow: '#E9F0F8',
};

const donutColors = [palette.navy, palette.blue, palette.cyan, '#87B3FF'];

function fmtMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value ?? 0);
}

function fmtDate(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
}

function fmtDateTime(value: Date) {
  return value.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPeriod(ano: number, mes: number) {
  return `${new Date(ano, mes - 1).toLocaleString('pt-BR', { month: 'long' })}/${ano}`;
}

function toRgb(hex: string): PaletteColor {
  const clean = hex.replace('#', '');
  const size = clean.length === 3 ? 1 : 2;
  const parts = clean.length === 3
    ? clean.split('').map((char) => char + char)
    : [clean.slice(0, 2), clean.slice(2, 4), clean.slice(4, 6)];

  return parts.map((part) => parseInt(part, 16)) as PaletteColor;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function ellipseText(doc: PdfDoc, value: string, maxWidth: number) {
  const text = value || '—';
  if (doc.getTextWidth(text) <= maxWidth) return text;

  let output = text;
  while (output.length > 1 && doc.getTextWidth(`${output}...`) > maxWidth) {
    output = output.slice(0, -1);
  }
  return `${output}...`;
}

function splitChipText(doc: PdfDoc, text: string, width: number) {
  return doc.splitTextToSize(text, width) as string[];
}

function drawRoundedCard(doc: PdfDoc, x: number, y: number, width: number, height: number, options?: {
  fill?: string;
  border?: string;
  radius?: number;
  shadow?: boolean;
}) {
  const radius = options?.radius ?? 4;
  if (options?.shadow !== false) {
    const shadowColor = toRgb(palette.shadow);
    doc.setFillColor(...shadowColor);
    doc.roundedRect(x + 0.8, y + 1, width, height, radius, radius, 'F');
  }

  if (options?.fill) {
    doc.setFillColor(...toRgb(options.fill));
  } else {
    doc.setFillColor(...toRgb(palette.white));
  }
  doc.setDrawColor(...toRgb(options?.border ?? palette.border));
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, width, height, radius, radius, 'FD');
}

function drawSectionTitle(doc: PdfDoc, title: string, subtitle: string, x: number, y: number, width: number) {
  doc.setTextColor(...toRgb(palette.navy));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, x, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...toRgb(palette.secondary));
  const lines = doc.splitTextToSize(subtitle, width) as string[];
  doc.text(lines, x, y + 5);
}

function roleLabel(role?: string) {
  if (role === 'GESTOR') return 'Gestor';
  if (role === 'SINDICO') return 'Síndico';
  if (role === 'SIGAC_ADMIN') return 'Administrador SIGAC';
  return 'Usuário';
}

function buildIdentityLine(user?: { nome?: string; role?: string } | null) {
  if (!user?.nome) return 'Identificação: SIGAC';
  return `${roleLabel(user.role)} responsável: ${user.nome}`;
}

function drawSigacMark(doc: PdfDoc, x: number, y: number, scale = 1, color = palette.navy) {
  const rgb = toRgb(color);
  doc.setFillColor(...rgb);
  doc.setDrawColor(...rgb);

  const towerWidth = 3.6 * scale;
  const towerGap = 1.6 * scale;
  const baseX = x;
  const baseY = y;

  doc.triangle(baseX + 0.3 * scale, baseY + 2.6 * scale, baseX + 2.1 * scale, baseY, baseX + 3.9 * scale, baseY + 2.6 * scale, 'F');
  doc.rect(baseX + 1.1 * scale, baseY + 2.7 * scale, towerWidth, 9.3 * scale, 'F');

  const secondX = baseX + towerWidth + towerGap + 1.2 * scale;
  doc.triangle(secondX + 0.3 * scale, baseY + 1.5 * scale, secondX + 2.1 * scale, baseY - 1.4 * scale, secondX + 3.9 * scale, baseY + 1.5 * scale, 'F');
  doc.rect(secondX + 1.1 * scale, baseY + 1.6 * scale, towerWidth, 10.4 * scale, 'F');

  doc.rect(baseX, baseY + 12.4 * scale, 13.5 * scale, 1.7 * scale, 'F');

  doc.setFillColor(255, 255, 255);
  const windowSize = 1.1 * scale;
  doc.rect(baseX + 2 * scale, baseY + 5.2 * scale, windowSize, windowSize, 'F');
  doc.rect(baseX + 4 * scale, baseY + 5.2 * scale, windowSize, windowSize, 'F');
  doc.rect(baseX + 2 * scale, baseY + 7.3 * scale, windowSize, windowSize, 'F');
  doc.rect(baseX + 4 * scale, baseY + 7.3 * scale, windowSize, windowSize, 'F');
}

function renderDonutChart(items: LegendItem[], total: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 560;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = 180;
  const centerY = 180;
  const radius = 110;
  const innerRadius = 60;

  if (total <= 0 || items.every((item) => item.value <= 0)) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = '#E8EEF8';
    ctx.fill();

    ctx.fillStyle = palette.secondary;
    ctx.font = '600 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Sem dados', centerX, centerY + 6);
    return canvas.toDataURL('image/png');
  }

  let startAngle = -Math.PI / 2;
  items.forEach((item, index) => {
    const value = Math.max(item.value, 0);
    if (!value) return;
    const slice = (value / total) * Math.PI * 2;
    const endAngle = startAngle + slice;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = item.color || donutColors[index % donutColors.length];
    ctx.fill();

    ctx.lineWidth = 5;
    ctx.strokeStyle = palette.white;
    ctx.stroke();

    startAngle = endAngle;
  });

  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius - 3, 0, Math.PI * 2);
  ctx.fillStyle = palette.white;
  ctx.fill();

  ctx.fillStyle = palette.navy;
  ctx.font = '700 26px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('100%', centerX, centerY - 4);
  ctx.fillStyle = palette.secondary;
  ctx.font = '400 16px Arial';
  ctx.fillText('despesas', centerX, centerY + 20);

  return canvas.toDataURL('image/png');
}

function renderBarChart(items: MaintenanceChartItem[]) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const padding = { top: 30, right: 24, bottom: 82, left: 38 };
  const chartWidth = canvas.width - padding.left - padding.right;
  const chartHeight = canvas.height - padding.top - padding.bottom;
  const maxValue = Math.max(...items.map((item) => item.quantidade), 0);
  const steps = maxValue > 0 ? Math.max(3, maxValue) : 3;

  ctx.strokeStyle = '#DDE6F2';
  ctx.lineWidth = 1;
  ctx.font = '12px Arial';
  ctx.fillStyle = palette.secondary;

  for (let i = 0; i <= steps; i += 1) {
    const value = (maxValue / steps) * i;
    const y = padding.top + chartHeight - (chartHeight * i) / steps;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartWidth, y);
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.fillText(String(Math.round(value)), padding.left - 8, y + 4);
  }

  if (items.length === 0 || maxValue === 0) {
    ctx.fillStyle = palette.secondary;
    ctx.font = '600 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Sem registros no período', canvas.width / 2, canvas.height / 2);
    return canvas.toDataURL('image/png');
  }

  const gap = 14;
  const barWidth = Math.min(72, (chartWidth - gap * (items.length - 1)) / items.length);
  const totalBarsWidth = barWidth * items.length + gap * (items.length - 1);
  let startX = padding.left + (chartWidth - totalBarsWidth) / 2;

  items.forEach((item) => {
    const barHeight = clamp((item.quantidade / maxValue) * (chartHeight - 10), 8, chartHeight - 10);
    const x = startX;
    const y = padding.top + chartHeight - barHeight;

    ctx.fillStyle = palette.green;
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.quadraticCurveTo(x, y, x + 8, y);
    ctx.lineTo(x + barWidth - 8, y);
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + 8);
    ctx.lineTo(x + barWidth, y + barHeight);
    ctx.lineTo(x, y + barHeight);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = palette.deepGreen;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(String(item.quantidade), x + barWidth / 2, y - 8);

    ctx.fillStyle = palette.secondary;
    ctx.font = '12px Arial';
    const labelWords = item.categoria.split(' ');
    const lines = labelWords.length > 2
      ? [labelWords.slice(0, Math.ceil(labelWords.length / 2)).join(' '), labelWords.slice(Math.ceil(labelWords.length / 2)).join(' ')]
      : [item.categoria];
    lines.forEach((line, index) => {
      ctx.fillText(line, x + barWidth / 2, padding.top + chartHeight + 22 + index * 14);
    });

    startX += barWidth + gap;
  });

  return canvas.toDataURL('image/png');
}

function splitWrappedText(doc: PdfDoc, text: string, width: number) {
  const lines = doc.splitTextToSize(text || '—', width) as string[];
  return lines.length > 0 ? lines : ['—'];
}

function getSummaryCardLayout(width: number) {
  const padding = 8;
  const columnGap = 6;
  const innerWidth = width - padding * 2;
  const leftWidth = Math.max(38, innerWidth * 0.25);
  const rightWidth = innerWidth - leftWidth - columnGap;
  return { padding, columnGap, innerWidth, leftWidth, rightWidth };
}

function measureSummaryCardHeight(doc: PdfDoc, width: number, data: SummaryCardData) {
  const { padding, columnGap, leftWidth, rightWidth } = getSummaryCardLayout(width);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const subtitleLines = splitWrappedText(
    doc,
    'Modelo pronto para envio por e-mail ou arquivamento em prestação de contas do condomínio.',
    width - padding * 2
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const titleLines = splitWrappedText(doc, `Relatório mensal – ${data.condoName}`, rightWidth);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const periodLines = splitWrappedText(doc, `Período: ${data.period}`, rightWidth);

  const metricRowHeight = 6.8;
  const metricsBlockHeight = data.metrics.length * metricRowHeight + 8;

  let detailsHeight = 0;
  data.details.forEach((detail) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.3);
    const labelLines = splitWrappedText(doc, detail.label, rightWidth);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.1);
    const valueLines = splitWrappedText(doc, detail.value, rightWidth);

    detailsHeight += labelLines.length * 4 + valueLines.length * 3.9 + 3.5;
  });

  const rightHeight =
    titleLines.length * 5 +
    periodLines.length * 4 +
    metricsBlockHeight +
    detailsHeight +
    12;
  const illustrationHeight = Math.max(48, leftWidth * 0.95);
  const contentHeight = Math.max(illustrationHeight, rightHeight);
  const titleBlockHeight = 7 + subtitleLines.length * 4 + 6;

  return padding * 2 + titleBlockHeight + contentHeight;
}

function drawSummaryCard(doc: PdfDoc, x: number, y: number, width: number, data: SummaryCardData) {
  const { padding, columnGap, leftWidth, rightWidth } = getSummaryCardLayout(width);
  const height = measureSummaryCardHeight(doc, width, data);
  drawRoundedCard(doc, x, y, width, height, { fill: palette.softGray, border: palette.border });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...toRgb(palette.navy));
  doc.text('Resumo para relatório (financeiro)', x + padding, y + padding + 1.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...toRgb(palette.secondary));
  const subtitleLines = splitWrappedText(
    doc,
    'Modelo pronto para envio por e-mail ou arquivamento em prestação de contas do condomínio.',
    width - padding * 2
  );
  doc.text(subtitleLines, x + padding, y + padding + 6.5);

  const contentY = y + padding + 6.5 + subtitleLines.length * 4 + 6;
  const illustrationX = x + padding;
  const illustrationY = contentY;
  const illustrationHeight = Math.max(48, leftWidth * 0.95);

  drawRoundedCard(doc, illustrationX, illustrationY, leftWidth, illustrationHeight, {
    fill: palette.white,
    border: palette.border,
    shadow: false,
  });

  doc.setFillColor(...toRgb(palette.softBlue));
  doc.roundedRect(illustrationX + 6, illustrationY + 8, Math.min(24, leftWidth - 18), 32, 3, 3, 'F');
  doc.setDrawColor(...toRgb(palette.blue));
  doc.setLineWidth(0.6);
  doc.line(illustrationX + 10, illustrationY + 18, illustrationX + 26, illustrationY + 18);
  doc.line(illustrationX + 10, illustrationY + 23, illustrationX + 26, illustrationY + 23);
  doc.line(illustrationX + 10, illustrationY + 28, illustrationX + 20, illustrationY + 28);
  doc.setFillColor(...toRgb(palette.green));
  doc.roundedRect(illustrationX + leftWidth - 17, illustrationY + 30, 4, 10, 1.2, 1.2, 'F');
  doc.setFillColor(...toRgb(palette.blue));
  doc.roundedRect(illustrationX + leftWidth - 11, illustrationY + 24, 4, 16, 1.2, 1.2, 'F');
  doc.setFillColor(...toRgb(palette.cyan));
  doc.roundedRect(illustrationX + leftWidth - 5, illustrationY + 18, 4, 22, 1.2, 1.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...toRgb(palette.navy));
  doc.text('SIGAC', illustrationX + 6, illustrationY + illustrationHeight - 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...toRgb(palette.secondary));
  doc.text('relatório financeiro', illustrationX + 6, illustrationY + illustrationHeight - 5);

  const detailsX = illustrationX + leftWidth + columnGap;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...toRgb(palette.navy));
  const titleLines = splitWrappedText(doc, `Relatório mensal – ${data.condoName}`, rightWidth);
  doc.text(titleLines, detailsX, contentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...toRgb(palette.secondary));
  const periodLines = splitWrappedText(doc, `Período: ${data.period}`, rightWidth);
  const titleBottomY = contentY + 5 + (titleLines.length - 1) * 5;
  doc.text(periodLines, detailsX, titleBottomY + 6);

  let currentY = titleBottomY + 11 + (periodLines.length - 1) * 4;

  drawRoundedCard(doc, detailsX, currentY, rightWidth, data.metrics.length * 6.8 + 8, {
    fill: palette.white,
    border: palette.border,
    shadow: false,
  });

  let metricY = currentY + 7;
  data.metrics.forEach((metric, index) => {
    const labelX = detailsX + 4;
    const valueX = detailsX + rightWidth - 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...toRgb(palette.text));
    doc.text(metric.label, labelX, metricY);

    const labelWidth = clamp(doc.getTextWidth(metric.label), 10, rightWidth - 36);
    doc.setDrawColor(...toRgb(palette.border));
    doc.setLineWidth(0.25);
    doc.line(labelX + labelWidth + 2, metricY - 0.4, valueX - 26, metricY - 0.4);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...toRgb(
      metric.tone === 'negative'
        ? palette.red
        : metric.tone === 'positive'
          ? palette.deepGreen
          : palette.navy
    ));
    doc.text(metric.value, valueX, metricY, { align: 'right' });

    if (index < data.metrics.length - 1) {
      doc.setDrawColor(...toRgb('#EAF0F8'));
      doc.line(detailsX + 4, metricY + 2.6, detailsX + rightWidth - 4, metricY + 2.6);
    }
    metricY += 6.8;
  });

  currentY += data.metrics.length * 6.8 + 12;

  data.details.forEach((detail) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.3);
    doc.setTextColor(...toRgb(palette.navy));
    const labelLines = splitWrappedText(doc, detail.label, rightWidth);
    doc.text(labelLines, detailsX, currentY);
    currentY += labelLines.length * 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.1);
    doc.setTextColor(...toRgb(palette.secondary));
    const valueLines = splitWrappedText(doc, detail.value, rightWidth);
    doc.text(valueLines, detailsX, currentY);
    currentY += valueLines.length * 3.9 + 3.5;
  });

  return height;
}

function addHeader(doc: PdfDoc, pageWidth: number, period: string, condoName: string, generatedAt: Date, identityLine: string) {
  drawSigacMark(doc, 14, 10, 1.15, palette.navy);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...toRgb(palette.navy));
  doc.text('SIGAC', 32, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...toRgb(palette.secondary));
  doc.text('Sistema Integrado de Gestão e Administração Condominial', 32, 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...toRgb(palette.navy));
  doc.text('Relatório Mensal', pageWidth - 14, 16, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(ellipseText(doc, condoName, 84), pageWidth - 14, 22, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...toRgb(palette.secondary));
  doc.text(period, pageWidth - 14, 27, { align: 'right' });
  doc.text(ellipseText(doc, identityLine, 84), pageWidth - 14, 31.5, { align: 'right' });

  doc.setDrawColor(...toRgb(palette.blue));
  doc.setLineWidth(0.8);
  doc.line(14, 35, pageWidth - 14, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...toRgb(palette.secondary));
  doc.text(`Gerado em ${fmtDateTime(generatedAt)}`, 14, 39.5);
}

function addFooter(doc: PdfDoc, pageWidth: number, pageHeight: number, currentPage: number, totalPages: number) {
  const footerY = pageHeight - 12;
  doc.setDrawColor(...toRgb(palette.blue));
  doc.setLineWidth(0.6);
  doc.line(14, footerY - 4.5, pageWidth - 14, footerY - 4.5);

  drawSigacMark(doc, 14, footerY - 3.5, 0.55, palette.navy);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...toRgb(palette.secondary));
  doc.text('SIGAC • Sistema Integrado de Gestão e Administração Condominial', 23, footerY + 1.5);
  doc.text(`Página ${currentPage} de ${totalPages}`, pageWidth - 14, footerY + 1.5, { align: 'right' });
}

export async function buildMonthlyReportPdf({
  data,
  relatorioRows,
  ano,
  mes,
  requestedBy,
  generatedAt = new Date(),
}: BuildMonthlyReportPdfParams): Promise<{ blob: Blob; filename: string }> {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const autoTable = autoTableModule.default;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 14;
  const right = pageWidth - 14;
  const contentWidth = right - left;
  const contentTop = 45;
  const contentBottom = pageHeight - 20;
  const period = formatPeriod(ano, mes);
  const identityLine = buildIdentityLine(requestedBy);
  const saldoNegativo = (data.saldoMes ?? 0) < 0;

  const chartItems: LegendItem[] = [
    { label: 'Funcionários', value: data.totalFuncionarios ?? 0, color: donutColors[0] },
    { label: 'Produtos', value: data.totalProdutos ?? 0, color: donutColors[1] },
    { label: 'Manutenções', value: data.totalManutencoes ?? 0, color: donutColors[2] },
  ];
  const donutImage = renderDonutChart(chartItems, data.totalGeral ?? 0);

  const maintenanceItems: MaintenanceChartItem[] = (data.manutencoesPorCategoria?.length ? data.manutencoesPorCategoria : [])
    .filter((item) => item.quantidade > 0)
    .map((item: IndicadorManutencaoCategoriaDTO) => ({
      categoria: getCategoriaManutencaoLabel(item.categoria),
      quantidade: item.quantidade,
      valorTotal: item.valorTotal,
    }));
  const barChartImage = renderBarChart(maintenanceItems);

  let y = contentTop;
  const ensureSpace = (needed: number) => {
    if (y + needed <= contentBottom) return;
    doc.addPage();
    y = contentTop;
  };

  drawSectionTitle(
    doc,
    'Resumo Financeiro',
    'Visão geral da arrecadação, despesas e saldo do condomínio.',
    left,
    y,
    90
  );

  const chipWidth = 34;
  const chipGap = 4;
  const chipX1 = right - chipWidth * 2 - chipGap;
  const chipX2 = right - chipWidth;
  const chipY = y - 2;
  drawRoundedCard(doc, chipX1, chipY, chipWidth, 14, {
    fill: palette.softBlue,
    border: palette.border,
    shadow: false,
  });
  drawRoundedCard(doc, chipX2, chipY, chipWidth, 14, {
    fill: palette.softBlue,
    border: palette.border,
    shadow: false,
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...toRgb(palette.secondary));
  doc.text('Período', chipX1 + 4, chipY + 4.8);
  doc.text('Gerado em', chipX2 + 4, chipY + 4.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.setTextColor(...toRgb(palette.navy));
  splitChipText(doc, period, chipWidth - 8).forEach((line, index) => {
    doc.text(line, chipX1 + 4, chipY + 9.5 + index * 3.8);
  });
  splitChipText(doc, fmtDateTime(generatedAt), chipWidth - 8).forEach((line, index) => {
    doc.text(line, chipX2 + 4, chipY + 9.5 + index * 3.8);
  });

  y += 21;

  const cardGap = 4;
  const cardWidth = (contentWidth - cardGap * 2) / 3;
  const cardHeight = 26;
  const indicatorCards = [
    {
      title: 'Arrecadação',
      value: fmtMoney(data.totalArrecadado),
      helper: 'Valor único do mês',
      iconColor: palette.deepGreen,
      valueColor: palette.deepGreen,
      fill: palette.white,
      border: palette.border,
    },
    {
      title: 'Saldo do mês',
      value: fmtMoney(data.saldoMes),
      helper: saldoNegativo ? 'Prejuízo' : 'Superávit',
      iconColor: saldoNegativo ? palette.red : palette.deepGreen,
      valueColor: saldoNegativo ? palette.red : palette.navy,
      fill: palette.white,
      border: palette.border,
    },
    {
      title: 'Funcionários',
      value: String(relatorioRows.funcionarios.length),
      helper: fmtMoney(data.totalFuncionarios),
      iconColor: palette.blue,
      valueColor: palette.navy,
      fill: palette.white,
      border: palette.border,
    },
    {
      title: 'Produtos',
      value: String(relatorioRows.gastosProdutos.length),
      helper: fmtMoney(data.totalProdutos),
      iconColor: palette.cyan,
      valueColor: palette.navy,
      fill: palette.white,
      border: palette.border,
    },
    {
      title: 'Manutenções',
      value: String(relatorioRows.manutencoes.length),
      helper: fmtMoney(data.totalManutencoes),
      iconColor: palette.green,
      valueColor: palette.navy,
      fill: palette.white,
      border: palette.border,
    },
    {
      title: 'Despesas do mês',
      value: fmtMoney(data.totalGeral),
      helper: 'Total consolidado',
      iconColor: palette.white,
      valueColor: palette.white,
      fill: palette.blue,
      border: palette.blue,
    },
  ];

  indicatorCards.forEach((card, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = left + col * (cardWidth + cardGap);
    const cardY = y + row * (cardHeight + cardGap);
    drawRoundedCard(doc, x, cardY, cardWidth, cardHeight, {
      fill: card.fill,
      border: card.border,
    });

    doc.setFillColor(...toRgb(card.iconColor));
    doc.circle(x + 8, cardY + 8, 4.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...toRgb(card.fill === palette.blue ? palette.white : palette.secondary));
    doc.text(card.title, x + 15, cardY + 7.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(...toRgb(card.valueColor));
    doc.text(ellipseText(doc, card.value, cardWidth - 18), x + 15, cardY + 14.6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.setTextColor(...toRgb(card.fill === palette.blue ? '#E8F0FF' : palette.secondary));
    doc.text(ellipseText(doc, card.helper, cardWidth - 18), x + 15, cardY + 20.2);
  });

  y += cardHeight * 2 + cardGap + 8;

  ensureSpace(74);
  const graphBoxWidth = (contentWidth - 5) / 2;
  const graphBoxHeight = 68;

  const drawGraphBox = (title: string, subtitle: string, x: number, boxY: number) => {
    drawRoundedCard(doc, x, boxY, graphBoxWidth, graphBoxHeight, {
      fill: palette.white,
      border: palette.border,
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...toRgb(palette.navy));
    doc.text(title, x + 5, boxY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...toRgb(palette.secondary));
    doc.text(subtitle, x + 5, boxY + 12.5);
  };

  const donutBoxX = left;
  const barBoxX = left + graphBoxWidth + 5;
  drawGraphBox('Distribuição das despesas', 'Participação percentual por categoria.', donutBoxX, y);
  drawGraphBox('Indicador de manutenções por categoria', 'Quantidade de manutenções por categoria no período.', barBoxX, y);

  if (donutImage) {
    doc.addImage(donutImage, 'PNG', donutBoxX + 3, y + 15, 41, 41, undefined, 'FAST');
  }
  if (barChartImage) {
    doc.addImage(barChartImage, 'PNG', barBoxX + 4, y + 15, graphBoxWidth - 8, 44, undefined, 'FAST');
  }

  const legendX = donutBoxX + 45;
  let legendY = y + 20;
  const totalDespesas = data.totalGeral ?? 0;
  chartItems.forEach((item) => {
    doc.setFillColor(...toRgb(item.color));
    doc.roundedRect(legendX, legendY - 3.2, 3.5, 3.5, 0.8, 0.8, 'F');

    const percentage = totalDespesas > 0 ? `${((item.value / totalDespesas) * 100).toFixed(1).replace('.', ',')}%` : '0,0%';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...toRgb(palette.navy));
    doc.text(item.label, legendX + 5.2, legendY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...toRgb(palette.secondary));
    doc.text(`${percentage} • ${fmtMoney(item.value)}`, legendX + 5.2, legendY + 4);
    legendY += 10;
  });

  doc.setDrawColor(...toRgb(palette.border));
  doc.line(legendX, legendY + 1.5, donutBoxX + graphBoxWidth - 5, legendY + 1.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(...toRgb(palette.navy));
  doc.text('Total', legendX, legendY + 7);
  doc.text(`100% • ${fmtMoney(totalDespesas)}`, donutBoxX + graphBoxWidth - 5, legendY + 7, { align: 'right' });

  y += graphBoxHeight + 8;

  const tableTheme = {
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: { top: 2.2, right: 2.2, bottom: 2.2, left: 2.2 },
      textColor: toRgb(palette.text),
      lineColor: toRgb(palette.border),
      lineWidth: 0.15,
      overflow: 'linebreak' as const,
      valign: 'middle' as const,
    },
    headStyles: {
      fillColor: toRgb(palette.softBlue),
      textColor: toRgb(palette.navy),
      fontStyle: 'bold' as const,
      lineColor: toRgb(palette.border),
      lineWidth: 0.2,
    },
    bodyStyles: {
      fillColor: toRgb(palette.white),
    },
    alternateRowStyles: {
      fillColor: toRgb('#FBFDFF'),
    },
    footStyles: {
      fillColor: toRgb('#EEF4FB'),
      textColor: toRgb(palette.navy),
      fontStyle: 'bold' as const,
      lineColor: toRgb(palette.border),
      lineWidth: 0.2,
    },
    margin: { left, right: pageWidth - right, top: contentTop, bottom: pageHeight - contentBottom },
    theme: 'grid' as const,
    showHead: 'everyPage' as const,
    rowPageBreak: 'avoid' as const,
  };

  const renderTableSectionTitle = (title: string, subtitle: string) => {
    ensureSpace(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...toRgb(palette.navy));
    doc.text(title, left, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(...toRgb(palette.secondary));
    doc.text(subtitle, left, y + 4.4);
    y += 7.5;
  };

  renderTableSectionTitle('Funcionários e valores mensais', 'Composição da folha fixa do condomínio no mês.');
  autoTable(doc, {
    ...tableTheme,
    startY: y,
    head: [['Nome', 'Função', 'Valor mensal']],
    body: relatorioRows.funcionarios.length > 0
      ? relatorioRows.funcionarios.map((item) => [item.nome, item.funcao, fmtMoney(item.valorMensal)])
      : [['Nenhum funcionário cadastrado no período.', '', '']],
    foot: [['Total', '', fmtMoney(data.totalFuncionarios)]],
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 65 },
      2: { cellWidth: 35, halign: 'right' as const },
    },
  });
  y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 10;

  renderTableSectionTitle('Manutenções do mês', 'Detalhamento das despesas com manutenção registradas no período.');
  autoTable(doc, {
    ...tableTheme,
    startY: y,
    head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Prestador', 'Valor']],
    body: relatorioRows.manutencoes.length > 0
      ? relatorioRows.manutencoes.map((item) => [
          fmtDate(item.data),
          item.descricao,
          getCategoriaManutencaoLabel(item.categoria),
          getTipoManutencaoLabel(item.tipo),
          item.prestador ?? '—',
          fmtMoney(item.valor),
        ])
      : [['Nenhuma manutenção registrada no período.', '', '', '', '', '']],
    foot: [['Total', '', '', '', '', fmtMoney(data.totalManutencoes)]],
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 46 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20 },
      4: { cellWidth: 39 },
      5: { cellWidth: 25, halign: 'right' as const },
    },
  });
  y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 10;

  renderTableSectionTitle('Gastos com produtos no mês', 'Lançamentos de compras e fornecedores relacionados ao período.');
  autoTable(doc, {
    ...tableTheme,
    startY: y,
    head: [['Data', 'Descrição', 'Loja/Fornecedor', 'Valor']],
    body: relatorioRows.gastosProdutos.length > 0
      ? relatorioRows.gastosProdutos.map((item) => [
          fmtDate(item.data),
          item.descricao ?? '—',
          item.lojaFornecedor ?? '—',
          fmtMoney(item.valor),
        ])
      : [['Nenhum gasto com produtos registrado no período.', '', '', '']],
    foot: [['Total', '', '', fmtMoney(data.totalProdutos)]],
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 78 },
      2: { cellWidth: 55 },
      3: { cellWidth: 25, halign: 'right' as const },
    },
  });
  y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 12;

  const categoriasResumo = maintenanceItems.length > 0
    ? maintenanceItems.map((item) => `${item.categoria} (${item.quantidade})`).join(', ')
    : 'Sem registros';
  const summaryCardData: SummaryCardData = {
    condoName: data.nomeCondominio,
    period,
    metrics: [
      { label: 'Arrecadação', value: fmtMoney(data.totalArrecadado), tone: 'positive' },
      { label: 'Funcionários', value: fmtMoney(data.totalFuncionarios) },
      { label: 'Produtos', value: fmtMoney(data.totalProdutos) },
      { label: 'Manutenções', value: fmtMoney(data.totalManutencoes), tone: 'positive' },
      { label: 'Despesas', value: fmtMoney(data.totalGeral) },
      { label: 'Saldo', value: fmtMoney(data.saldoMes), tone: saldoNegativo ? 'negative' : 'positive' },
    ],
    details: [
      {
        label: 'Registros do período',
        value: `${relatorioRows.funcionarios.length} funcionário(s), ${relatorioRows.gastosProdutos.length} lançamento(s) de produtos e ${relatorioRows.manutencoes.length} manutenção(ões).`,
      },
      {
        label: 'Categorias de manutenção',
        value: categoriasResumo,
      },
    ],
  };

  const summaryCardHeight = measureSummaryCardHeight(doc, contentWidth, summaryCardData);
  ensureSpace(summaryCardHeight + 2);
  y += drawSummaryCard(doc, left, y, contentWidth, summaryCardData) + 2;

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    addHeader(doc, pageWidth, period, data.nomeCondominio, generatedAt, identityLine);
    addFooter(doc, pageWidth, pageHeight, page, totalPages);
  }

  const fileBase = `relatorio-financeiro-${data.nomeCondominio.replace(/\s+/g, '-').toLowerCase()}-${ano}-${String(mes).padStart(2, '0')}`;
  return {
    blob: doc.output('blob') as Blob,
    filename: `${fileBase}.pdf`,
  };
}
