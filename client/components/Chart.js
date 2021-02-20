import React from 'react'
import {Bar} from 'react-chartjs-2'

const Chart = props => {
  const options = {
    title: {
      display: props.displayTitle,
      text: 'News Content Analysis',
      fontSize: 20,
      fontFamily: "'Vollkorn', serif",
      marginBottom: '1rem',
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              callback: value => `${value}%`
            }
          }
        ]
      }
    },
    legend: {
      display: false
    }
  }

  return <Bar data={props.chartData} options={options} />
}

export default Chart
