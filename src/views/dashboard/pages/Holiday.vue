<template>
    <v-container id="regular-tables" tag="section" fluid>
        <v-progress-linear
            class="mb-1"
            indeterminate
            color="primary"
            v-if="wait">
        </v-progress-linear>
        <v-row>
            <v-col cols="12" md="8">
                <base-material-card
                    color="green"
                >
                    <template v-slot:heading>
                        <div class="display-1 font-weight-light">
                            Holiday Calendar
                        </div>
                    </template>
                    <v-card-title>
                        <div style="width: 100%; text-align: right">
                            <v-btn color="blue" fab @click="newCalendarClicked" :disabled="!roles.add">
                                New
                            </v-btn>
                        </div>
                    </v-card-title>
                    <v-data-table
                        :headers="headers"
                        :items="calendars"
                        :search="search"
                        :loading="loading"
                        loading-text="Loading... Please wait"
                        sort-by="id">
                        <template v-slot:top>
                            <v-container>
                                <v-row>
                                    <v-col>
                                        <v-text-field
                                            v-model="search"
                                            append-icon="mdi-magnify"
                                            label="Search"
                                            single-line
                                            hide-details
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </template>

                        <template v-slot:item.sunoff="{ item }">
                            <v-icon :color=getColor(item.sunoff)>
                                {{getIcon(item.sunoff)}} 
                            </v-icon>
                        </template>
                        <template v-slot:item.monoff="{ item }">
                            <v-icon :color=getColor(item.monoff)>
                                {{getIcon(item.monoff)}} 
                            </v-icon>
                        </template>
                        <template v-slot:item.tueoff="{ item }">
                            <v-icon :color=getColor(item.tueoff)>
                                {{getIcon(item.tueoff)}}  
                            </v-icon>
                        </template>
                        <template v-slot:item.wedoff="{ item }">
                            <v-icon :color=getColor(item.wedoff)>
                                {{getIcon(item.wedoff)}}  
                            </v-icon>
                        </template>
                        <template v-slot:item.thuoff="{ item }">
                            <v-icon :color=getColor(item.thuoff)>
                                {{getIcon(item.thuoff)}}  
                            </v-icon>
                        </template>
                        <template v-slot:item.frioff="{ item }">
                            <v-icon :color=getColor(item.frioff)>
                                {{getIcon(item.frioff)}}  
                            </v-icon>
                        </template>
                        <template v-slot:item.satoff="{ item }">
                            <v-icon :color=getColor(item.satoff)>
                                {{getIcon(item.satoff)}}  
                            </v-icon>
                        </template>

                        <template v-slot:item.edit="{ item }">
                            <v-btn small color="primary" title='Edit' text @click="editCalendar(item)" :disabled="!roles.edit">
                                EDIT
                            </v-btn>
                        </template>
                        <template v-slot:item.detail="{ item }">
                            <v-btn small color="pink" title='More Info' text @click="showDetail(item)">
                                MORE INFO
                            </v-btn>
                        </template>
                    </v-data-table>
                </base-material-card>
            </v-col>
            <v-col cols="12" md="4">
                <base-material-card
                icon="mdi-calendar"
                title="Holiday"
                color="purple"
                class="px-5 py-3"
                >
                    <v-card-title>
                        <v-row>
                            <v-col cols="px-0 py-0">
                                <!--
                                <v-text-field
                                    label="Year"
                                    append-icon="mdi-magnify"
                                    v-model="searchKey"
                                    @change="searchKeyChange()"
                                ></v-text-field>
                                -->
                                <v-select
                                    label="Year"
                                    append-icon="mdi-magnify"
                                    v-model="searchKey"
                                    :items="searchYears"
                                    @change="searchKeyChange()"
                                >
                                </v-select>
                            </v-col>
                            <v-col style="text-align:right">
                                <v-btn color="purple" @click="newDateClicked" :disabled=dateBtnValid fab>
                                    New
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-row>
                        <v-col>
                            <v-simple-table>
                                <template v-slot:default>
                                <thead>
                                    <tr>
                                        <th width="30%" class="text-left primary--text">
                                            Date
                                        </th>
                                        <th width="50%" class="text-left primary--text">
                                            Reason
                                        </th>
                                        <th width="20%" class="text-center primary--text">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, i) in dates" :key="i">
                                        <td class="px-1">{{ item.dt }}</td>
                                        <td class="px-1">{{ item.reason }}</td>
                                        <td class="px-1">
                                            <v-icon color="primary" class="mr-2" @click="editDate(item)"
                                                    title="Edit" style="cursor: pointer" :disabled="!roles.edit">
                                                mdi-pencil
                                            </v-icon>
                                            <v-icon color="warning" title="Remove" @click="deleteDate(item)" :disabled="!roles.edit">
                                                    style="cursor: pointer">
                                                mdi-delete
                                            </v-icon>
                                        </td>
                                    </tr>
                                </tbody>
                                </template>
                            </v-simple-table>
                        </v-col>
                    </v-row>
                </base-material-card>
            </v-col>
        </v-row>

        <!-- calendar dialog -->
        <v-dialog v-model="addCalendarDialog" max-width="800px">
            <v-card>
                <v-card-title>
                    <span class="headline">Add Calendar</span><br>
                    <span style="font-size:14px">Weekly off</span>
                </v-card-title>

                <v-card-text>
                    <v-form ref="form" v-model="valid" lazy-validation>
                        <v-row>
                            <v-col>
                                <v-text-field
                                    :rules="nameRules"
                                    label="Name"
                                    v-model="calendarName"
                                    required
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-checkbox
                                    v-model="sunday"
                                    label="Sunday"
                                ></v-checkbox>
                            </v-col>
                            <v-col>
                                <v-checkbox
                                    v-model="monday"
                                    label="Monday"
                                ></v-checkbox>
                            </v-col>
                            <v-col>
                                <v-checkbox
                                    v-model="tuesday"
                                    label="Tuesday"
                                ></v-checkbox>
                            </v-col>
                            <v-col>
                                <v-checkbox
                                    v-model="wednesday"
                                    label="Wednesday"
                                ></v-checkbox>
                            </v-col>
                            <v-col>
                                <v-checkbox
                                    v-model="thursday"
                                    label="Thursday"
                                ></v-checkbox>
                            </v-col>
                            <v-col>
                                <v-checkbox
                                    v-model="friday"
                                    label="Friday"
                                ></v-checkbox>
                            </v-col>
                            <v-col>
                                <v-checkbox
                                    v-model="saturday"
                                    label="Saturday"
                                ></v-checkbox>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeCalendar"> Cancel </v-btn>
                    <v-btn :disabled="!valid" color="blue darken-1" text @click="saveCalendar"> Save </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- date dialog -->
        <v-dialog v-model="addDateDialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ dateFormTitle }}</span><br>
                    <span class="title">{{ dateTitle }}</span>
                </v-card-title>
                <v-card-text>
                    <v-form ref="form1" lazy-validation>
                        <v-row>
                            <v-col>
                                <DatePicker
                                    textName="Date"
                                    :date="selectedDate"
                                    :submit="(date) => {selectedDate = date}"
                                ></DatePicker>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-textarea
                                :rules="nameRules"
                                label="Reason"
                                v-model="reason"
                                rows="3"
                                ></v-textarea>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDate"> Cancel </v-btn>
                    <v-btn color="blue darken-1" text @click="saveDate"> Save </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- delete dialog -->
        <v-dialog v-model="deleteDialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">Are you sure?</span>
                </v-card-title><br>
                <v-card-actions><br>
                    <div style="width:100%; text-align:center;">
                        <v-btn color="blue darken-1"  @click="deleteDateNo"> No </v-btn>
                        <v-btn color="blue darken-1" text @click="deleteDateYes"> Yes </v-btn>
                    </div>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <base-material-snackbar
            v-model="snack"
            :type="snackColor"
            v-bind="{
                bottom: true,
                center: true,
                color: snackColor
            }"
            >
            {{ snackText }}
        </base-material-snackbar>
    </v-container>
