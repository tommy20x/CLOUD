<template>
    <base-material-card
        icon="mdi-notebook-edit"
        title="Estimation"
        color="purple"
    >
        <v-progress-linear
            class="mb-1"
            indeterminate
            color="purple"
            v-if="loading">
        </v-progress-linear>
        <template v-if="task">
            <v-row>
                <v-col>
                    <v-tabs
                    v-model="tabs"
                    fixed-tabs
                    color="purple"
                    >
                        <v-tabs-slider></v-tabs-slider>
                        <v-tab
                            href="#tab1"
                        >
                            <v-icon>mdi-account-edit</v-icon>
                            Human Resource
                        </v-tab>

                        <v-tab
                            href="#tab2"
                        >
                            <v-icon>mdi-briefcase-edit</v-icon>
                            Materials
                        </v-tab>
                    </v-tabs>
                    <v-tabs-items v-model="tabs">
                        <v-tab-item
                            :value="`tab1`"
                        >
                            <v-card flat>
                                <v-card-text style="min-height: 400px">
                                    <div class="text-right">
                                        <v-btn small color="blue" @click="saveRoleData" elevation="8" :disabled="saveBtnStatus">
                                            Save
                                        </v-btn>
                                    </div>
                                    <v-data-table
                                    :headers="headers"
                                    :items="roleData"
                                    hide-default-footer
                                    >
                                        <template v-slot:item.estimatedTimeInMinutes="props">
                                            <v-edit-dialog
                                            :return-value.sync="props.item.estimatedTimeInMinutes"
                                            large
                                            @save="saveHr(props)"
                                            >
                                            <span style="text-decoration: underline;">{{ props.item.estimatedTimeInMinutes ? props.item.estimatedTimeInMinutes : 0}}</span>
                                            <template v-slot:input>
                                                <v-text-field
                                                v-model="props.item.estimatedTimeInMinutes"
                                                label="Hrs"
                                                single-line
                                                counter
                                                type="number"
                                                ></v-text-field>
                                            </template>
                                            </v-edit-dialog>
                                        </template>
                                            
                                        <template v-slot:item.estimatedStartDate="props">
                                            <v-edit-dialog
                                            :return-value.sync="props.item.estimatedStartDate"
                                            large
                                            @save="saveStartDate(props)"
                                            >
                                            <span style="text-decoration: underline;">{{ props.item.estimatedStartDate }}</span>
                                            <template v-slot:input>
                                                <DatePicker
                                                    label="start"
                                                    :date="props.item.estimatedStartDate"
                                                    :submit="(date) => props.item.estimatedStartDate = date"
                                                    :startDate="phase.phase_opendate"
                                                    :endDate="props.item.estimatedEndDate"
                                                ></DatePicker>
                                            </template>
                                            </v-edit-dialog>
                                        </template>
   
                                        <template v-slot:item.estimatedEndDate="props">
                                            <v-edit-dialog
                                            :return-value.sync="props.item.estimatedEndDate"
                                            large
                                            @save="saveEndDate(props)"
                                            >
                                            <span style="text-decoration: underline;">{{ props.item.estimatedEndDate }}</span>
                                            <template v-slot:input>
                                                <DatePicker
                                                    label="start"
                                                    :date="props.item.estimatedEndDate"
                                                    :submit="(date) => props.item.estimatedEndDate = date"
                                                    :startDate="props.item.estimatedStartDate"
                                                    :endDate="phase.phase_closedate"
                                                ></DatePicker>
                                            </template>
                                            </v-edit-dialog>
                                        </template>

                                        <template v-slot:item.staff="{ item }">
                                            <v-icon small class="mr-2" title="staff" color="purple" @click="editStaff(item)">
                                                mdi-account-multiple
                                            </v-icon>
                                        </template>
                                        
                                        <template v-slot:item.detail="{ item }">
                                            <v-icon small title="detail" color="purple" @click="showDetail(item)">
                                                mdi-details
                                            </v-icon>
                                        </template>
                                    </v-data-table>
                                    
                                    <br><br><br><hr>
                                    <p class="purple--text">Resource Allocation</p>
                                    <v-data-table
                                    :headers="resourceHeader"
                                    :items="resource"
                                    :loading="resourceLoading"
                                    >
                                        <template v-slot:item.staff="{ item }">
                                            <template v-for="(v, i) in item.names">
                                                <v-icon small class="mr-1" :title="v" color="purple" :key="i">
                                                    mdi-account
                                                </v-icon>
                                            </template>
                                        </template>
                                    </v-data-table>
                                </v-card-text>
                            </v-card>
                        </v-tab-item>
                        <v-tab-item
                            :value="`tab2`"
                        >
                            <v-card flat>
                                <v-card-text style="min-height: 400px">
                                    Materials
                                </v-card-text>
                            </v-card>
                        </v-tab-item>
                    </v-tabs-items>

                </v-col>
            </v-row>
        </template>
        <template v-else>
            <br>
            <p class="text-center purple--text display-2">No Task selected</p>
        </template>

        <v-dialog v-model="staffDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Available Staffs</span><br>
                    <span class="text--disabled title">{{ taskDate }}</span>
                </v-card-title>
                <v-card-text>
                    <template v-if="selectedItem && selectedItem.staffs">
                        <v-list>
                            <v-list-item-group multiple v-model="selectedStaff">
                                <v-list-item v-for="(item, i) in selectedItem.staffs" :key="i" 
                                            :value="item.hrid"
                                            active-class="text--accent-4">
                                    <template v-slot:default="{ active }">
                                        <v-list-item-icon>
                                            <v-icon :color="getStaffColor(item)">mdi-account</v-icon>
                                        </v-list-item-icon>
                                        <v-list-item-content>
                                            <v-list-item-title>
                                                {{ item.firstname + ' ' + item.lastname }}
                                            </v-list-item-title>
                                            <v-list-item-subtitle class="pl-5">
                                                <template v-if="item.leave && item.leave.length > 0">
                                                    <span v-for="(e, i) in item.leave" :key="`l` + i"> {{ e.leaveDateFrom + ' ~ ' + e.leaveDateTo + ' '}} (leave)<br></span>
                                                </template>
                                                <template v-if="item.task1 && item.task1.length > 0">
                                                    <span v-for="(e, i) in item.task1" :key="`t1` + i">{{  e.estimatedStartDate + ' ~ ' + e.estimatedEndDate + ' (' + e.TaskL1name + ')' }}<br></span>
                                                </template>
                                                <template v-if="item.task2 && item.task2.length > 0">
                                                    <span v-for="(e, i) in item.task2" :key="`t2` + i">{{  e.estimatedStartDate + ' ~ ' + e.estimatedEndDate + ' (' + e.TaskL2name + ')' }}<br></span>
                                                </template>
                                                <template v-if="item.task3 && item.task3.length > 0">
                                                    <span v-for="(e, i) in item.task3" :key="`t3` + i">{{  e.estimatedStartDate + ' ~ ' + e.estimatedEndDate + ' (' + e.TaskL3name + ')' }}<br></span>
                                                </template>
                                                <template v-if="item.task4 && item.task4.length > 0">
                                                    <span v-for="(e, i) in item.task4" :key="`t4` + i">{{  e.estimatedStartDate + ' ~ ' + e.estimatedEndDate + ' (' + e.TaskL4name + ')' }}<br></span>
                                                </template>
                                            </v-list-item-subtitle>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                            <v-checkbox
                                            :input-value="active"
                                            color="green accent-4"
                                            ></v-checkbox>
                                        </v-list-item-action>
                                    </template>
                                </v-list-item>
                            </v-list-item-group>
                        </v-list>
                    </template>
                    <template v-else>
                        <p class="body-1">No available staffs</p>
                    </template>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="staffDialog = false"> Cancel </v-btn>
                    <v-btn color="blue darken-1" text @click="saveStaff">
                        Save
                    </v-btn>
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
    </base-material-card>
