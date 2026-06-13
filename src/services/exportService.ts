import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel } from 'docx'
import { Warning, Station } from '../store/useStore'

export const exportPatrolReportPDF = (
  reportData: any,
  stations: Station[],
  startDate: string,
  endDate: string
) => {
  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.setTextColor(0, 212, 255)
  doc.text(reportData.title, 105, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.setTextColor(100)
  doc.text(`时间范围: ${startDate} 至 ${endDate}`, 105, 30, { align: 'center' })

  doc.setFontSize(14)
  doc.setTextColor(50)
  doc.text('数据汇总', 14, 45)

  const summaryData = [
    ['巡查次数', reportData.summary.totalInspections.toString()],
    ['监测站数', reportData.summary.stationsInspected.toString()],
    ['异常次数', reportData.summary.anomalies.toString()],
    ['设备正常数', reportData.summary.equipmentStatus.toString()],
  ]

  doc.autoTable({
    startY: 50,
    head: [['指标', '数值']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [0, 212, 255] },
  })

  doc.setFontSize(14)
  doc.text('监测站详情', 14, doc.lastAutoTable.finalY + 15)

  const stationData = reportData.stationData.map((s: any) => [
    s.name,
    s.status,
    s.lastInspection,
  ])

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['监测站名称', '状态', '最后巡查时间']],
    body: stationData,
    theme: 'grid',
    headStyles: { fillColor: [0, 212, 255] },
  })

  doc.setFontSize(10)
  doc.setTextColor(150)
  doc.text(
    `生成时间: ${new Date().toLocaleString('zh-CN')}`,
    105,
    doc.lastAutoTable.finalY + 15,
    { align: 'center' }
  )

  doc.save(`日常巡查报表_${startDate}_${endDate}.pdf`)
}

export const exportWarningReportPDF = (
  reportData: any,
  startDate: string,
  endDate: string
) => {
  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.setTextColor(239, 68, 68)
  doc.text(reportData.title, 105, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.setTextColor(100)
  doc.text(`时间范围: ${startDate} 至 ${endDate}`, 105, 30, { align: 'center' })

  doc.setFontSize(14)
  doc.setTextColor(50)
  doc.text('预警统计', 14, 45)

  const summaryData = [
    ['预警总数', reportData.summary.totalWarnings.toString()],
    ['待处理', reportData.summary.pending.toString()],
    ['处理中', reportData.summary.confirmed.toString()],
    ['已解决', reportData.summary.resolved.toString()],
  ]

  doc.autoTable({
    startY: 50,
    head: [['状态', '数量']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68] },
  })

  doc.setFontSize(14)
  doc.text('预警列表', 14, doc.lastAutoTable.finalY + 15)

  const warningData = reportData.warnings.map((w: any) => [
    w.type,
    w.level,
    w.status,
    w.time,
    w.message,
  ])

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['类型', '等级', '状态', '时间', '详情']],
    body: warningData,
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68] },
  })

  doc.setFontSize(10)
  doc.setTextColor(150)
  doc.text(
    `生成时间: ${new Date().toLocaleString('zh-CN')}`,
    105,
    doc.lastAutoTable.finalY + 15,
    { align: 'center' }
  )

  doc.save(`预警处置报表_${startDate}_${endDate}.pdf`)
}

export const exportPatrolReportExcel = (
  reportData: any,
  stations: Station[],
  startDate: string,
  endDate: string
) => {
  const wb = XLSX.utils.book_new()

  const summaryWS = XLSX.utils.json_to_sheet([
    { 指标: '巡查次数', 数值: reportData.summary.totalInspections },
    { 指标: '监测站数', 数值: reportData.summary.stationsInspected },
    { 指标: '异常次数', 数值: reportData.summary.anomalies },
    { 指标: '设备正常数', 数值: reportData.summary.equipmentStatus },
  ])

  const stationWS = XLSX.utils.json_to_sheet(
    reportData.stationData.map((s: any) => ({
      监测站名称: s.name,
      状态: s.status,
      最后巡查时间: s.lastInspection,
    }))
  )

  XLSX.utils.book_append_sheet(wb, summaryWS, '数据汇总')
  XLSX.utils.book_append_sheet(wb, stationWS, '监测站详情')

  XLSX.writeFile(wb, `日常巡查报表_${startDate}_${endDate}.xlsx`)
}

export const exportWarningReportExcel = (
  reportData: any,
  startDate: string,
  endDate: string
) => {
  const wb = XLSX.utils.book_new()

  const summaryWS = XLSX.utils.json_to_sheet([
    { 状态: '预警总数', 数量: reportData.summary.totalWarnings },
    { 状态: '待处理', 数量: reportData.summary.pending },
    { 状态: '处理中', 数量: reportData.summary.confirmed },
    { 状态: '已解决', 数量: reportData.summary.resolved },
  ])

  const warningWS = XLSX.utils.json_to_sheet(
    reportData.warnings.map((w: any) => ({
      类型: w.type,
      等级: w.level,
      状态: w.status,
      时间: w.time,
      详情: w.message,
    }))
  )

  XLSX.utils.book_append_sheet(wb, summaryWS, '预警统计')
  XLSX.utils.book_append_sheet(wb, warningWS, '预警列表')

  XLSX.writeFile(wb, `预警处置报表_${startDate}_${endDate}.xlsx`)
}

