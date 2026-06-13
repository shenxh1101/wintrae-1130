import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { Warning, Station } from '../store/useStore'

export const exportPatrolReportPDF = (
  reportData: any,
  stations: Station[]
) => {
  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.setTextColor(0, 212, 255)
  doc.text(reportData.title, 105, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.setTextColor(100)
  doc.text(`时间范围: ${reportData.dateRange}`, 105, 30, { align: 'center' })

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

  doc.save(`日常巡查报表_${new Date().toISOString().split('T')[0]}.pdf`)
}

export const exportWarningReportPDF = (reportData: any) => {
  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.setTextColor(239, 68, 68)
  doc.text(reportData.title, 105, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.setTextColor(100)
  doc.text(`时间范围: ${reportData.dateRange}`, 105, 30, { align: 'center' })

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

  doc.save(`预警处置报表_${new Date().toISOString().split('T')[0]}.pdf`)
}

export const exportPatrolReportExcel = (
  reportData: any,
  stations: Station[]
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

  XLSX.writeFile(wb, `日常巡查报表_${new Date().toISOString().split('T')[0]}.xlsx`)
}

export const exportWarningReportExcel = (reportData: any) => {
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

  XLSX.writeFile(wb, `预警处置报表_${new Date().toISOString().split('T')[0]}.xlsx`)
}

export const generatePatrolReportData = (
  startDate: string,
  endDate: string,
  stations: Station[],
  warnings: Warning[]
) => {
  return {
    title: '日常巡查报表',
    dateRange: `${startDate} 至 ${endDate}`,
    summary: {
      totalInspections: Math.floor(Math.random() * 20) + 10,
      stationsInspected: stations.length,
      anomalies: warnings.filter((w) => w.status !== 'resolved').length,
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
  return {
    title: '预警处置报表',
    dateRange: `${startDate} 至 ${endDate}`,
    summary: {
      totalWarnings: warnings.length,
      pending: warnings.filter((w) => w.status === 'pending').length,
      confirmed: warnings.filter((w) => w.status === 'confirmed').length,
      resolved: warnings.filter((w) => w.status === 'resolved').length,
    },
    warnings: warnings.map((w) => ({
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
