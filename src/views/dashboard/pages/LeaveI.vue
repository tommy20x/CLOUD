<template>
    <v-container id="regular-tables" tag="section" fluid>
        
        <base-material-card
        color="green"
        >
        <template v-slot:heading>
            <div class="display-1 font-weight-light">
                Leave Individual
            </div>
        </template>
            <v-data-table
                :headers="headers"
                :items="leaveData"
                :search="search"
                :loading="loading"
                loading-text="Loading... Please wait">
                <template v-slot:top>
                    <v-container>
                        <div class="d-flex flex-row-reverse" flat tile>
                        <v-btn
                            color="blue"
                            dark
                            class="mb-2"
                            :disabled="!roles.add"
                            @click="addItem"
                            fab>
                            New
                        </v-btn>
                        </div>
                        <div flat tile>
                        <v-text-field
                            v-model="search"
                            append-icon="mdi-magnify"
                            label="Search"
                            single-line
                            hide-details
                        ></v-text-field>
                        </div>
                        
                        <!--Add Dialog Begin-->
                        <v-dialog v-model="dialog" max-width="500px">
                            <v-card>
                                <v-card-title>
                                <span class="headline">Apply Leave</span>
                                </v-card-title>

                                <v-card-text>
                                <v-form ref="form" v-model="valid" lazy-validation>
                                    <v-row>
                                        <v-col>
                                            <DatePicker
                                                textName="Leave From"
                                                :date="saveData.leaveDateFrom"
                                                :submit="(date) => saveData.leaveDateFrom = date"
                                                :endDate="saveData.leaveDateTo"
                                            ></DatePicker>
                                        </v-col>
                                        <v-col>
                                            <DatePicker
                                                textName="Leave To"
                                                :date="saveData.leaveDateTo"
                                                :submit="(date) => saveData.leaveDateTo = date"
                                                :startDate="saveData.leaveDateFrom"
                                            ></DatePicker>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col class="py-0">
                                            <v-checkbox
                                            v-model="saveData.fromHalf"
                                            label="Half Day"
                                            hide-details
                                            ></v-checkbox>
                                        </v-col>
                                        <v-col class="py-0">
                                            <v-checkbox
                                            v-model="saveData.toHalf"
                                            label="Half Day"
                                            hide-details
                                            ></v-checkbox>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-select
                                                v-model="saveData.leaveType"
                                                :items="leaveTypes"
                                                attach
                                                :rules="typeRules"
                                                item-text="name"
                                                item-value="value"
                                                label="Leave Type"
                                            ></v-select>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-textarea
                                            label="Reason"
                                            v-model="saveData.leaveReason"
                                            rows="3"
                                            counter="200"
                                            ></v-textarea>
                                        </v-col>
                                    </v-row>
                                </v-form>
                                </v-card-text>

                                <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
                                <v-btn :disabled="!valid" color="blue darken-1" text @click="save"> Apply </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                        <!--Add Dialog End-->

                        <!--Cancel Dialog Begin-->
                        <v-dialog v-model="cancelDialog" max-width="500px">
                            <v-card>
                                <v-card-title>
                                <span class="headline">Cancel Leave</span>
                                </v-card-title>

                                <v-card-text>
                                    <v-form ref="form1" v-model="valid1" lazy-validation>
                                        <v-row>
                                            <v-col>
                                                <v-textarea
                                                label="Cancel Reason"
                                                v-model="cancelReason"
                                                rows="5"
                                                :rules="reasonRules"
                                                counter="200"
                                                ></v-textarea>
                                            </v-col>
                                        </v-row>
                                    </v-form>
                                </v-card-text>

                                <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" text @click="closeCancelDlg"> Cancel </v-btn>
                                <v-btn :disabled="!valid1" color="blue darken-1" text @click="saveCancel"> Save </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                        <!--Cancel Dialog End-->
                    </v-container>
                </template>

                <template v-slot:item.status="{ item }">
                    <template v-if="item.status == 'applied'">
                        {{ item.status }}
                    </template>
                    <template v-else>
                        <v-icon :color=getColor(item.status)>
                            {{getIcon(item.status)}} 
                        </v-icon>
                    </template>
                </template>

                <template v-slot:item.actions="{ item }">
                    <template v-if="item.status == `applied`">
                        <v-btn small color="teal" text title='Modify' @click="modifyLeave(item)" :disabled="!roles.edit">
                            <v-icon>
                                mdi-square-edit-outline
                            </v-icon>
                        </v-btn>
                        <v-btn small color="red" text title='Cancel' @click="cancelLeave(item)" :disabled="!roles.edit">
                            <v-icon>
                                mdi-tooltip-remove-outline
                            </v-icon>
                        </v-btn>
                    </template>
                </template>
            </v-data-table>
        </base-material-card>

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
    import leave_api from "@/apis/leave.js"
    import auth_api from "@/apis/auth.js";

    export default {
        components: {
            DatePicker,
        },

        data: () => ({
            headers: [
                { text: "Leave From", align: "start", value: "leaveFrom", class: "primary--text"},
                { text: "Leave To", align: "start", value: "leaveTo",class: "primary--text" },
                { text: "Status", align: "start", value: "status",class: "primary--text" },
                { text: "Reason", align: "start", value: "reason", sortable: false, class: "primary--text" },
                { text: "Action", align: "center", value: "actions", class: "primary--text"}
            ],
            leaveData: [],
            leaveTypes: [{value: 'EL', name: 'Earned Leave'},
                        {value: 'ML', name: 'Medical Leave'},
                        {value: 'CL', name: 'Casual Leave'}],
            search: "",
            loading: false,
            dialog: false,
            valid: false,
            saveData: {
                leaveDateFrom: null,
                leaveDateTo: null,
                leaveReason: null,
                leaveType: null,
                fromHalf: false,
                toHalf: false
            },
            initialSaveData: {
                leaveDateFrom: null,
                leaveDateTo: null,
                leaveReason: null,
                leaveType: null,
                fromHalf: false,
                toHalf: false
            },
            snack: false,
            snackColor: "success",
            snackText: "",
            editOrAdd: "",
            selectedItem: null,
            cancelDialog: false,
            cancelReason: "",
            valid1: false,
            hrId: null,

            roles: {}
        }),

        async created() {
            this.loading = true
            this.hrId = await auth_api.getOwnId()
            this.leaveData = await leave_api.getMyLeave(this.hrId)
            this.roles = auth_api.getRole()
            console.log("roles", this.roles)
            this.loading = false
        },

        computed: {
            typeRules() {
                return [
                    (v) => !!v || "Type is required",
                ]
            },
            reasonRules() {
                return [
                    (v) => !!v || "Reason is required",
                    (v) =>
                        (v && v.length <= 200) ||
                        `This field must be less than 200 characters`,
                ]
            }
        },

        methods: {
            addItem() {
                if (this.$refs.form) {
                    this.$refs.form.resetValidation()
                }
                this.editOrAdd = "add"
                this.saveData = Object.assign({}, this.initialSaveData)
                this.selectedItem = null
                this.dialog = true
            },

            async save() {
                if (!this.$refs.form.validate()) return
                this.loading = true
                this.close()
                console.log("saveData", this.saveData)
                let status
                if (this.editOrAdd == "add") {
                    status = await leave_api.applyLeave(this.hrId, this.saveData)
                } else if (this.editOrAdd == "edit") {
                    status = await leave_api.modifyLeave(this.selectedItem.id, this.saveData)
                }
                this.leaveData = await leave_api.getMyLeave(this.hrId)
                console.log("status", status)
                this.show_snack(status)
                this.loading = false
            },

            close() {
                this.dialog = false
            },

            async modifyLeave(item) {
                if (this.$refs.form) {
                    this.$refs.form.resetValidation()
                }
                this.saveData.leaveDateFrom = item.leaveFrom
                this.saveData.leaveDateTo = item.leaveTo
                this.saveData.fromHalf = item.fromHalf ? true : false
                this.saveData.toHalf = item.toHalf ? true : false
                this.saveData.leaveReason = item.reason
                this.saveData.leaveType = item.leaveType

                this.selectedItem = item
                this.editOrAdd = "edit"
                this.dialog = true

                console.log("modify item", item)
                
            },

            cancelLeave(item) {
                if (this.$refs.form1) {
                    this.$refs.form1.resetValidation()
                }
                this.selectedItem = item
                this.cancelDialog = true
            },

            show_snack(success) {
                this.snack = true;
                if (success) {
                    this.snackColor = "success"
                    this.snackText = "Data saved"
                }
                else {
                    this.snackColor = "error";
                    this.snackText = "Error";
                }
            },

            closeCancelDlg() {
                this.cancelDialog = false
            },

            async saveCancel() {
                if (!this.$refs.form1.validate()) return
                this.loading = true
                this.closeCancelDlg()
                let status = await leave_api.cancelLeaveByMe(this.selectedItem.id, this.cancelReason, this.selectedItem.lastUpdateTimeStamp)
                status && (this.selectedItem.status = "cancelled-by-me")
                this.show_snack(status)
                this.loading = false
            },

            getIcon(item) {
                if (item == "cancelled-by-me" || "rejected-by-hr") return "mdi-sticker-remove-outline"
                if (item == "approved-by-hr") return "mdi-sticker-check-outline"
            },

            getColor(item) {
                if (item == "cancelled-by-me") return "warning"
                if (item == "approved-by-hr") return "teal"
                if (item == "rejected-by-hr") return "error"
            },
        }
    }
</script>

