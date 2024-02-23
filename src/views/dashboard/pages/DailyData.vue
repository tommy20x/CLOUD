<template>
    <base-material-card
        icon="mdi-note-search-outline"
        color="pink"
        title="Existing Data"
    >
        <v-progress-linear
            indeterminate
            class="mb-1"
            color="pink"
            v-if="loading">
        </v-progress-linear>
        <v-card-text>
            <v-row>
                <v-col></v-col>
                <v-col>
                    <DatePicker
                        textName="Date"
                        :date="selectedDay"
                        :submit="(date) => {selectedDay = date; dateChanged()} "
                    ></DatePicker>
                </v-col>
                <v-col></v-col>
            </v-row>
            <v-row>
                <v-col>
                    <v-data-table
                        :headers="headers"
                        :items="data">
                    </v-data-table>
                </v-col>
            </v-row>
        </v-card-text>
    </base-material-card>
</template>

<script>
import DatePicker from './DatePicker'
import daily_api from "@/apis/daily.js"

export default {
    name: "DailyDate",
    props: ["item", "hrId", "supervisors", "performers"],
    components: {
        DatePicker,
    },

    data: () => ({
        selectedDay: null,
        loading: false,
        data: [],
        headers: [
            { text: "Supervisor", align: "start", value: "supervisor" },
            { text: "Performer", align: "start", value: "performer" },
            { text: "Hr", align: "start", value: "hr" },
            { text: "Min", align: "start", value: "min" },
            { text: "Today", align: "start", value: "pct"},
            { text: "Total", align: "start", value: "total"},
        ]
    }),

    created() {
        this.selectedDay = daily_api.getToday()
        this.getData()
    },

    methods: {
        itemChanged() {
            this.getData()
        },

        dateChanged() {
            this.getData()
        },

        async getData() {
            this.loading = true
            this.data = []
            let temp = [], filter = []
            if (this.item.level == 1) {
                temp = await daily_api.getUpdate1(this.hrId, this.selectedDay)
                temp && temp.length > 0 && (filter = temp.filter(e => e.estimate_MP_taskL1id == this.item.est_MP_TL1_id))
                for(let i in filter) {
                    const e = filter[i]
                    const supervisor = this.supervisors.find(s => s.id == e.workSupervisor_hrid)
                    const performer = this.performers.find(p => p.id == e.workPerformedBy_hrid)
                    this.data.push({
                        "hr": e.L1AdditionalTotHrsToday,
                        "min": e.L1AdditionalTotMinsToday,
                        "pct": e.L1AdditionalPctToday ? e.L1AdditionalPctToday * 1 : 0,
                        "total": e.L1TotPctMarkToday ? e.L1TotPctMarkToday * 1 : null,
                        "supervisor": supervisor.firstname + ' ' + supervisor.lastname,
                        "performer": performer.firstname + ' ' + performer.lastname
                    })
                }
            } else if (this.item.level == 2) {
                temp = await daily_api.getUpdate2(this.hrId, this.selectedDay)
                temp && temp.length > 0 && (filter = temp.filter(e => e.estimate_MP_taskL2id == this.item.est_MP_TL2_id))
                for(let i in filter) {
                    const e = filter[i]
                    const supervisor = this.supervisors.find(s => s.id == e.workSupervisor_hrid)
                    const performer = this.performers.find(p => p.id == e.workPerformedBy_hrid)
                    this.data.push({
                        "hr": e.L2AdditionalTotHrsToday,
                        "min": e.L2AdditionalTotMinsToday,
                        "pct": e.L2AdditionalPctToday ? e.L2AdditionalPctToday * 1 : 0,
                        "total": e.L2TotPctMarkToday ? e.L2TotPctMarkToday * 1 : null,
                        "supervisor": supervisor.firstname + ' ' + supervisor.lastname,
                        "performer": performer.firstname + ' ' + performer.lastname
                    })
                }
            } else if (this.item.level == 3) {
                temp = await daily_api.getUpdate3(this.hrId, this.selectedDay)
                temp && temp.length > 0 && (filter = temp.filter(e => e.estimate_MP_taskL3id == this.item.est_MP_TL3_id))
                for(let i in filter) {
                    const e = filter[i]
                    const supervisor = this.supervisors.find(s => s.id == e.workSupervisor_hrid)
                    const performer = this.performers.find(p => p.id == e.workPerformedBy_hrid)
                    this.data.push({
                        "hr": e.L3AdditionalTotHrsToday,
                        "min": e.L3AdditionalTotMinsToday,
                        "pct": e.L3AdditionalPctToday ? e.L3AdditionalPctToday * 1 : 0,
                        "total": e.L3TotPctMarkToday ? e.L3TotPctMarkToday * 1 : null, 
                        "supervisor": supervisor.firstname + ' ' + supervisor.lastname,
                        "performer": performer.firstname + ' ' + performer.lastname
                    })
                }
            } else if (this.item.level == 4) {
                temp = await daily_api.getUpdate4(this.hrId, this.selectedDay)
                temp && temp.length > 0 && (filter = temp.filter(e => e.estimate_MP_taskL4id == this.item.est_MP_TL4_id))
                for(let i in filter) {
                    const e = filter[i]
                    const supervisor = this.supervisors.find(s => s.id == e.workSupervisor_hrid)
                    const performer = this.performers.find(p => p.id == e.workPerformedBy_hrid)
                    this.data.push({
                        "hr": e.L4AdditionalTotHrsToday,
                        "min": e.L4AdditionalTotMinsToday,
                        "pct": e.L4AdditionalPctToday ? e.L4AdditionalPctToday * 1 : 0,
                        "total": e.L4TotPctMarkToday ? e.L4TotPctMarkToday * 1 : null,
                        "supervisor": supervisor.firstname + ' ' + supervisor.lastname,
                        "performer": performer.firstname + ' ' + performer.lastname
                    })
                }
            }
            console.log("item", this.item)
            console.log("filter", filter)
            console.log("get data", this.data)

            this.loading = false
        }
    }
}
</script>