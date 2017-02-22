function createChart(data) {
  var chartData = [];
  for (time in data) {
    chartData.push([new Date(time).getTime(), data[time]]);
  }
  chartData.sort();
  Highcharts.chart('chart', {
    chart: {
      zoomType: 'x'
    },
    title: {
      text: null
    },
    xAxis: {
      type: 'datetime'
    },
    yAxis: {
      title: {
        text: null
      }
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      area: {
        marker: {
          radius: 2
        },
        lineWidth: 1,
        states: {
          hover: {
            lineWidth: 1
          }
        },
        threshold: null
      }
    },

    series: [{
      type: 'line',
      data: chartData
    }]
  });
}
