<template>
    <v-container id="regular-tables" tag="section" fluid>
        <v-progress-linear
            class="mb-1"
            indeterminate
            color="primary"
            v-if="wait">
        </v-progress-linear>
        <v-row>
            <v-col cols="12" md="7">
                <base-material-card
                color="green"
                >
                <template v-slot:heading>
                    <div class="display-1 font-weight-light">
                        Leave Balance
                    </div>
                </template>
                    <v-data-table
                        :headers="headers"
                        :items="leaveBalances"
                        :search="search"
                        :loading="loading"
                        loading-text="Loading... Please wait"
                        sort-by="id">
                        <template v-slot:top>
                            <v-container>
                                <v-row>
                                    <v-col>
                                        <DatePicker
                                            textName="Date"
                                            :date="selectedDate"
                                            :submit="(date) => {selectedDate = date
                                                                 dateChanged()}"
                                        ></DatePicker>
                                    </v-col>
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

                        <template v-slot:item.detail="{ item }">
                            <v-btn small text color="pink" title='Detail' @click="showDetail(item)">
                                Detail
                            </v-btn>
                        </template>
                        <template v-slot:item.rowSelected="{ item }">
                            <template v-if="item == selectedItem">
                                <v-icon color="pink">
                                    mdi-check
                                </v-icon>
                            </template>
                        </template>
                    </v-data-table>
                </base-material-card>
            </v-col>
            <v-col cols="12" md="5">
                <base-material-card
                icon="mdi-notebook-edit"
                title="Detail"
                color="purple"
                class="px-5 py-3"
                >
                    <v-card-title>
                        <div style="text-align: right; width: 100%">
                            <v-btn color="blue" @click="addBalance" :disabled="addBtnValid || !roles.add" fab small>
                                Add
                            </v-btn>
                        </div>
                    </v-card-title>
                    <v-simple-table>
                    <template v-slot:default>
                    <thead>
                        <tr>
                            <th class="text-center primary--text">
                                +
                            </th>
                            <th class="text-center primary--text">
                                -
                            </th>
                            <th class="text-center primary--text">
                                Transaction Details
                            </th>
                            <th class="text-center primary--text">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                        v-for="(item, i) in leaveDetails"
                        :key="i"
                        >
                            <td class="text-center">{{ item.addBalance }}</td>
                            <td class="text-center">{{ item.reduceBalance }}</td>
                            <td class="text-center">{{ item.txnEvent }}</td>
                            <td class="text-center">{{ item.date }}</td>
                        </tr>
                    </tbody>
                    </template>
                    </v-simple-table>
                </base-material-card>
            </v-col>
        </v-row>

        <!--Add Dialog Begin-->
        <v-dialog v-model="dialog" max-width="500px">
            <v-card>
                <v-card-title>
                <span class="headline">Add Leave Balance</span>
                </v-card-title>

                <v-card-text>
                    <v-form ref="form" v-model="valid" lazy-validation>
                        <v-row>
                            <v-col>
                                {{detailData.name}}
                            </v-col>
                            <v-col>
                                {{detailData.date}}
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-select
                                    v-model="detailData.type"
                                    :items="balanceType"
                                    attach
                                    label="Add/Reduce"
                                ></v-select>
                            </v-col>
                            <v-col>
                                <v-text-field
                                    v-model="detailData.amount"
                                    type="number"
                                    :rules="amountRule"
                                >
                                </v-text-field>
                            </v-col>
                        </v-row>
                        <!--
                        <v-row>
                            <v-col>
                                <v-textarea
                                label="Comment"
                                v-model="detailData.comment"
                                rows="3"
                                ></v-textarea>
                            </v-col>
                        </v-row>
                        -->
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
                    <v-btn :disabled="!valid" color="blue darken-1" text @click="save"> Save </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!--Add Dialog End-->
        
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
                { text: "Name", align: "start", value: "name", class: "primary--text"},
                { text: "Designation", align: "start", value: "designation", class: "primary--text" },
                { text: "Leave Balance", align: "start", value: "leavebal", class: "primary--text" },
                { text: "", align: "center", value: "detail", class: "primary--text"},
                { text: "", align: "center", value: "rowSelected"}
            ],
            loading: true,
            wait: false,
            leaveBalances: [],
            search: "",
            selectedItem: null,
            selectedDate: null,
            leaveDetails: [],
            dialog: false,
            valid: false,
            balanceType: ["Add", "Reduce"],
            detailData: {
                hrId: null,
                name: null,
                date: null,
                type: "Add",
                amount: 0,
                comment: null
            },
            addBtnValid: true,
            snack: false,
            snackColor: "success",
            snackText: "",
            roles: {}
        }),

        async created() {
            this.loading = true
            this.selectedDate = leave_api.getCurrentDate()
            this.leaveBalances = await leave_api.allLeaveBalance(this.selectedDate)
            this.roles = auth_api.getRole()
            console.log("balances", this.leaveBalances)
            this.loading = false
        },

        computed: {
            amountRule() {
                return [
                    (v) => v > 0 || " > 0",
                    (v) => v % 0.5 == 0 || "Invaild Number"
                ]
            }
        },
        methods: {
            async showDetail(item) {
                this.wait = true
                this.selectedItem = item
                this.leaveDetails = []
                this.leaveDetails = await leave_api.getLeaveBalanceDetails(this.selectedDate, item.hrid)
                console.log("detail", this.leaveDetails)
                this.addBtnValid = false
                this.wait = false
            },

            async dateChanged() {
                this.loading = true
                this.leaveBalances = await leave_api.allLeaveBalance(this.selectedDate)
                this.loading = false
            },

            addBalance() {
                if (this.$refs.form) {
                    this.$refs.form.resetValidation()
                }
                this.dialog = true
                this.detailData.name = this.selectedItem.name
                this.detailData.date = this.selectedDate
                this.detailData.hrId = this.selectedItem.hrid
            },

            async save() {
                if (!this.$refs.form.validate()) return
                this.wait = true
                this.close()
                let status = await leave_api.adjustBalance(this.detailData)
                this.show_snack(status)
                this.leaveBalances = await leave_api.allLeaveBalance(this.selectedDate)
                this.leaveDetails = await leave_api.getLeaveBalanceDetails(this.selectedDate, this.detailData.hrId)
                this.wait = false
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
        }
    }
</script>