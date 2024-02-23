<template>
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
                    Availability
                </v-tab>

                <v-tab
                    href="#tab2"
                >
                    Roles & Responsibilities
                </v-tab>

                <v-tab
                    href="#tab3"
                >
                    Promotions & Designation
                </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tabs">
                <v-tab-item
                    :value="`tab1`"
                >
                    <v-card flat>
                        <v-card-text style="min-height: 400px">
                            <v-simple-table>
                                <template v-slot:default>
                                    <tbody>
                                        <tr>
                                            <td width="30%">Association Type</td>
                                            <td width="70%">{{ associationType }}</td>
                                        </tr>
                                        <tr>
                                            <td>Association Status</td>
                                            <td>{{ associationStatus }}</td>
                                        </tr>
                                        <tr>
                                            <td>Joining Date</td>
                                            <td>{{ ownData && ownData[0].JoinDateForResourcePlanning }}</td>
                                        </tr>
                                        <tr>
                                            <td>Joined Date</td>
                                            <td>{{ ownData && ownData[0].joinDate }}</td>
                                        </tr>
                                        <tr>
                                            <td>Holiday Calendar</td>
                                            <td>{{ ownData && ownData[0].holidayCalendarname }}</td>
                                        </tr>
                                        <tr>
                                            <td>Separating Date</td>
                                            <td>{{ ownData && ownData[0].SeperationDateForResourcePlanning }}</td>
                                        </tr>
                                        <tr>
                                            <td>Separation Date</td>
                                            <td>{{ ownData && ownData[0].seperation }}</td>
                                        </tr>
                                    </tbody>
                                </template>
                            </v-simple-table>
                        </v-card-text>
                    </v-card>
                </v-tab-item>

                <v-tab-item
                    :value="`tab2`"
                >
                    <v-card flat>
                        <v-card-text style="min-height: 400px">
                            <v-row>
                                <v-col cols="12" md="2" class="py-0 text-center">
                                    <v-icon x-large>mdi-account-tie</v-icon>
                                </v-col>
                                <v-col cols="12" md="10" class="py-0">
                                    <v-row>
                                        <v-col class="py-0">
                                            <v-text-field
                                                label="Name"
                                                filled
                                                disabled
                                                :value="getName"
                                            >
                                            </v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12" md="3" class="py-0">
                                            <v-text-field
                                                label="Name"
                                                filled
                                                disabled
                                                :value="designationName"
                                            >
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="2" class="py-0">
                                            <v-text-field
                                                label="Scale"
                                                filled
                                                disabled
                                                :value="ownScale"
                                            >
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="2" class="py-0">
                                            <v-text-field
                                                label="Grade Points"
                                                filled
                                                disabled
                                            >
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="5" class="py-0">
                                            <DatePicker
                                                textName="As on Date"
                                                :date="roleDate"
                                                :submit="(date) => roleDate = date"
                                                :type="`optional`"
                                                :fill="`fill`"
                                            ></DatePicker>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row><br>
                            <v-row>
                                <v-col class="py-0" v-for="(type, i) in roleTypes" :key="i">
                                    <p class="text-center mb-0 py-2 body-1 font-weight-bold" style="background-color: #7B1FA2; color:white">{{ type }}</p>
                                    <v-list>
                                        <v-list-item-group
                                            v-model="selectedRoles"
                                            color="primary"
                                            multiple
                                        >
                                            <template v-for="(role, i) in getRoles(type)">

                                            <v-list-item
                                                :key="i"
                                                :value="role.id"
                                            >
                                                <template v-slot:default="{ active }">
                                                    <v-list-item-content>
                                                        <v-list-item-title v-text="role.name"></v-list-item-title>
                                                    </v-list-item-content>

                                                    <v-list-item-action>
                                                        <v-checkbox
                                                        :input-value="active"
                                                        ></v-checkbox>
                                                    </v-list-item-action>
                                                </template>
                                            </v-list-item>
                                            </template>
                                        </v-list-item-group>
                                    </v-list>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="text-right">
                                    <v-btn color="primary" @click="saveRoles" elevation="10">
                                        Save
                                    </v-btn>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-progress-linear
                                        indeterminate
                                        color="primary"
                                        v-if="wait">
                                    </v-progress-linear>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
                
                <v-tab-item
                    :value="`tab3`"
                >
                    <v-card flat>
                        <v-card-text style="min-height: 400px">
                            <v-row>
                                <v-col>
                                    <v-btn
                                    class="mx-2"
                                    fab
                                    small
                                    color="primary"
                                    @click="openDesignationDialog"
                                    >
                                        <v-icon dark>
                                            mdi-plus
                                        </v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-simple-table>
                                        <template v-slot:default>
                                        <thead>
                                            <tr>
                                                <th class="text-left">
                                                    Designation
                                                </th>
                                                <th class="text-left">
                                                    Scale
                                                </th>
                                                <th class="text-left">
                                                    From
                                                </th>
                                                <th class="text-left">
                                                    To
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr
                                            v-for="(item, i) in designations" :key="i"
                                            >
                                                <td>{{ item.designationname }}</td>
                                                <td>{{ item.scaleCode ? item.scaleCode : '-'}}</td>
                                                <td>{{ item.effectivefromdate }}</td>
                                                <td>{{ item.effectivetodate ? item.effectivetodate : '-'}}</td>
                                            </tr>
                                        </tbody>
                                        </template>
                                    </v-simple-table>
                                </v-col>
                                <v-col>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-tab-item>

            </v-tabs-items>
        </v-col>
                
        <v-dialog v-model="designationDialog" max-width="500px">
            <v-card :loading="designationWait">
                <v-card-title>
                    <span class="headline">Promotion</span>
                </v-card-title>

                <v-card-text>
                    <v-form ref="form" lazy-validation>
                        <v-row>
                            <v-col cols="12" sm="12" md="12">
                                <v-select
                                    v-model="des"
                                    :items="allDes"
                                    :rules="defaultRules"
                                    item-text="name"
                                    item-value="id"
                                    label="Designation"
                                    required
                                ></v-select>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-select
                                    v-model="scale"
                                    :items="getScales"
                                    :rules="defaultRules"
                                    item-text="name"
                                    label="Scale"
                                    required
                                ></v-select>
                            </v-col>
                        </v-row>
                        <v-row>
                            <DatePicker
                                textName="Designation Date"
                                :date="designationDate"
                                :submit="(date) => designationDate = date"
                            ></DatePicker>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDesignation"> Cancel </v-btn>
                    <v-btn :disabled="false" color="blue darken-1" text @click="saveDesignation"> Save </v-btn>
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
    </v-row>
