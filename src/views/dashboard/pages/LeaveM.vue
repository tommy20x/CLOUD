<template>
    <v-container id="regular-tables" tag="section" fluid>
        
    <base-material-card
      color="green"
    >
      <template v-slot:heading>
        <div class="display-1 font-weight-light">
            Leave Manager
        </div>
      </template>
            <v-data-table
                :headers="headers"
                :items="leaveData"
                :search="search"
                :loading="loading"
                loading-text="Loading... Please wait"
                sort-by="id">
                <template v-slot:top>
                    <v-container>
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
                                <span class="headline">Apporve Leave</span>
                                <br>
                                <p class="mb-0 text-left">{{ saveData.name }}</p>
                                </v-card-title>

                                <v-card-text>
                                <v-form ref="form" v-model="valid" lazy-validation>
                                    <v-row>
                                        <v-col>
                                        <!--
                                            <DatePicker
                                                textName="Leave From"
                                                :date="saveData.leaveDateFrom"
                                                :submit="(date) => saveData.leaveDateFrom = date"
                                                :endDate="saveData.leaveDateTo"
                                            ></DatePicker>
                                            -->
                                            <v-text-field
                                                label="Leave From"
                                                v-model="saveData.leaveDateFrom"
                                                readonly
                                            />
                                        </v-col>
                                        <v-col>
                                        <!--
                                            <DatePicker
                                                textName="Leave To"
                                                :date="saveData.leaveDateTo"
                                                :submit="(date) => saveData.leaveDateTo = date"
                                                :startDate="saveData.leaveDateFrom"
                                            ></DatePicker>
                                            -->
                                            <v-text-field
                                                label="Leave To"
                                                v-model="saveData.leaveDateTo"
                                                readonly
                                            />
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col class="py-0">
                                            <v-checkbox
                                            v-model="saveData.fromHalf"
                                            label="Half Day"
                                            hide-details
                                            readonly
                                            ></v-checkbox>
                                        </v-col>
                                        <v-col class="py-0">
                                            <v-checkbox
                                            v-model="saveData.toHalf"
                                            label="Half Day"
                                            hide-details
                                            readonly
                                            ></v-checkbox>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-textarea
                                            label="Reason"
                                            v-model="saveData.leaveReason"
                                            rows="3"
                                            readonly
                                            ></v-textarea>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-text-field
                                                v-model="balance"
                                                label="Balance as on (Leave from date)"
                                                readonly
                                            >
                                            </v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-select
                                                v-model="saveData.leaveType"
                                                :items="leaveTypes"
                                                attach
                                                item-text="name"
                                                item-value="value"
                                                label="Leave Type"
                                                readonly
                                            ></v-select>
                                        </v-col>
                                    </v-row>
                                </v-form>
                                </v-card-text>

                                <v-card-actions v-if="getStatus">
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
                                <v-btn color="red darken-1" text @click="reject"> Reject </v-btn>
                                <v-btn color="blue darken-1" text @click="approve"> Approve </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                        <!--Add Dialog End-->

                    </v-container>
                </template>

                <template v-slot:item.action="{ item }">
                    <template v-if="item.status == `applied`">
                        <v-btn small color="teal" text title='Approve' @click="approveLeave(item)" :disabled="!roles.edit">
                            <v-icon>
                                mdi-check
                            </v-icon>
                        </v-btn>
                    </template>
                    <template v-else>
                        <v-btn small :color="getColor(item)" text title='Approve' @click="approveLeave(item)">
                            <v-icon>
                                mdi-eye
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
    import leave_api from "@/apis/leave.js";
    import auth_api from "@/apis/auth.js";

    export default {
        components: {
            DatePicker,
        },

        data: () => ({
            headers: [
                { text: "Leave From", align: "start", value: "leaveFrom", class: "primary--text" },
                { text: "Leave To", align: "start", value: "leaveTo", class: "primary--text" },
                { text: "Status", align: "start", value: "status", class: "primary--text" },
                { text: "Name", align: "center", value: "name", class: "primary--text"},
                { text: "Reason", align: "start", value: "reason", sortable: false, class: "primary--text" },
                { text: "Action", align: "center", value: "action", class: "primary--text"}
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
                toHalf: false,
                name: ''
            },
            initialSaveData: {
                leaveDateFrom: null,
                leaveDateTo: null,
                leaveReason: null,
                leaveType: null,
                fromHalf: false,
                toHalf: false,
                name: ''
            },
            snack: false,
            snackColor: "success",
            snackText: "",
            selectedItem: null,
            balance: null,
            roles: {}
        }),

        async created() {
            this.loading = true
            this.leaveData = await leave_api.getAllLeave()
            this.roles = auth_api.getRole()
            console.log("leaveData", this.leaveData)
            this.loading = false
        },

        computed: {
            getStatus() {
                if (this.selectedItem && this.selectedItem.status != 'applied')
                    return false
                return true
            }
        },

        methods: {
            addItem() {
                if (this.$refs.form) {
                    this.$refs.form.resetValidation()
                }
                this.dialog = true
            },

            getColor(item) {
                if (item.status == "cancelled-by-me") {
                    return 'warning'
                }
                
                if (item.status == "rejected-by-hr") {
                    return 'error'
                }

                return 'teal'
            },

            async approve() {
                this.loading = true
                this.close()
                let status = await leave_api.approveLeaveByHR(this.selectedItem.hrId, this.selectedItem.id, this.selectedItem.lastUpdateTimeStamp, this.balance)
                this.leaveData = await leave_api.getAllLeave()
                this.show_snack(status)
                this.loading = false
            },

            close() {
                this.dialog = false
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

            async approveLeave(item) {
                this.loading = true
                this.dialog = true
                
                this.saveData.leaveDateFrom = item.leaveFrom
                this.saveData.leaveDateTo = item.leaveTo
                this.saveData.fromHalf = item.fromHalf ? true : false
                this.saveData.toHalf = item.toHalf ? true : false
                this.saveData.leaveReason = item.reason
                this.saveData.leaveType = item.leaveType
                this.saveData.name = item.name

                this.selectedItem = item
                this.balance = await leave_api.getIndividualBalance(item.leaveFrom, item.hrId)
                this.loading = false
            },

            async reject() {
                this.loading = true
                this.close()
                let status = await leave_api.cancelLeaveByHR(this.selectedItem.hrId, this.selectedItem.id, this.selectedItem.lastUpdateTimeStamp)
                this.leaveData = await leave_api.getAllLeave()
                this.show_snack(status)
                this.loading = false
            }
        }
    }
</script>

