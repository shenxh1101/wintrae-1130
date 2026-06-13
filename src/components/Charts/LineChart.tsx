import ReactECharts from 'echarts-for-react'
import { EChartsOption } from 'echarts'

interface LineChartProps {
  data: any[]
  xAxisKey: string
  series: Array<{
    name: string
    dataKey: string
    color?: string
  }>
  height?: number
  title?: string
}

export default function LineChart({
  data,
  xAxisKey,
  series,
  height = 300,
  title,
}: LineChartProps) {
  const option: EChartsOption = {
    title: title
      ? {
          text: title,
          textStyle: {
            color: '#e5e7eb',
            fontSize: 16,
            fontWeight: 'bold',
          },
          left: 'center',
        }
      : undefined,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 58, 95, 0.9)',
      borderColor: 'rgba(0, 212, 255, 0.3)',
      textStyle: {
        color: '#e5e7eb',
      },
    },
    legend: {
      data: series.map((s) => s.name),
      textStyle: {
        color: '#9ca3af',
      },
      top: title ? 30 : 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: title ? '15%' : '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item[xAxisKey]),
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.3)',
        },
      },
      axisLabel: {
        color: '#9ca3af',
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.3)',
        },
      },
      axisLabel: {
        color: '#9ca3af',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.1)',
        },
      },
    },
    series: series.map((s, index) => ({
      name: s.name,
      type: 'line',
      data: data.map((item) => item[s.dataKey]),
      smooth: true,
      lineStyle: {
        width: 2,
        color: s.color || `rgba(${0 + index * 50}, ${212 - index * 20}, 255, 1)`,
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: s.color || `rgba(${0 + index * 50}, ${212 - index * 20}, 255, 0.3)`,
            },
            {
              offset: 1,
              color: 'rgba(10, 22, 40, 0.1)',
            },
          ],
        },
      },
      itemStyle: {
        color: s.color || `rgb(${0 + index * 50}, ${212 - index * 20}, 255)`,
      },
    })),
  }

  return (
    <div className="card">
      <ReactECharts option={option} style={{ height: `${height}px` }} />
    </div>
  )
}
