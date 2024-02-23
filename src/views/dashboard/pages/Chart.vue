<template>
    <apexchart v-if="isData" type="bar" height="80" width="120" :options="chartOptions" :series="pieSeries"></apexchart>
    <!-- <apexchart type="pie" align="center" width="90" :options="pieOptions" :series="pieSeries"></apexchart> -->
</template>

<script>

export default {
    name: "Chart",
    props: ["data"],

    data: () => ({            
        pieOptions: {
            chart: {
                type: 'pie',
            },
            labels: ['Total', 'Elapsed', 'Updated'],
            dataLabels: {
                enabled: false
            },
            legend: {
                show: false
            },
            // colors:['rgb(0, 227, 150)', 'rgb(0, 143, 251)']
        },

        chartOptions: {            
            colors: ['#33b2df', '#90ee7e', '#f48024'],
            chart: {
                type: 'bar',
                toolbar: {
                    show: false
                },
            },
            plotOptions: {
              bar: {
                barHeight: '100%',
                distributed: true,
                horizontal: true,
                dataLabels: {
                  position: 'bottom'
                },
              }
            },
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: ['Allotted', 'Elapsed', 'Effort'],
                labels: {
                    show: false
                }
            },
            yaxis: {
                labels: {
                    show: false
                }
            },
            legend: {
                show: false
            },
            tooltip: {
              theme: 'dark',
              y: {
                title: {
                  formatter: function () {
                    return ''
                  }
                }
              }
            }
        }
    }),

    computed: {
        pieSeries() {
            if (this.data.estimatedTimeInMinutes && this.data.total_minutes_to_be_spent && this.data.TotMinsUpToday) {
                let total = parseInt(this.data.estimatedTimeInMinutes / 60)
                let spent = parseInt(this.data.total_minutes_to_be_spent / 60)
                let effort = parseInt(this.data.TotMinsUpToday / 60)
                if (effort > total) {
                    this.chartOptions.colors = ['#33b2df', '#90ee7e', '#d4526e']
                }
                return [{data: [total, spent, effort]}]
            }
            return [{data: [0, 0, 0]}]
        },

        isData() {
            if (this.data.estimatedTimeInMinutes && this.data.total_minutes_to_be_spent && this.data.TotMinsUpToday) {
                return true
            }
            return false
        }
    },

    created() {
      
    },

    methods: {
        
    }
}
</script>