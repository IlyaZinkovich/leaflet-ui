function createChart(data, chartElementId) {
  // var allCountriesData = countriesNames.map(function(country) {
  //   var chartData = [];
  //   for (time in data[country]) {
  //     chartData.push([new Date(time).getTime(), data[country][time]]);
  //   }
  //   chartData.sort();
  //   chartData.push({
  //     type: 'line',
  //     data: chartData
  //   })
  //   return {
  //     type: 'line',
  //     data: chartData
  //   }
  // })
  var chartData = [];
  for (time in data) {
    chartData.push([new Date(time).getTime(), data[time]]);
  }
  chartData.sort();
  Highcharts.chart(chartElementId, {
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
