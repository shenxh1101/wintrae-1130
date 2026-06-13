import ReactECharts from 'echarts-for-react'
import { EChartsOption } from 'echarts'

interface GaugeChartProps {
  value: number
  max: number
  title: string
  unit: string
  color?: string
  size?: number
}

export default function GaugeChart({
  value,
  max,
  title,
  unit,
  color = '#00d4ff',
  size = 200,
}: GaugeChartProps) {
  const percentage = (value / max) * 100

  const option: EChartsOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 220,
        endAngle: -40,
        min: 0,
        max: max,
        radius: '90%',
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 15,
            color: [
              [percentage / 100, color],
              [1, 'rgba(0, 212, 255, 0.2)'],
            ],
          },
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '60%',
          width: 8,
          offsetCenter: [0, '-40%'],
          itemStyle: {
            color: color,
          },
        },
        axisTick: {
          length: 8,
          lineStyle: {
            color: 'auto',
            width: 2,
          },
        },
        splitLine: {
          length: 15,
          lineStyle: {
            color: 'auto',
            width: 3,
          },
        },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 10,
          distance: -50,
        },
        title: {
          show: true,
          offsetCenter: [0, '70%'],
          fontSize: 14,
          color: '#d1d5db',
          fontWeight: 'bold',
        },
        detail: {
          valueAnimation: true,
          fontSize: 24,
          fontWeight: 'bold',
          offsetCenter: [0, '30%'],
          formatter: `{value}${unit}`,
          color: color,
        },
        data: [
          {
            value: value,
            name: title,
          },
        ],
      },
    ],
  }

  return (
    <div className="card">
      <ReactECharts option={option} style={{ height: `${size}px`, width: '100%' }} />
    </div>
  )
}
