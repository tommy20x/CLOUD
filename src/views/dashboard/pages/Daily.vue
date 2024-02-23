<template>
    <v-container id="regular-tables" tag="section" fluid>
        <v-progress-linear
            indeterminate
            class="mb-1"
            color="green"
            v-if="wait">
        </v-progress-linear>
        <v-row>
            <v-col cols="12" sm="12" md="12" class="pt-0">
                <base-material-card
                icon="mdi-update"
                title="Update"
                color="purple"
                class="px-5 py-3"
                >
                    <v-container class="pt-0">
                        <v-row>
                            <v-col class="pt-0">
                                <v-tabs
                                v-model="tabs"
                                fixed-tabs
                                color="purple"
                                >
                                    <v-tabs-slider></v-tabs-slider>
                                    <v-tab
                                        href="#tab1"
                                    >
                                        <v-icon>mdi-calendar-today</v-icon> Daily
                                    </v-tab>

                                    <v-tab
                                        href="#tab2"
                                    >
                                        <v-icon>mdi-calendar-week</v-icon> Weekly
                                    </v-tab>

                                </v-tabs>
                                <v-tabs-items v-model="tabs">
                                    <v-tab-item
                                        :value="`tab1`"
                                    >
                                        <v-card flat class="mt-1">
                                            <v-card-text style="min-height: 400px" class="pt-0">
                                                <center>
                                                    <div style="max-width: 300px">
                                                        <DatePicker
                                                            textName="Date"
                                                            :date="selectedDay"
                                                            :submit="(date) => selectedDay = date"
                                                        ></DatePicker>
                                                    </div>
                                                </center>
                                                <div>
                                                    <v-text-field
                                                    class="pt-0 mt-0"
                                                    label="Task Name"
                                                    append-icon="mdi-magnify"
                                                    @change="searchTask($event)"
                                                    >
                                                    </v-text-field>
                                                </div>
                                                <v-list class="pt-0" :disabled="listStatus">
                                                    <v-list-item-group v-model="selectedItem">
                                                        <template  v-for="(item, i) in taskList" >
                                                            <v-list-item :key="i" 
                                                                        :value="item"
                                                                        active-class="deep-purple--text text--accent-4">
                                                                <v-list-item-icon>
                                                                    <v-icon>mdi-semantic-web</v-icon>
                                                                </v-list-item-icon>
                                                                <v-list-item-content>
                                                                    <v-list-item-title>
                                                                        <span v-if="item.backgroundColor" :style="setBackgroundColor(item)">I</span>
                                                                        <span class="ml-2" :style="setFontColor(item)">{{ getTaskName(item) }}</span>
                                                                    </v-list-item-title>
                                                                </v-list-item-content>
                                                                <v-list-item-icon>
                                                                    <v-progress-circular
                                                                        v-if="waitProject == item"
                                                                        indeterminate
                                                                        color="purple"
                                                                        :width="2"
                                                                        :size="24"
                                                                    ></v-progress-circular>
                                                                </v-list-item-icon>
                                                            </v-list-item>
                                                            <v-divider :key="i+100"></v-divider>
                                                        </template>
                                                    </v-list-item-group>
                                                </v-list>
                                            </v-card-text>
                                        </v-card>
                                    </v-tab-item>
                                    <v-tab-item
                                        :value="`tab2`"
                                    >
                                        <v-card flat>
                                            <v-card-text style="min-height: 400px">
                                                Weekly
                                            </v-card-text>
                                        </v-card>
                                    </v-tab-item>
                                </v-tabs-items>
                            </v-col>
                        </v-row>
                    </v-container>
                </base-material-card>
            </v-col>
        </v-row>

        <v-bottom-sheet v-model="sheet" inset>
            <v-sheet
                class="text-center"
            >
                <v-card :loading="sheetLoading">
                    <v-card-title>
                        <p class="body-1 purple--text font-weight-bold">
                            {{ selectedItem && getTaskName(selectedItem) }}
                        </p>
                    </v-card-title>
                    <v-card-text style="height: 500px; overflow: auto">
                        <v-container class="py-0">
                            <v-data-table
                            :headers="headers"
                            :items="updatedData"
                            hide-default-footer
                            >
                                <template v-slot:item.remove="{ item }">
                                    <v-icon small title="remove" color="warning" @click="removeUpdated(item)" :disabled="!roles.delete">
                                        mdi-delete
                                    </v-icon>
                                </template>
                            </v-data-table>
                        </v-container>
                        <br><hr><br>
                        <v-container class="py-0">
                            <v-form ref="form" lazy-validation>
                                <div>
                                    <v-switch
                                    style="max-width: 100px; height: 40px; padding-top: 10px;"
                                    class="mt-0"
                                    v-model="self"
                                    :label="selfLabel"
                                    color="blue darken-1"
                                    ></v-switch>
                                </div>
                                <v-row>
                                    <v-col cols="12" md="6" class="pb-0">
                                        <v-select
                                        label="Supervisor"
                                        :items="supervisors"
                                        v-model="selectedSupervisor"
                                        :rules="supervisorRule"
                                        item-value="id"
                                        item-text="showName"
                                        dense
                                        >
                                        </v-select>
                                    </v-col>
                                    <template v-if="!this.self">
                                        <v-col cols="12" md="6" class="pb-0">
                                            <v-select
                                            label="Performer"
                                            :items="performers"
                                            v-model="selectedPerformer"
                                            :rules="supervisorRule"
                                            item-value="id"
                                            item-text="showName"
                                            dense
                                            >
                                            </v-select>
                                        </v-col>
                                    </template>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" md="4" sm="6" class="pb-0" style="height:50px; padding-top: 25px;">
                                        <span>{{ selectedItem && selectedItem.rolename }}</span>
                                    </v-col>
                                    <v-col cols="12" md="3" sm="6" class="py-0" style="height:50px">
                                        <v-text-field
                                            label="Hrs"
                                            :rules="hrRules"
                                            v-model="hrs"
                                            :error-messages="errorMessage"
                                            @keydown="errorMessage = ''"
                                        >
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="3" sm="6" class="py-0" style="height:50px">
                                        <v-text-field
                                            label="Mins"
                                            :rules="minRules"
                                            v-model="mins"
                                            :error-messages="errorMessage"
                                            @keydown="errorMessage = ''"
                                        >
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="2" sm="6" class="py-0" style="height:50px">
                                        <v-text-field
                                            label="% Today"
                                            :rules="pctRules"
                                            v-model="pct"
                                            :error-messages="errorMessage"
                                            @keydown="errorMessage = ''"
                                        >
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-container>
                    </v-card-text>
                    <v-card-actions >
                        <v-spacer></v-spacer>
                        <!--
                        <v-btn color="pink" class="mr-5" small text @click="deleteBtnClicked">
                            Delete
                        </v-btn>
                        -->
                        <v-btn color="blue" class="mr-5" small text @click="sheet = false">
                            Cancel
                        </v-btn>
                        <v-btn color="blue" small elevation="7" @click="save" :disabled="!roles.add">
                            Save
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-sheet>
        </v-bottom-sheet>

        <v-dialog v-model="confirmDialog" max-width="500px">
            <v-card>
                <v-card-title class="headline">
                    Are you sure?<br>
                    <p style="font-size:14px">Update Data is already exist.</p>
                </v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" @click="closeConfirm">
                        No
                    </v-btn>
                    <v-btn color="green darken-1" text @click="saveConfirm">Yes</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>
        
        <v-dialog v-model="deleteDialog" max-width="500px"> 
            <v-card>
                <v-card-title class="headline">
                    Are you sure?<br>
                    <p style="font-size:14px">Delete</p>
                </v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="pink darken-1" @click="closeDelete">
                        No
                    </v-btn>
                    <v-btn color="pink darken-1" text @click="confirmDelete">Yes</v-btn>
                    <v-spacer></v-spacer>
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
    import client_api from "@/apis/client.js";
    import daily_api from "@/apis/daily.js";
    import auth_api from "@/apis/auth.js";
    import InputGroup from './InputGroup'
    import DatePicker from './DatePicker'
    import DailyData from './DailyData'
    import associate_api from "@/apis/associate.js"

    export default {
        components: {
            InputGroup,
            DatePicker,
            DailyData
        },

        data: () => ({
            wait: false,
            waitProject: null,

            taskList: [],
            allTaskList: [],

            selectedItem: null,

            supervisor: null,
            supervisors: [],
            selectedSupervisor: null,

            performer: null,
            performers: [],
            selectedPerformer: null,

            snack: false,
            snackColor: "success",
            snackText: "",

            sheetLoading: false,
            updateLoading: false,

            hrId: null,
            confirmDialog: false,

            deleteDialog: false,
            today: null,
            yesterday: null,
            selectedDay: null,
            selectedAmount: [],
            saveBtnStatus: false,

            self: true,
            tabs: [],

            sheet: false,

            hrs: "",
            mins: "",
            pct: "",
            errorMessage: "",

            headers: [
                { text: 'Date', align: 'start', sortable: false, value: 'effortdate', class: 'success--text'},
                { text: 'Hrs', align: 'start', sortable: false, value: 'hrs', class: 'success--text'},
                { text: 'Mins', align: 'start', sortable: false, value: 'mins', class: 'success--text'},
                { text: '%', align: 'start', sortable: false, value: 'pct', class: 'success--text'},
                { text: '', align: 'start', sortable: false, value: 'remove', class: 'success--text'},
            ],
            updatedData: [],
            removeItem: null,
            roles: {}
        }),
        
        watch: {
            selectedItem: async function(newValue, oldValue) {
                console.log("wath", newValue)
                if (newValue) {
                    this.$refs.form && this.$refs.form.resetValidation()
                    await this.getUpdate()
                    this.sheet = !this.sheet
                }
            },

            selectedDay: async function(newValue, oldValue) {
                this.wait = true
                await this.setTaskList()
                this.wait = false
            }
        },

        created: async function() {
            this.wait = true
            this.hrId = await auth_api.getOwnId()
            this.roles = auth_api.getRole()

            this.today = daily_api.getToday()
            this.selectedDay = daily_api.getToday()

            this.yesterday = daily_api.getYesterday()
            await this.setTaskList()
            const associates = await associate_api.findAll()
            let filtered = associates.filter( e => e.assocationStatus == 'joined')
            filtered && filtered.length > 0 && filtered.forEach( e => {
                e.showName = e.firstname + ' ' + e.lastname + ' -      ' + e.code
            })
                
            this.supervisors = filtered
            this.performers = filtered

            this.wait = false
        },

        computed: {
            supervisorRule() {
                return [
                    (v) => !!v || "required",
                ]
            },
            performerRule() {
                return [
                    (v) => v && v.length > 0 || "required",
                ]
            },
            hrRules() {
                return [
                    v => {
                        if (!v) {
                            return true
                        } else if (!(!isNaN(parseFloat(v)) && isFinite(v))) {
                            return 'number'
                        } else if (v < 0) {
                            return ' >= 0'
                        } else if (v > 24) {
                            return ' <= 24'
                        }
                        return true
                    }
                ]
            },
            minRules() {
                return [
                    v => {
                        if (!v) {
                            return true
                        } else if (!(!isNaN(parseFloat(v)) && isFinite(v))) {
                            return 'number'
                        } else if (v < 0) {
                            return ' >= 0'
                        } else if (v > 60) {
                            return ' <= 60'
                        }
                        return true
                    }
                ]
            },
            pctRules() {
                return [
                    v => {
                        if (!v) {
                            return true
                        } else if (!(!isNaN(parseFloat(v)) && isFinite(v))) {
                            return 'number'
                        } else if (v < 0) {
                            return ' >= 0'
                        } else if (v > 100) {
                            return ' <= 100'
                        }
                        return true
                    }
                ]
            },
            totalRules() {
                return [
                    v => {
                        if (!v) {
                            return true
                        } else if (!(!isNaN(parseFloat(v)) && isFinite(v))) {
                            return 'number'
                        } else if (v < 0) {
                            return ' >= 0'
                        } else if (v > 100) {
                            return ' <= 100'
                        }
                        return true
                    }
                ]
            },
            
            deleteBtnStatus() {
                if (this.selectedItem && this.selectedItem.userAction == "saved")
                    return false
                return true
            },

            selfLabel() {
                if (this.self)
                    return 'self'
                return 'other'
            },

            listStatus() {
                if (this.waitProject) return true
                return false
            }
        },

        methods: {
            async setTaskList() {
                const ret = await daily_api.getUpdatedList(this.hrId, "daily", this.selectedDay)
                const list = ret[0]

                this.allTaskList = []
                list.TaskSummaryL1 && list.TaskSummaryL1.length > 0 && (this.allTaskList = this.allTaskList.concat(list.TaskSummaryL1))
                list.TaskSummaryL2 && list.TaskSummaryL2.length > 0 && (this.allTaskList = this.allTaskList.concat(list.TaskSummaryL2))
                list.TaskSummaryL3 && list.TaskSummaryL3.length > 0 && (this.allTaskList = this.allTaskList.concat(list.TaskSummaryL3))
                list.TaskSummaryL4 && list.TaskSummaryL4.length > 0 && (this.allTaskList = this.allTaskList.concat(list.TaskSummaryL4))
                this.taskList = this.allTaskList
                console.log("task list", this.taskList)
            },

            async save() {
                // this.confirmDialog = true
                if (!this.$refs.form.validate()) {
                    return
                }
                if (!this.hrs && !this.mins || !this.hrs && !this.mins && !this.pct) {
                    this.errorMessage = "please input"
                    return
                }

                const level = this.getItemLevel(this.selectedItem)
                this.sheetLoading = true
                let status
                if (level == 1) {
                    status = await daily_api.add1(this.selectedDay, this.selectedItem.est_MP_TL1_id, this.selectedItem.roleid, this.selectedSupervisor, this.self, this.selectedPerformer, this.hrs, this.mins, this.pct)
                } else if (level == 2) {
                    status = await daily_api.add2(this.selectedDay, this.selectedItem.est_MP_TL2_id, this.selectedItem.roleid, this.selectedSupervisor, this.self, this.selectedPerformer, this.hrs, this.mins, this.pct)
                } else if (level == 3) {
                    status = await daily_api.add3(this.selectedDay, this.selectedItem.est_MP_TL3_id, this.selectedItem.roleid, this.selectedSupervisor, this.self, this.selectedPerformer, this.hrs, this.mins, this.pct)
                } else if (level == 4) {
                    status = await daily_api.add4(this.selectedDay, this.selectedItem.est_MP_TL4_id, this.selectedItem.roleid, this.selectedSupervisor, this.self, this.selectedPerformer, this.hrs, this.mins, this.pct)
                }
                console.log("after save", status)
                if (status) {
                    this.selectedItem.updated = false
                    await this.getUpdate()
                }
                this.show_snack(status)
                this.sheetLoading = false
            },

            checkSendData(){
        
            },

            show_snack(success) {
                this.snack = true;
                if (success) {
                    this.snackColor = "success"
                    this.snackText = "Success"
                }
                else {
                    this.snackColor = "error";
                    this.snackText = "Failed";
                }
            },

            closeConfirm() {
                this.confirmDialog = false
            },

            async saveConfirm() {
                this.closeConfirm()
            },

            deleteBtnClicked() {
                this.deleteDialog = true
            },

            closeDelete() {
                this.deleteDialog = false
            },

            getDailyData(level) {
                let itemId = this.getId()
                let result
                if (level == 1) {
                    result = this.task1Update.filter(e => e.estimate_MP_taskL1id == itemId)
                } else if (level == 2) {
                    result = this.task2Update.filter(e => e.estimate_MP_taskL2id == itemId)
                } else if (level == 3) {
                    result = this.task3Update.filter(e => e.estimate_MP_taskL3id == itemId)
                } else if (level == 4) {
                    result = this.task4Update.filter(e => e.estimate_MP_taskL4id == itemId)
                }
                return result
            },

            async confirmDelete() {
                this.sheetLoading = true
                this.closeDelete()
                let ret
                if (this.removeItem.dailyUpdatesL1_id) {
                    ret = await daily_api.remove1(this.removeItem.dailyUpdatesL1_id)
                } else if (this.removeItem.dailyUpdatesL2_id) {
                    ret = await daily_api.remove2(this.removeItem.dailyUpdatesL2_id)
                } else if (this.removeItem.dailyUpdatesL3_id) {
                    ret = await daily_api.remove3(this.removeItem.dailyUpdatesL3_id)
                } else if (this.removeItem.dailyUpdatesL4_id) {
                    ret = await daily_api.remove4(this.removeItem.dailyUpdatesL4_id)
                }
                if (ret) {
                    this.selectedItem.updated = false
                    await this.getUpdate()
                }
                this.show_snack(ret)
                this.sheetLoading = false
            },
            
            getItemLevel(item) {
                if (item.est_MP_TL1_id) return 1
                if (item.est_MP_TL2_id) return 2
                if (item.est_MP_TL3_id) return 3
                if (item.est_MP_TL4_id) return 4
            },

            getTaskName(item) {
                const level = this.getItemLevel(item)
                const categoryName = item.projectname + ' / ' + item.TaskCategoryName + ' / '
                if (level == 1) {
                    return categoryName + item.TaskL1name
                } else if (level == 2) {
                    return categoryName + '. / ' + item.TaskL2name
                } else if (level == 3) {
                    return categoryName + '.. / ' + item.TaskL3name
                } else if (level == 4) {
                    return categoryName + '... / ' + item.TaskL4name
                }
                return ''
            },

            searchTask(event) {
                console.log("event", event)
                this.allTaskList && this.allTaskList.length > 0 && (this.taskList = this.allTaskList.filter(item => {
                    const level = this.getItemLevel(item)
                    if (level == 1) {
                        return item.TaskL1name.toUpperCase().includes(event.toUpperCase())
                    } else if (level == 2) {
                        return item.TaskL2name.toUpperCase().includes(event.toUpperCase())
                    } else if (level == 3) {
                        return item.TaskL3name.toUpperCase().includes(event.toUpperCase())
                    } else if (level == 4) {
                        return item.TaskL4name.toUpperCase().includes(event.toUpperCase())
                    }
                }))
            },

            getItemId(item) {
                const level = this.getItemLevel(item)
                if (level == 1) {
                    return item.est_MP_TL1_id
                } else if (level == 2) {
                    return item.est_MP_TL2_id
                } else if (level == 3) {
                    return item.est_MP_TL3_id
                } else if (level == 4) {
                    return item.est_MP_TL4_id
                }
            },

            async getUpdate() {
                this.waitProject = this.selectedItem
                // if (!this.selectedItem.updated) {
                    const level = this.getItemLevel(this.selectedItem)
                    const id = this.getItemId(this.selectedItem)
                    const ret1 = await daily_api.getUpdated(level, id, 'daily', this.selectedDay)
                    // const ret2 = await daily_api.getUpdated(level, id, 'daily', this.today)
                    // this.selectedItem.updatedData = ret1.concat(ret2)
                    this.selectedItem.updatedData = ret1
                    this.selectedPerformer = null
                    this.selectedSupervisor = null
                    this.hrs = ''
                    this.mins = ''
                    this.pct = ''
                // }
                    
                this.updatedData = []
                this.selectedItem.updatedData.length > 0 && this.selectedItem.updatedData.forEach( e => {
                    let temp = Object.assign({}, e)
                    
                    if (temp.dailyUpdatesL1_id) {
                        temp.hrs = parseInt(temp.L1AdditionalTotMinsToday / 60)
                        temp.mins = temp.L1AdditionalTotMinsToday % 60
                        temp.pct = temp.L1TotPctMarkToday * 1
                    } else if (temp.dailyUpdatesL2_id) {
                        temp.hrs = parseInt(temp.L2AdditionalTotMinsToday / 60)
                        temp.mins = temp.L2AdditionalTotMinsToday % 60
                        temp.pct = temp.L2TotPctMarkToday * 1
                    } else if (temp.dailyUpdatesL3_id) {
                        temp.hrs = parseInt(temp.L3AdditionalTotMinsToday / 60)
                        temp.mins = temp.L3AdditionalTotMinsToday % 60
                        temp.pct = temp.L3TotPctMarkToday * 1
                    } else if (temp.dailyUpdatesL4_id) {
                        temp.hrs = parseInt(temp.L4AdditionalTotMinsToday / 60)
                        temp.mins = temp.L4AdditionalTotMinsToday % 60
                        temp.pct = temp.L4TotPctMarkToday * 1
                    }
                    this.updatedData.push(temp)
                })
                this.selectedItem.updated = true
                this.$refs.form && this.$refs.form.resetValidation()
                this.waitProject = null
            },

            removeUpdated(item) {
                this.removeItem = item
                this.deleteDialog = true
            },

            setBackgroundColor(item) {
                if (item.backgroundColor)
                    return 'background-color: ' + item.backgroundColor + '; width: 4px; color: ' + item.backgroundColor
                return ''
            },

            setFontColor(item) {
                if (item.fontColor)
                    return 'color: ' + item.fontColor + ';'
                return ''
            }
        }
    }
</script>   