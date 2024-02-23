<template>
    <v-container id="regular-tables" tag="section" fluid>
        <v-row>
            <v-col>
                <base-material-card
                color="green"
                >
                <template v-slot:heading>
                    <div class="display-1 font-weight-light">
                        Manpower Utilization
                    </div>
                </template>
                    <v-container>
                        <v-row>
                            <v-col cols="12" md="2">
                                <v-select
                                    label="Year"
                                    :items="years"
                                    v-model="year"
                                    @change="changeYear"
                                    :disabled="loading"
                                >
                                </v-select>
                            </v-col>
                            <v-col cols="12" md="2">
                                <v-select
                                    label="Quater"
                                    :items="[1, 2, 3, 4]"
                                    v-model="quarter"
                                >
                                </v-select>
                            </v-col>
                            <v-col class="text-center" cols="12" md="8">
                                <v-btn small :color="getColor(e)" fab v-for="(e, i) in getMonths" :key="i" @click="selectMonth(e)" class="mt-2">
                                    {{ getMonthName(e) }}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>

                    <v-card-title>
                        <v-text-field
                            v-model="search"
                            append-icon="mdi-magnify"
                            label="Search"
                            single-line
                            hide-details
                        ></v-text-field>
                        <v-spacer></v-spacer>
                        <span class="body-1 pt-3 purple--text font-weight-bold mr-5">
                            Total Calendar Days : {{getCalendarDays}}
                        </span>
                        <span class="body-2 pt-3 text--disabled">
                            {{ this.fromDate && ('(' + this.fromDate + ' ~ ' + this.toDate + ')') }}
                        </span>
                        <v-spacer></v-spacer>
                    </v-card-title>
                    <v-data-table
                        :headers="headers"
                        :items="persons"
                        :search="search"
                        :loading="loading"
                        loading-text="Loading... Please wait"
                        sort-by="id">
                        <template v-slot:item.detail="{ item }">
                            <v-btn small color="pink" text title='Detail' @click="showDetail(item)">
                                Detail
                            </v-btn>
                        </template>                                        
                        <template :style="getOccStyle(item)" v-slot:item.occ="{ item }">
                            {{ item.effortTimedDays }}
                        </template>                                        
                        <template v-slot:item.unp="{ item }">
                            <span :style="getUnpStyle(item)">{{ item.unPlannedDays }}</span>
                        </template>
                    </v-data-table>
                </base-material-card>
            </v-col>
        </v-row>

        <v-bottom-sheet v-model="sheet" inset max-width="700px">
            <v-sheet
                class="text-center"
            >
                <v-card :loading="sheetLoading">
                    <v-card-title>
                        <p class="purple--text font-weight-bold" style="font-size:20px">
                            {{ getBottomTitle }}
                        </p>
                    </v-card-title>
                    <v-card-text style="height: 500px; overflow: auto">
                        <v-container>
                            <v-data-table
                                :headers="bottomHeaders"
                                :items="detailData"
                                dense
                                style="max-width: 600px !important; margin: 0 auto"
                                >                                    
                                <template v-slot:item.activity="{ item }">
                                    <span :style="setBottomTdStyle(item.activity)" @click="clickActivity(item)">{{item.activity}}</span>
                                </template>             
                                <template v-slot:item.effort="{ item }">
                                    <span :style="setBottomTdStyle(item.effort)" @click="clickEffort(item)">{{item.effort}}</span>
                                </template>             
                                <template v-slot:item.leave="{ item }">
                                    <span :style="setBottomTdStyle(item.leave)" @click="clickLeave(item)">{{item.leave}}</span>
                                </template>
                            </v-data-table>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue" elevation="10" class="mb-1 mr-5" small @click="sheet = false">
                            Cancel
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-sheet>
        </v-bottom-sheet>

        <v-dialog
        v-model="activityDialog"
        max-width="700px"
        >
            <v-card>
                <v-card-title>
                    Activity Plans
                </v-card-title>
                <v-card-text>
                    <v-simple-table>
                        <template v-slot:default>
                            <thead>
                                <tr>
                                    <th class="text-left">
                                        Task
                                    </th>
                                    <th class="text-left">
                                        Description
                                    </th>
                                    <th class="text-left">
                                        Unit
                                    </th>
                                    <th class="text-left">
                                        Qty
                                    </th>
                                    <th class="text-left">
                                        Role
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                v-for="(item, i) in selectedActivity"
                                :key="i"
                                >
                                <td>{{ item.taskName }}</td>
                                <td>{{ item.taskDesc }}</td>
                                <td>{{ item.unitOfMeasure }}</td>
                                <td>{{ item.qty }}</td>
                                <td>{{ item.rolename }}</td>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog
        v-model="leaveDialog"
        max-width="700px"
        >
            <v-card>
                <v-card-title>
                    Leave
                </v-card-title>
                <v-card-text>
                    <v-simple-table>
                        <template v-slot:default>
                            <thead>
                                <tr>
                                    <th class="text-center">
                                        Type
                                    </th>
                                    <th class="text-center">
                                        Reason
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                v-for="(item, i) in selectedLeave"
                                :key="i"
                                >
                                <td class="text-center">{{ getLeaveName(item.leaveType) }}</td>
                                <td class="text-center">{{ item.leaveReason }}</td>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog
        v-model="effortDialog"
        max-width="700px"
        >
            <v-card>
                <v-card-title>
                    Effort
                </v-card-title>
                <v-card-text>
                    <v-simple-table>
                        <template v-slot:default>
                            <thead>
                                <tr>
                                    <th class="text-left">
                                        Task
                                    </th>
                                    <th class="text-left">
                                        Hrs
                                    </th>
                                    <th class="text-left">
                                        Mins
                                    </th>
                                    <th class="text-left">
                                        %
                                    </th>
                                    <th class="text-left">
                                        Role
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                v-for="(item, i) in selectedEffort"
                                :key="i"
                                >
                                <td>{{ item.task }}</td>
                                <td>{{ item.hrs }}</td>
                                <td>{{ item.mins }}</td>
                                <td>{{ item.pct }}</td>
                                <td>{{ item.role }}</td>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog v-model="detailModal" max-width="800px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ getDetailTitle() }}</span><br>
                    <span style="font-size:14px">{{ this.fromDate + ' ~ ' + this.toDate }}</span>
                </v-card-title>
                <v-card-text>
                    <v-data-table
                        :headers="modalHeaders"
                        :items="selectedData"
                        dense>
                    </v-data-table>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDetailDialog"> Cancel </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
    import DatePicker from './DatePicker'
    import people_api from "@/apis/people.js";

    export default {
        components: {
            DatePicker,
        },

        data: () => ({
            loading: false,
            headers: [
                { text: "Name", align: "start", value: "name", class: "primary--text"},
                { text: "Designation", align: "start", value: "designationName", class: "primary--text"},
                { text: "Working days", align: "start", value: "workingDays", class: "primary--text" },
                { text: "Leave", align: "start", value: "leaveDays", class: "primary--text"},
                { text: "Occupied days", align: "start", value: "occ", class: "primary--text"},
                { text: "Un planned days", align: "start", value: "unp", class: "primary--text"},
                { text: "", align: "center", value: "detail"}
            ],
            modalHeaders: [
                { text: "Date", align: "start", value: "dt", class: "primary--text" },
                { text: "Status", align: "start", value: "dayType", class: "primary--text" },
                { text: "Worked Hour", align: "start", value: "hrsWorked", class: "primary--text" },
                { text: "Wokred Min", align: "start", value: "minsWorked", class: "primary--text" },
            ],
            bottomHeaders: [
                { text: "Date", align: "center", value: "date", class: "primary--text" },
                { text: "Activity Plans", align: "center", value: "activity", class: "primary--text" },
                { text: "Efforts", align: "center", value: "effort", class: "primary--text" },
                { text: "Leave", align: "center", value: "leave", class: "primary--text" },
            ],
            persons: [],
            detailData: [],
            fromDate: '',
            toDate: '',
            search: '',

            detailModal: false,
            selectedData: [],
            selectedItem: [],

            quarter: null,
            selectedMonth: null,

            yearData: [],
            monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

            sheet: false,
            sheetLoading: false,

            activityDialog: false,
            selectedActivity: [],

            effortDialog: false,
            selectedEffort: [],

            leaveDialog: false,
            selectedLeave: [],

            years: [],
            year: null
        }),

        created: async function() {
            this.year = this.getCurrentYear()
            this.setYears()
        },

        computed: {
            getMonths() {
                if (this.quarter)
                    return[(this.quarter - 1) * 3 + 1, (this.quarter - 1) * 3 + 2, (this.quarter - 1) * 3 + 3]
                return []
            },

            getCalendarDays() {
                if (this.persons && this.persons.length > 0)
                    return  this.persons[0].calendarDays
                return 0
            },

            getBottomTitle() {
                if (this.selectedItem)
                    return this.selectedItem.firstname + ' ' + this.selectedItem.lastname
                return ''
            }
        },

        methods: {
            setDate(month) {        
                let FirstDay = new Date(this.year, month, 1);
                let LastDay = new Date(this.year, month + 1, 0);
                this.fromDate = people_api.dateToString(FirstDay)
                this.toDate = people_api.dateToString(LastDay)
            },

            async selectMonth(month) {
                if (this.loading) return
                this.loading = true
                this.selectedMonth = month
                this.persons = []
                this.setDate(month - 1)
                console.log('date', this.fromDate, this.toDate)
                if (!this.yearData[month]) {
                    let result = await people_api.getManPower(this.fromDate, this.toDate)
                    result.forEach(e => {
                        e.name = e.firstname + ' ' + e.lastname
                    })
                    this.yearData[month] = result
                }
                this.persons = this.yearData[month]
                this.loading = false
            },

            showDetail(item) {
                this.selectedItem = item
                console.log(item)
                this.setDetailData(item)
                this.sheet = !this.sheet
                // this.selectedData = item.datewiseDetail
                // this.detailModal = true
            },

            setDetailData(item) {
                let result = []
                let date = []
                item.effortTimeSheet && item.effortTimeSheet.length > 0 && item.effortTimeSheet.forEach(e => {
                    date.push(e.toDay)
                })
                date.sort()
                date.length > 0 && date.forEach( e => {
                    const activity = item.assignedWork.find(v => e == v.toDay)
                    const effort = item.effortTimeSheet.find(v => e == v.toDay)
                    const leave = item.leave_details.find(v => e == v.toDay)
                    let temp = {
                        "date": e,
                        "activity": this.getItemLength(activity.assignedWork),
                        "activityData": activity,
                        "effort":   this.getItemLength(effort.L1_allLines) + 
                                    this.getItemLength(effort.L2_allLines) + 
                                    this.getItemLength(effort.L3_allLines) + 
                                    this.getItemLength(effort.L4_allLines),
                        "effortData": effort,
                        "leave": this.getItemLength(leave.leave_deails),
                        "leaveData": leave
                    }
                    result.push(temp)
                })
                this.detailData = result
            },

            getItemLength(item) {
                if (item && item.length > 0)
                    return item.length
                return 0
            },

            getDetailTitle() {
                if (this.selectedItem) {
                    return this.selectedItem.name
                }
                return ''
            },
            
            closeDetailDialog() {
                this.detailModal = false
            },

            getColor(month) {
                if (this.selectedMonth == month) {
                    return 'purple'
                }
                return 'white'
            },

            getMonthName(month) {
                return this.monthNames[month - 1]
            },

            getUnpStyle(item) {
                if (item.unPlannedDays <= item.calendarDays / 4)
                    return 'color: red'
                return ''
            },
            
            getOccStyle(item) {
                if (item.effortTimedDays >= item.calendarDays * 0.75)
                    return 'color: red'
                return ''
            },

            setBottomTdStyle(item) {
                if (item > 0)
                    return 'text-decoration: underline; cursor: pointer'
                return ''
            },

            clickActivity(item) {
                if (!item.activity) return
                console.log('activity', item)
                this.selectedActivity = item.activityData.assignedWork
                this.activityDialog = true
            },

            clickEffort(item) {
                if (!item.activity) return
                console.log('effort', item)
                this.selectedEffort = []
                const data = item.effortData
                data.L1_allLines && data.L1_allLines.length > 0 && data.L1_allLines.forEach( e => {
                    this.selectedEffort.push({
                        "task": e.taskname,
                        "role": e.rolename,
                        "hrs": parseInt(e.L1AdditionalTotMinsToday / 60),
                        "mins": e.L1AdditionalTotMinsToday % 60,
                        "pct": e.L1TotPctMarkToday
                    })
                })
                data.L2_allLines && data.L2_allLines.length > 0 && data.L2_allLines.forEach( e => {
                    this.selectedEffort.push({
                        "task": e.taskname,
                        "role": e.rolename,
                        "hrs": parseInt(e.L2AdditionalTotMinsToday / 60),
                        "mins": e.L2AdditionalTotMinsToday % 60,
                        "pct": e.L2TotPctMarkToday
                    })
                })
                data.L3_allLines && data.L3_allLines.length > 0 && data.L3_allLines.forEach( e => {
                    this.selectedEffort.push({
                        "task": e.taskname,
                        "role": e.rolename,
                        "hrs": parseInt(e.L3AdditionalTotMinsToday / 60),
                        "mins": e.L3AdditionalTotMinsToday % 60,
                        "pct": e.L3TotPctMarkToday
                    })
                })
                data.L4_allLines && data.L4_allLines.length > 0 && data.L4_allLines.forEach( e => {
                    this.selectedEffort.push({
                        "task": e.taskname,
                        "role": e.rolename,
                        "hrs": parseInt(e.L4AdditionalTotMinsToday / 60),
                        "mins": e.L4AdditionalTotMinsToday % 60,
                        "pct": e.L4TotPctMarkToday
                    })
                })
                this.effortDialog = true
            },

            clickLeave(item) {
                if (!item.leave) return
                console.log('leave', item)
                this.selectedLeave = item.leaveData.leave_deails
                this.leaveDialog = true
            },

            getLeaveName(type) {
                if (type == 'EL') return "Earned Leave"
                if (type == 'ML') return "Medical Leave"
                if (type == 'CL') return "Casual Leave"
                return ''
            },

            getCurrentYear() {
                const now = new Date()
                const year = now.getYear()
                return year + 1900
            },

            setYears() {
                const year = this.getCurrentYear()
                for (let i = -3; i <= 0; i++)
                    this.years.push(year + i)
            },

            changeYear() {
                this.yearData = []
                this.selectedMonth = null
                this.quarter = null
                this.persons = []
            }
        }
    }
</script>