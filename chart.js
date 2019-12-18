

let arbitrageData = [];
let dataPointCount = arbitrageData.length;

const chart = new Chart(document.getElementById("line-chart"), {
  type: 'line',
  data: {
    labels: [],
    // datasets: [{ 
    //     data: [86,114,106,106,107,111,133,221,783,2478],
    //     label: "Africa",
    //     borderColor: "#3e95cd",
    //     fill: false
    //   }, { 
    //     data: [282,350,411,502,635,809,947,1402,3700,5267],
    //     label: "Asia",
    //     borderColor: "#8e5ea2",
    //     fill: false
    //   }, { 
    //     data: [168,170,178,190,203,276,408,547,675,734],
    //     label: "Europe",
    //     borderColor: "#3cba9f",
    //     fill: false
    //   }, { 
    //     data: [40,20,10,16,24,38,74,167,508,784],
    //     label: "Latin America",
    //     borderColor: "#e8c3b9",
    //     fill: false
    //   }, { 
    //     data: [6,3,2,2,7,26,82,172,312,433],
    //     label: "North America",
    //     borderColor: "#c45850",
    //     fill: false
    //   }
    // ]
    // datasets : arbitrageData[0].map(d => {
    //     return {
    //         data:[],
    //         label: d.label,
    //         //other stuff?
    //     }
    // })
  },
  options: {
    title: {
      display: true,
      text: 'Free Money Cheat'
    }
  }
});

function updateChart(dataSlice) {
    // console.log(dataSlice);
    if (dataSlice.percent > 1.02) {
        if(chart.data.datasets.find(dataset => dataset.label === dataSlice.label)){
            const tracker = chart.data.datasets.find(dataset => dataset.label === dataSlice.label);
            // console.log(tracker);
            tracker.data.push(dataSlice.percent);
            // chart.data.labels.push('x');
        } else {
            chart.data.datasets.push({
                label: dataSlice.label,
                data: [dataSlice.percent]
            })
            // chart.data.labels.push('x');
        }
    }

    

    // for (let i=arbitrageData.length-dataPointCount;i<arbitrageData.length-1;i++) {
    //     arbitrageData[i].forEach(ticker => {
    //         const tracker = chart.data.datasets.find(dataset => dataset.label === ticker.label);
    //         tracker.data.push(ticker.percent);
    //     })
    // }
    chart.update();
}

var myHeaders = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

setInterval(()=> {
    fetch('http://localhost:3001/arbitrage',{
        method:'POST',
        headers: myHeaders,
        body:JSON.stringify({data: ['BTC']})
    })
    .then((data) => {
        return data.json()
    })
    .then((res) => {
        // console.log(res);
        res.forEach(coin => {
            coin.forEach(cycle => {
                updateChart(cycle);
            }) 
        })
        chart.data.labels.push('x');
        chart.data.labels.push('x');


    })
},2000);





    