export const exportPatrolReportWord = async (
  reportData: any,
  stations: Station[],
  startDate: string,
  endDate: string
) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: reportData.title,
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `时间范围: ${startDate} 至 ${endDate}`, color: '666666' }),
          ],
        }),
        new Paragraph({
          text: '数据汇总',
          heading: HeadingLevel.HEADING_1,
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('指标')] }),
                new TableCell({ children: [new Paragraph('数值')] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('巡查次数')] }),
                new TableCell({ children: [new Paragraph(reportData.summary.totalInspections.toString())] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('监测站数')] }),
                new TableCell({ children: [new Paragraph(reportData.summary.stationsInspected.toString())] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('异常次数')] }),
                new TableCell({ children: [new Paragraph(reportData.summary.anomalies.toString())] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('设备正常数')] }),
                new TableCell({ children: [new Paragraph(reportData.summary.equipmentStatus.toString())] }),
              ],
            }),
          ],
        }),
        new Paragraph({
          text: '监测站详情',
          heading: HeadingLevel.HEADING_1,
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('监测站名称')] }),
                new TableCell({ children: [new Paragraph('状态')] }),
                new TableCell({ children: [new Paragraph('最后巡查时间')] }),
              ],
            }),
            ...reportData.stationData.map((s: any) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(s.name)] }),
                  new TableCell({ children: [new Paragraph(s.status)] }),
                  new TableCell({ children: [new Paragraph(s.lastInspection)] }),
                ],
              })
            ),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `生成时间: ${new Date().toLocaleString('zh-CN')}`, color: '999999' }),
          ],
        }),
      ],
    }],
  })

  const buffer = await Packer.toBuffer(doc)
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `日常巡查报表_${startDate}_${endDate}.docx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export const exportWarningReportWord = async (
  reportData: any,
  startDate: string,
  endDate: string
) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: reportData.title,
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `时间范围: ${startDate} 至 ${endDate}`, color: '666666' }),
          ],
        }),
        new Paragraph({
          text: '预警统计',
          heading: HeadingLevel.HEADING_1,
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('状态')] }),
                new TableCell({ children: [new Paragraph('数量')] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('预警总数')] }),
                new TableCell({ children: [new Paragraph(reportData.summary.totalWarnings.toString())] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('待处理')] }),
                new TableCell({ children: [new Paragraph(reportData.summary.pending.toString())] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('处理中')] }),
                new TableCell({ children: [new Paragraph(reportData.summary.confirmed.toString())] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('已解决')] }),
                new TableCell({ children: [new Paragraph(reportData.summary.resolved.toString())] }),
              ],
            }),
          ],
        }),
        new Paragraph({
          text: '预警列表',
          heading: HeadingLevel.HEADING_1,
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('类型')] }),
                new TableCell({ children: [new Paragraph('等级')] }),
                new TableCell({ children: [new Paragraph('状态')] }),
                new TableCell({ children: [new Paragraph('时间')] }),
                new TableCell({ children: [new Paragraph('详情')] }),
              ],
            }),
            ...reportData.warnings.map((w: any) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(w.type)] }),
                  new TableCell({ children: [new Paragraph(w.level)] }),
                  new TableCell({ children: [new Paragraph(w.status)] }),
                  new TableCell({ children: [new Paragraph(w.time)] }),
                  new TableCell({ children: [new Paragraph(w.message)] }),
                ],
              })
            ),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `生成时间: ${new Date().toLocaleString('zh-CN')}`, color: '999999' }),
          ],
        }),
      ],
    }],
  })

  const buffer = await Packer.toBuffer(doc)
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `预警处置报表_${startDate}_${endDate}.docx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export const generatePatrolReportData = (
  startDate: string,
  endDate: string,
  stations: Station[],
  warnings: Warning[]
) => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const filteredWarnings = warnings.filter(w => {
    const warningDate = new Date(w.timestamp)
    return warningDate >= start && warningDate <= end
  })

  return {
    title: '日常巡查报表',
    dateRange: `${startDate} 至 ${endDate}`,
    startDate,
    endDate,
    summary: {
      totalInspections: Math.floor(Math.random() * 20) + 10 + filteredWarnings.length,
      stationsInspected: stations.length,
      anomalies: filteredWarnings.filter((w) => w.status !== 'resolved').length,
      equipmentStatus: stations.filter((s) => s.status === 'online').length,
    },
    stationData: stations.map((station) => ({
      name: station.name,
      status: station.status === 'online' ? '正常' : '异常',
      lastInspection: new Date(
        Date.now() - Math.random() * 24 * 60 * 60 * 1000
      ).toLocaleDateString('zh-CN'),
    })),
  }
}

export const generateWarningReportData = (
  startDate: string,
  endDate: string,
  warnings: Warning[]
) => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const filteredWarnings = warnings.filter(w => {
    const warningDate = new Date(w.timestamp)
    return warningDate >= start && warningDate <= end
  })

  return {
    title: '预警处置报表',
    dateRange: `${startDate} 至 ${endDate}`,
    startDate,
    endDate,
    summary: {
      totalWarnings: filteredWarnings.length,
      pending: filteredWarnings.filter((w) => w.status === 'pending').length,
      confirmed: filteredWarnings.filter((w) => w.status === 'confirmed').length,
      resolved: filteredWarnings.filter((w) => w.status === 'resolved').length,
    },
    warnings: filteredWarnings.map((w) => ({
      type:
        w.type === 'wind'
          ? '大风预警'
          : w.type === 'visibility'
          ? '低能见度'
          : w.type === 'water'
          ? '水质异常'
          : '设备故障',
      level: w.level === 'danger' ? '危险' : w.level === 'warning' ? '警告' : '提示',
      status:
        w.status === 'pending'
          ? '待处理'
          : w.status === 'confirmed'
          ? '处理中'
          : '已解决',
      time: new Date(w.timestamp).toLocaleString('zh-CN'),
      message: w.message,
    })),
  }
}