</template>

<script>
    import DatePicker from './DatePicker'
    import project_api from "@/apis/project.js"

    export default {
        components: {
            DatePicker,
        },

        name: 'PEstimation',
        props: ['project', 'phase', 'task'],
        
        data: () => ({
            snack: false,
            snackColor: "success",
            snackText: "",

            tabs: [],
            loading: false,

            roleData: [],
            headers: [
                {
                    text: 'Role',
                    align: 'start',
                    sortable: false,
                    value: 'name',
                    class: 'success--text'
                },
                { text: 'Start Date', value: 'estimatedStartDate', class: 'success--text', sortable: false, },
                { text: 'End Date', value: 'estimatedEndDate', class: 'success--text', sortable: false, },
                { text: 'Hrs', value: 'estimatedTimeInMinutes', class: 'success--text', sortable: false, },
                { text: 'Staff', value: 'staff', class: 'success--text', sortable: false, },
                { text: '', value: 'detail', class: 'success--text', sortable: false, },
            ],

            resourceHeader: [
                { text: 'Date', align: 'start',value: 'workingDate', class: 'success--text'},
                { text: 'Hrs', align: 'start', sortable: false, value: 'allocatedMinutes', class: 'success--text'},
                { text: 'Staff', align: 'start', sortable: false, value: 'staff', class: 'success--text'},
            ],

            staffDialog: false,
            selectedStaff: [],

            selectedItem: null,

            saveBtnStatus: true,

            resource: [],
            resourceLoading: false
        }),

        computed: {
            taskDate() {
                if (this.selectedItem)
                    return this.selectedItem.estimatedStartDate + ' ~ ' + this.selectedItem.estimatedEndDate
                return ''
            }
        },

        created() {
        },

        watch: {
            task: function(newValue, oldValue) {
                console.log("estimation watch new ", newValue)
                if (newValue) {
                    // this.task = newValue
                    this.getMpEstimate()
                }
            },

            phase: function(newValue, oldValue) {
                if (newValue) {
                    this.resource = []
                    this.roleData = []
                }
            }
        },

        methods: {
            showMessage(color, message) {
                this.snack = true;
                this.snackColor = color
                this.snackText = message
            },

            getTaskId() {
                const level = this.getLevel()
                if (level == 1)
                    return this.task.info.est_MP_TL1_id    
                if (level == 2) 
                    return this.task.info.est_MP_TL2_id    
                if (level == 3)
                    return this.task.info.est_MP_TL3_id    
                if (level == 4)
                    return this.task.info.est_MP_TL4_id    
            },

            getLevel() {
                return this.task.level
            },

            getPhaseId() {
                return this.phase.phase_id
            },

            initializeRoleData() {
                this.resource = []
                this.roleData.forEach( e => {
                    e.action = "noAction"
                })
                this.roleData.forEach( e => {
                    if (!e.minuteConvert) {
                        e.estimatedTimeInMinutes = Number.parseFloat(e.estimatedTimeInMinutes / 60).toFixed(2) * 1
                        e.minuteConvert = true
                    }
                })
            },

            async getMpEstimate() {
                this.loading = true
                let est = await project_api.getMpEstimate(this.getPhaseId(), this.getLevel(), this.getTaskId())

                this.roleData = []
                const ret = this.task.info.inlcudedRoles
                let temp = []
                ret && ret.length > 0 && ret.forEach( e => { 
                    if (e.roleid) {
                        temp.push(e)
                    }
                })
                this.roleData = temp.filter( e => {
                    const found = est[0].find( e1 => e1.roleid == e.roleid)
                    if (found)
                        return  true
                    return false
                })
                this.initializeRoleData()
                console.log("roleData------ ", this.roleData, this.getPhaseId(), this.getLevel(), this.getTaskId())

                // console.log("phase", this.phase)
                // console.log("phase, level, task, result : ", this.getPhaseId(), this.getLevel(), this.getTaskId(), ret)
                this.loading = false
            },
    
            async editStaff(item) {
                if (!item.estimatedStartDate || !item.estimatedEndDate) {
                    this.showMessage('warning', 'please input start date and end date')
                    return
                }
                this.loading = true
                if (item.staffhridlist == null) {
                    item.staffhridlist = []
                }
                this.selectedStaff = item.staffhridlist
                this.selectedItem = item
                if (!item.staffGet) {
                    const staff = await project_api.getStaff(item.roleid, item.estimatedStartDate, item.estimatedEndDate)
                    console.log("staff", staff)
                    if (staff && staff.length > 0 && staff[0].length > 0 && staff[0][0]) {
                        this.setStaffWithOverlap(staff[0][0])
                    }
                    console.log("filter staff", this.selectedItem)
                }
                this.staffDialog = true
                this.loading = false
            },

            setStaffWithOverlap(data) {
                let staffs = data.peopleWithThisRole
                staffs && staffs.length > 0 && staffs.forEach ( v => {
                    if (data.overlapping_TaskSummaryL1 && data.overlapping_TaskSummaryL1.length > 0) {
                        const filtered = data.overlapping_TaskSummaryL1.filter(e => e.hrid == v.hrid)
                        v.task1 = filtered
                    }
                    if (data.overlapping_TaskSummaryL2 && data.overlapping_TaskSummaryL2.length > 0) {
                        const filtered = data.overlapping_TaskSummaryL2.filter(e => e.hrid == v.hrid)
                        v.task2 = filtered
                    }
                    if (data.overlapping_TaskSummaryL3 && data.overlapping_TaskSummaryL3.length > 0) {
                        const filtered = data.overlapping_TaskSummaryL3.filter(e => e.hrid == v.hrid)
                        v.task3 = filtered
                    }
                    if (data.overlapping_TaskSummaryL4 && data.overlapping_TaskSummaryL4.length > 0) {
                        const filtered = data.overlapping_TaskSummaryL4.filter(e => e.hrid == v.hrid)
                        v.task4 = filtered
                    }
                    if (data.overlapping_LeaveApplications && data.overlapping_LeaveApplications.length > 0) {
                        const filtered = data.overlapping_LeaveApplications.filter(e => e.hrid == v.hrid)
                        v.leave = filtered
                    }
                })
                this.selectedItem.staffs = staffs
                this.selectedItem.staffGet = true
            },

            async saveRoleData() {
                this.loading = true
                let data = []
                this.roleData.forEach( e => {
                    e.action == "modified" && (data.push(e))
                })
                if (data.length > 0) {
                    let ret = await project_api.saveRoleData(data, this.task.level)
                    for (let i in data) {
                        await project_api.projectResource(this.getLevel(), this.getTaskId(), data[i].roleid)
                    }
                    ret && this.showMessage('success', 'Success!')
                    !ret && this.showMessage('error', 'Failed!')
                    this.initializeRoleData()
                    this.saveBtnStatus = true
                }
                this.loading = false
            },

            saveStaff() {
                this.selectedItem.staffhridlist = this.selectedStaff
                this.selectedItem.action = "modified"
                this.saveBtnStatus = false
                this.staffDialog = false
            },

            saveHr(props) {
                console.log("save Hr props", props)
                props.item.action = "modified"
                this.saveBtnStatus = false
            },

            saveStartDate(props) {
                props.item.action = "modified"
                this.saveBtnStatus = false
            },

            saveEndDate(props) {
                props.item.action = "modified"
                this.saveBtnStatus = false
            },

            async showDetail(item) {
                this.resourceLoading = true
                this.loading = true
                this.resource = []
                const ret = await project_api.projectResource(this.getLevel(), this.getTaskId(), item.roleid)
                ret && ret.length > 0 && ret.forEach( e => {
                    e.allocatedMinutes = Number.parseFloat(e.allocatedMinutes / 60).toFixed(2) * 1
                    this.resource.push(e)
                })
                this.resourceLoading = false
                this.loading = false
            },

            getStaffColor(item) {
                if (item.leave && item.leave.length > 0 ||
                    item.task1 && item.task1.length > 0 || 
                    item.task2 && item.task2.length > 0 || 
                    item.task3 && item.task3.length > 0 || 
                    item.task4 && item.task4.length > 0)
                    return 'pink'
                return ''
            }
        }
    }
</script>