</template>

<script>
import DatePicker from './DatePicker'
import associate_api from "@/apis/associate.js";

export default {
    components: {
        DatePicker,
    },

    name: "ProfessionalDetail",
    props: ["item", "roleData", "roleTypes", "hrId", "allDes"],

    data: () => ({
        tabs: [],
        selectedRoles: [],
        initialRoles: [],
        designations: [],
        snack: false,
        snackColor: "success",
	    snackText: "",
        wait: false,
        roleDate: null,

        designationDialog: false,
        des: null,
        designationDate: null,
        scales: [],
        scale: null,

        designationWait: false,
        ownData: []
    }),

    computed: {
        getName() {
            if (this.ownData && this.ownData.length > 0 && this.ownData[0].personalInfo[0])
                return this.ownData[0].personalInfo[0].firstname + ' ' + this.ownData[0].personalInfo[0].lastname
            return ''
        },

        associationType() {
            if (this.ownData && this.ownData[0].assocationType == 'e')
                return "Employee"
            if (this.ownData && this.ownData[0].assocationType == 'c')
                return "Consultant"
            return ""
        },

        associationStatus() {
            if (this.ownData && this.ownData[0].assocationStatus == 'toBeJoined')
                return "To Be Joined"
            if (this.ownData && this.ownData[0].assocationStatus == 'joined')
                return "Joined"
            if (this.ownData && this.ownData[0].assocationStatus == 'seperated')
                return "Seperated"
            return ""
        },

        designationName() {
            if (this.ownData && this.ownData.length > 0 && this.ownData[0].designations.length)
                return this.ownData[0].designations[0].designationname 
            return ''
        },

        defaultRules() {
            return [
                (v) => !!v || 'required'
            ]
        },

        getScales() {
            if (this.allDes && this.allDes.length > 0 && this.des) {
                const found = this.allDes.find( e => e.id == this.des)
                if (found.scalecodes)
                    return found.scalecodes
            }
            return []
        },

        ownScale() {
            if (this.ownData && this.ownData.length > 0 && this.ownData[0].designations && this.ownData[0].designations.length > 0)
                return this.ownData[0].designations[0].scaleCode 
            return ''
        }
    },

    watch: {
        item: function(newValue, oldValue) {
            console.log("new item", newValue)
            if (newValue) {
                this.selectedRoles = []
                this.initialRoles = []
                this.ownData = newValue
                this.getData()
                this.roleDate = ''
            }
        }
    },

    created() {
        this.ownData = this.item
        this.getData()
    },

    methods: {
        getRoles(type) {
            const filtered = this.roleData.filter( e => e.roleType == type)
            return filtered
        },

        itemChanged() {
        },

        getData() {
            console.log("get data", this.ownData)
            if (this.ownData && this.ownData.length >0 && this.ownData[0].assignedRoles.length > 0) {
                this.ownData[0].assignedRoles.forEach( e => {
                    this.selectedRoles.push(e.rolesid)
                    this.initialRoles.push(e.rolesid)

                    this.roleData.forEach( e1 => {
                        if (e.rolesid == e1.id) {
                            e1.data.id = e.id
                        }
                    })
                })
                this.designations = this.ownData[0].designations
                this.designations.sort((a, b) => {
                    if (a.effectivefromdate > b.effectivefromdate)
                        return -1
                    if (a.effectivefromdate < b.effectivefromdate)
                        return 1
                    return 0
                })
                console.log("first role data", this.roleData)
            }
        },

        roleSelect(role) {
            console.log("role", role)
        },

        async saveRoles() {
            if (this.roleDate == null) {
                this.snack_message("Please input as on date!")
                return
            }
            this.wait = true
            this.setRecordType(this.initialRoles, this.selectedRoles)
            console.log("before save", this.roleData)
            let result = await associate_api.roleAssign(this.hrId, this.roleData, this.roleDate)
            if (result) {
                this.getData()
            }
            this.roleData.forEach(e => e.data.recordType ="noAction")

            this.show_snack(result)
            this.wait = false
        },

        setRecordType(initalIds, selectedIds) {
            let addedIds = selectedIds.filter(x => initalIds.indexOf(x) === -1)
            let removedIds = initalIds.filter(x => selectedIds.indexOf(x) === -1)
            let updatedIds = selectedIds.filter(x => addedIds.indexOf(x) === -1)
            addedIds.length > 0 && this.roleData.forEach(role => {
                addedIds.forEach(added => {
                    if (role.id == added)
                        role.data.recordType = "newLine"
                })  
            })
            removedIds.length > 0 && this.roleData.forEach(role => {
                removedIds.forEach(added => {
                    if (role.id == added)
                        role.data.recordType = "removeLine"

                })
            })
            updatedIds.length > 0 && this.roleData.forEach(role => {
                updatedIds.forEach(added => {
                    if (role.id == added)
                        role.data.recordType = "update"
                })
            })
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

        snack_message(message) {
            this.snack = true;
            this.snackColor = "warning"
            this.snackText = message
        },

        initializeDesignationValues() {
            this.des = null
            this.scale = null
            this.designationDate = null
        },

        openDesignationDialog() {
            if (this.$refs.form) this.$refs.form.resetValidation()
            this.initializeDesignationValues()
            this.designationDialog = true
        },

        closeDesignation() {
            this.designationDialog = false
        },

        async saveDesignation() {
            if (!this.$refs.form.validate()) return

            this.designationWait = true
            let success
            if (this.designations.length > 0) {
                success = associate_api.addDesignation(this.hrId, this.designationDate, this.des, this.designations[0].designationid, this.scale)
            } else {
                success = associate_api.addDesignation(this.hrId, this.designationDate, this.des, 0, this.scale)
            }
            // success = await associate_api.addDesignation(this.hrId, this.designationDate, this.des, this.scale)
            if (success) {
                const found = this.allDes.find( e => e.id == this.des)
                console.log("found", found)
                this.designations.unshift({
                    designationcode: found.code,
                    designationid: found.id,
                    designationname: found.name,
                    scaleCode: this.scale,
                    effectivefromdate: this.designationDate,
                    effectivetodate: null,
                    designationscalecodes: found.scalecodes
                })
            }
            this.show_snack(success)
            this.designationWait = false
            this.closeDesignation()
        }
    }
}
</script>