</template>

<script>
    import DatePicker from './DatePicker'
    import api from "@/apis/calendar.js";
    import auth_api from "@/apis/auth.js";

    export default {
        components: {
            DatePicker,
        },

        data: () => ({
            headers: [
                { text: "Name", align: "start", value: "name", class:'primary--text'},
                { text: "Sun", align: "start", value: "sunoff", class:'primary--text', sortable: false },
                { text: "Mon", align: "start", value: "monoff", class:'primary--text', sortable: false },
                { text: "Tue", align: "start", value: "tueoff", class:'primary--text', sortable: false },
                { text: "Wed", align: "start", value: "wedoff", class:'primary--text', sortable: false },
                { text: "Thu", align: "start", value: "thuoff", class:'primary--text', sortable: false },
                { text: "Fri", align: "start", value: "frioff", class:'primary--text', sortable: false },
                { text: "Sat", align: "start", value: "satoff", class:'primary--text', sortable: false },
                { text: "", align: "center", value: "edit", class:'primary--text' },
                { text: "", align: "center", value: "detail"},
            ],
            wait:false,
            calendars:[],
            search: null,
            loading: false,
            addCalendarDialog: false,
            valid: false,
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false,
            calendarName: null,
            snack: false,
            snackColor: "success",
            snackText: "",
            selectedCalendar: null,

            addDateDialog: false,
            selectedDate: null,
            reason: null,
            dates: [],
            allDates: [],
            calId: null,
            selectedDateItem: null,
            deleteDialog: false,
            searchKey: "",
            searchYears: [],

            dItem: null,            
            dateTitle: "Add Date",
            roles: {}
        }),

        created: async function() {
            this.loading = true
            this.calendars = await api.findAllCalendar()
            console.log("calendar", this.calendars)
            this.roles = auth_api.getRole()
            this.loading = false
        },

        computed: {
            nameRules() {
                return [
                    (v) => !!v || "This field is required",
                    (v) => (v && v.trim().length > 0) || "This field is required",
                ];
            },
            dateBtnValid() {
                if (this.roles && this.roles.add)
                    return this.calId == null
                return true
            },

            dateFormTitle() {
                if (this.dItem)
                    return this.dItem.name
                return ''
            }
        },

        methods: {
            async showDetail(item) {
                this.wait = true
                this.dItem = item
                this.calId = item.id
                this.allDates = await api.getHolidayList(this.calId)
                this.dates = this.allDates

                this.getYears()
                this.searchKey = ""

                this.wait = false
            },

            getYears() {
                let tempYears = []
                this.allDates.forEach( e => {
                    tempYears.push(e.dt.substring(0, 4))
                })
                this.searchYears = ["", ...new Set(tempYears)]
            },

            newCalendarClicked() {
                if (this.$refs.form) this.$refs.form.resetValidation()
                this.monday = this.tuesday = this.wednesday = this.thursday = this.friday = this.saturday = this.sunday = false
                this.calendarName = ""
                this.selectedCalendar = null
                this.addCalendarDialog = true
            },

            getIcon(item) {
                if (item == 1) return "mdi-sticker-remove-outline"
                if (item == 0) return "mdi-sticker-check-outline"
            },

            getColor(item) {
                if (item == 1) return "pink"
                if (item == 0) return "primary"
            },

            closeCalendar() {
                this.addCalendarDialog = false
            },

            async saveCalendar() {
                if (!this.$refs.form.validate()) return
                this.wait = true
                let day = {
                    monday: this.monday,
                    tuesday: this.tuesday,
                    wednesday: this.wednesday,
                    thursday: this.thursday,
                    friday: this.friday,
                    saturday: this.saturday,
                    sunday: this.sunday
                }
                this.closeCalendar()
                let status
                if (!this.selectedCalendar) {
                    status = await api.addCalendar(this.calendarName, day)
                } else {
                    status = await api.editCalendar(this.selectedCalendar.id, this.calendarName, day)
                }
                status && (this.calendars = await api.findAllCalendar())
                this.show_snack(status)
                this.wait = false
            },
            
            editCalendar(item) {
                if (this.$refs.form) this.$refs.form.resetValidation()
                this.monday = item.monoff
                this.tuesday = item.tueoff
                this.wednesday = item.wedoff
                this.thursday = item.thuoff
                this.friday = item.frioff
                this.saturday = item.satoff
                this.sunday = item.sunoff
                this.calendarName = item.name
                this.selectedCalendar = item
                this.addCalendarDialog = true
            },

            show_snack(success, type = 1) {
                this.snack = true;
                if (success) {
                    this.snackColor = "success"
                    this.snackText = (type == 1 ? "Data saved" : "Deleted")
                }
                else {
                    this.snackColor = "error"
                    this.snackText = "Error"
                }
            },

            newDateClicked() {
                if (this.$refs.form1) this.$refs.form1.resetValidation()
                this.selectedDate = null
                this.reason = null
                this.selectedDateItem = null
                this.dateTitle = "Add Date"
                this.addDateDialog = true
            },

            async saveDate() {
                if (!this.$refs.form1.validate()) return
                this.wait = true
                this.closeDate()
                let status
                if (this.selectedDateItem != null)
                    status = await api.updateHoliday(this.selectedDateItem.holidayid, this.reason)
                else 
                    status = await api.addHoliday(this.selectedDate, this.reason, this.calId)

                if (status) {
                    this.allDates = await api.getHolidayList(this.calId)
                    this.getYears()

                    this.filter()
                }
                this.show_snack(status)
                this.wait = false
            },

            closeDate() {
                this.addDateDialog = false
            },

            deleteDate(item) {
                this.deleteDialog = true
                this.selectedDateItem = item
            },

            editDate(item) {
                this.selectedDateItem = item
                this.selectedDate = item.dt
                this.reason = item.reason
                this.dateTitle = "Edit Date"
                this.addDateDialog = true
            },

            async deleteDateYes() {
                this.wait = true
                this.deleteDateNo()
                let status = await api.removeHoliday(this.selectedDateItem.holidayid)
                if (status) {
                    this.allDates = await api.getHolidayList(this.calId)
                    this.getYears()
                    this.filter()
                }
                this.show_snack(status, 2)
                this.selectedDateItem = null
                this.wait = false
            },

            deleteDateNo() {
                this.deleteDialog = false
            },

            searchKeyChange() {
                this.filter()
            },

            filter() {
                if (this.allDates && this.allDates.length > 0) {
                    if (this.searchKey)
                        this.dates = this.allDates.filter(e=> e.dt.substring(0, 4) == this.searchKey)
                    else
                        this.dates = this.allDates
                }
            }
        }
    }
</script>