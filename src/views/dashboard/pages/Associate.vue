<template>
    <v-container>
        <base-material-card
            color="green"
        >
        <template v-slot:heading>
            <div class="display-1 font-weight-light">
                Associate List
            </div>
        </template>
            <v-data-table
                :headers="headers"
                :items="associates"
                :search="search"
                :loading="loading"
                loading-text="Loading... Please wait"
                sort-by="id"
            >
                <template v-slot:top>
                    <v-container>
                        <v-row>
                            <v-col>
                                <v-text-field
                                    v-model="firstNameSearch"
                                    label="FirstName"
                                ></v-text-field>
                            </v-col>
                            <v-col>
                                <v-text-field
                                    v-model="lastNameSearch"
                                    label="LastName"
                                ></v-text-field>
                            </v-col>
                            <v-col style="display:flex; align-items:center; text-align:center;">
                                <v-btn @click="searchAssociate" color="purple" fab small :disabled="loading">
                                    <v-icon>mdi-magnify</v-icon>
                                </v-btn>
                                <v-spacer></v-spacer>
                                <v-btn
                                    color="blue"
                                    dark
                                    class="mb-2"
                                    fab
                                    @click="addItem"
                                    :disabled="loading || !roles.add"
                                >
                                    New
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                </template>

                <!--
                <template v-slot:item.assocationType="{ item, value }">
                    {{ value == 'e' ? 'Employee' : 'Consultant' }}
                </template>
                <template v-slot:item.assocationStatus="{ item, value }">
                    {{ value.toUpperCase() }}
                </template>
                -->
                <template v-slot:item.actions="{ item }">
                    <v-icon small class="mr-2" @click="editItem(item)" title="EDIT" color="primary" :disabled="!roles.edit">
                        mdi-pencil
                    </v-icon>
                    <!--
                    <v-icon small class="mr-2" @click="roleEdit(item)" title="ROLES">
                        mdi-account
                    </v-icon>
                    -->
                    <v-icon small @click="deleteItem(item)" color="warning" title="DELETE" disabled> mdi-delete </v-icon>
                </template>
            </v-data-table>
        </base-material-card>

        <AssociateDetail
            v-bind:item="this.selectedItem"
            v-bind:countries="this.countries"
            v-bind:roleData="this.roleData"
            v-bind:designations="this.designations"
            ref="detail"
        >
        </AssociateDetail>

        <!--Add Dialog Begin-->
        <v-dialog v-model="dialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                    <v-form ref="form" v-model="valid" lazy-validation>
                        <v-row>
                            <v-col cols="12" sm="12" md="12">
                                <v-select
                                    v-model="editedItem.personid"
                                    :items="people"
                                    :rules="defaultRules"
                                    v-if="editedIndex == -1"
                                    item-text="firstname"
                                    item-value="id"
                                    label="Person"
                                    required
                                ></v-select>
                                <p v-if="editedIndex > -1" style="font-size: 18px" class="text-center font-weight-bold"> {{ this.editedItem && (this.editedItem.firstname + ' ' + this.editedItem.lastname) }}</p>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" sm="12" md="6">
                                <v-select
                                    v-model="editedItem.assocationType"
                                    :items="associationTypes"
                                    :rules="defaultRules"
                                    item-text="name"
                                    item-value="value"
                                    label="Association Type"
                                    required
                                ></v-select>
                            </v-col>
                            <v-col cols="12" sm="12" md="6">
                                <v-select
                                    v-model="editedItem.assocationStatus"
                                    :items="associationStatus"
                                    :rules="defaultRules"
                                    item-text="name"
                                    item-value="value"
                                    label="Association Status"
                                    required
                                ></v-select>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-select
                                    v-model="editedItem.holidaycalid"
                                    :items="calendars"
                                    :rules="defaultRules"
                                    item-text="name"
                                    item-value="id"
                                    label="Holiday Calendars"
                                    required
                                ></v-select>
                            </v-col>
                        </v-row>
                        <!--
                        <v-row>
                            <v-col>
                                <v-select
                                    v-model="editedItem.designation"
                                    :items="designations"
                                    :rules="designationRules"
                                    attach
                                    item-text="name"
                                    item-value="id"
                                    label="Designation"
                                    required
                                    dense
                                ></v-select>
                            </v-col>
                        </v-row>
                        <v-row>
                            <DatePicker
                                textName="Designation Date"
                                :date="editedItem.designationDate"
                                :submit="(date) => editedItem.designationDate = date"
                                :type="designationType"
                            ></DatePicker>
                        </v-row>
                        -->
                        <v-row>
                            <v-col cols="12" md="6">
                                <DatePicker
                                    textName="Joining Date"
                                    :date="editedItem.JoinDateForResourcePlanning"
                                    :submit="(date) => editedItem.JoinDateForResourcePlanning = date"
                                    :endDate="editedItem.joinDate"
                                    v-bind:type="joiningType"
                                    v-bind:deletable="true"
                                ></DatePicker>
                            </v-col>
                            <v-col cols="12" md="6">
                                <DatePicker
                                    textName="Separating Date"
                                    :date="editedItem.SeperationDateForResourcePlanning"
                                    :submit="(date) => editedItem.SeperationDateForResourcePlanning = date"
                                    :startDate="editedItem.joinDate"
                                    :endDate="editedItem.seperation"
                                    v-bind:type="`optional`"
                                    v-bind:deletable="true"
                                ></DatePicker>
                            </v-col>
                            <!-- v-bind:type="`optional`" -->
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="6">
                                <DatePicker
                                    textName="Joined Date"
                                    :date="editedItem.joinDate"
                                    :submit="(date) => {editedItem.joinDate = date; joinedDateChanged(editedItem)}"
                                    :startDate="editedItem.JoinDateForResourcePlanning"
                                    :endDate="editedItem.SeperationDateForResourcePlanning"
                                    v-bind:type="joinType"
                                    v-bind:deletable="true"
                                ></DatePicker>
                            </v-col>
                            <v-col cols="12" md="6">
                                <DatePicker
                                    textName="Separated Date"
                                    :date="editedItem.seperation"
                                    :submit="(date) => editedItem.seperation = date"
                                    :startDate="editedItem.SeperationDateForResourcePlanning ? editedItem.SeperationDateForResourcePlanning : editedItem.joinDate"
                                    v-bind:type="seperateType"
                                    v-bind:deletable="true"
                                ></DatePicker>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
                    <v-btn :disabled="false" color="blue darken-1" text @click="save"> Save </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!--Add Dialog End-->

        <!--Delete Dialog Begin-->
        <v-dialog v-model="dialogDelete" max-width="600px">
            <v-card>
                <v-card-title class="headline"
                    >Are you sure?</v-card-title
                >
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="closeDelete">
                        No
                    </v-btn>
                    <v-btn color="blue darken-1" text @click="deleteItemConfirm">Yes</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!--Delete Dialog End-->

        <!--Add Role Dialog Begin-->
        <!--
        <v-dialog v-model="roleDialog" max-width="700px" >
            <v-card>
                <v-card-title>
                    <span class="headline">Roles</span><br>
                    <span>{{ getNameAndDesign() }}</span>
                </v-card-title>

                <v-card-text>
                    <v-form ref="form1" v-model="valid1" lazy-validation>
                        <v-row>
                            <v-col cols="12" sm="12" md="12">
                                <v-select
                                    :items="roleData"
                                    item-text="name"
                                    item-value="id"
                                    label="Roles"
                                    v-model="selectedRoleId"
                                    multiple
                                    required
                                    chips
                                    dense
                                    @change="roleDataChanged"
                                ></v-select>
                            </v-col>
                        </v-row>
                        <template v-for="(item, i) in selectedRoles">
                            <v-row :key="i">
                                <v-col style="display:flex; align-items:center;">
                                    {{ item.name }}
                                </v-col>
                                <v-col>
                                    <DatePicker
                                        textName="Date From"
                                        :date="item.data.effectivefromdate"
                                        :submit="(date) => item.data.effectivefromdate = date"
                                    ></DatePicker>
                                </v-col>
                                <v-col>
                                    <DatePicker
                                        textName="Date To"
                                        :date="item.data.effectivetodate"
                                        :submit="(date) => item.data.effectivetodate = date"
                                        :type="`optional`"
                                    ></DatePicker>
                                </v-col>
                                <v-btn x-small text style="margin-top: 35px" @click="removeRole(item)" title="remove">
                                    <v-icon color="pink">mdi-delete</v-icon>
                                </v-btn>
                            </v-row>
                        </template>
                        <v-row>
                            <v-col :style="roleStyle">
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeRole"> Cancel </v-btn>
                    <v-btn color="blue darken-1" text @click="saveRole"> Save </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        -->
        <!--Add Role Dialog End-->
        
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
import AssociateDetail from './AssociateDetail'

import associate_api from "@/apis/associate.js";
import role_api from "@/apis/role.js";
import designation_api from "@/apis/designation.js";
import people_api from "@/apis/people.js";
import country_api from "@/apis/country.js";
import calendar_api from "@/apis/calendar.js";
import auth_api from "@/apis/auth.js";

export default {
    components: {
        DatePicker,
        AssociateDetail
    },
    
    data: () => ({
        loading: true,
        snack: false,
        snackColor: "success",
	    snackText: "",
        valid: true,
        maxNameLength: 200,
        maxCodeLength: 20,
        maxPasswordLength: 200,
        inlineEditedCode: "",
        inlineEditedName: "",
        search: "",
        dialog: false,
        dialogDelete: false,
        associationTypes: [ 
            { name: 'Employee', value: 'e' }, 
            { name: 'Consultant', value: 'c' } 
        ],
        associationStatus: [ 
            { name: 'To Be Joined', value: 'toBeJoined' }, 
            { name: 'Joined', value: 'joined' }, 
            { name: 'Seperated', value: 'seperated' },
        ],
        headers: [
            { text: "First Name", align: "start", value: "firstname", class: "success--text" },
            { text: "Last Name", value: "lastname", class: "success--text" },
            // { text: "Email", value: "email", class: "text--success" },
            // { text: "Code", value: "code", class: "text--success" },
            // { text: "Assocation Type", value: "assocationType", class: "text--success" },
            // { text: "Assocation Status", value: "assocationStatus", class: "text--success" },
            // { text: "Joined Date", value: "joinDate" },
            { text: "Actions", align: "center", value: "actions", sortable: false, class: "success--text" },
        ],
        people: [],
        associates: [],
        countries: [],
        designations: [],
        roles: [],
        editedIndex: -1,
        editedItem: {},
        defaultItem: {
            id: 0,
            assocationType: "",
            assocationStatus: "",
            JoinDateForResourcePlanning: null,
            SeperationDateForResourcePlanning: null,
            designationDate: null,
            joinDate: "",
            seperation: null,
            holidaycalid: 0,
            personid: 0,
            firstname: "Karthik U",
            lastname: "K U",
            DOB: "",
            email: "",
            designation: '',
            role: '',
        },
        roleDialog: false,
        valid1: false,
        roleData: [],
        selectedRoles: [],
        selectedRoleId: [],
        initialRolesId: [],

        calendars: [],
        calendar: null,

        selectedItem: null,

        firstNameSearch: null,
        lastNameSearch: null,

        roles: {}
    }),

    created: async function () {
        this.editedItem = Object.assign({}, this.defaultItem)
        await this.initialize()
        this.roles = auth_api.getRole()
    },

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? "Associate (Add)" : "Associate (Edit)";
        },
        defaultRules() {
            return [(v) => !!v || 'This field is required']
        },
        codeRules() {
            return [
                (v) => !!v || "Code is required",
                (v) => /[a-zA-Z0-9]+$/.test(v) || 'Code must only contain letters',
                (v) =>
                    (v && v.length <= this.maxCodeLength) ||
                    `Code must be less than ${this.maxCodeLength} characters`,
            ];
        },
        nameRules() {
            return [
                (v) => !!v || "This field is required",
                (v) => (v && v.trim().length > 0) || "This field is required",
                (v) =>
                    (v && v.length <= 200) ||
                    `This field must be less than 200 characters`,
            ];
        },
        emptiableNameRules() {
            return [
                (v) =>
                    !v || v.length <= 200 ||
                    `This field must be less than 200 characters`,
            ];
        },
        emailRules() {
            return [
                v => !!v || 'E-mail is required',
                v => /.+@.+/.test(v) || 'E-mail must be valid',
            ]
        },
        passwordRules() {
            return [
                v => !!v || 'Password is required',
                (v) => (v && v.trim().length > 0) || "Password is required",
                (v) =>
                    (v && v.length <= this.maxPasswordLength) ||
                    `Password must be less than ${this.maxPasswordLength} characters`,
            ]
        },
        roleStyle() {
            if (this.selectedRoles.length == 0)
                return "height:200px"
            if (this.selectedRoles.length == 1)
                return "height:120px"
            if (this.selectedRoles.length == 2)
                return "height:40px"
        },

        designationRules() {
            return [
                v => {
                    if (this.editedItem && this.editedItem.assocationStatus && this.editedItem.assocationStatus == "joined") {
                        if (!v) {
                            return 'please select designation'
                        }
                    }
                    if (this.editedItem && this.editedItem.designationDate) {
                        if (!v) {
                            return 'please select designation'
                        }
                    }
                    return true
                }
            ]
        },

        designationType() {

            if (this.editedItem && this.editedItem.assocationStatus && this.editedItem.assocationStatus == "joined") {
                return ''
            }
            if (this.editedItem && this.editedItem.designation) {
                return ''
            }
            return 'optional'
        },

        joiningType() {
            if (this.editedItem && this.editedItem.assocationStatus && this.editedItem.assocationStatus == "toBeJoined") {
                return ''
            }
            return 'optional'
         
        },

        joinType() {
            if (this.editedItem && this.editedItem.assocationStatus && this.editedItem.assocationStatus == "joined") {
                return ''
            }
            return 'optional'
        },

        seperateType() {
            if (this.editedItem && this.editedItem.assocationStatus && this.editedItem.assocationStatus == "seperated") {
                return ''
            }
            return 'optional'
        }
    },

    watch: {
        dialog(val) {
            val || this.close();
        },
        dialogDelete(val) {
            val || this.closeDelete();
        },
    },

    methods: {
        async initialize() {
            this.loading = true
            this.roles = await role_api.findAll()
            this.roleData = associate_api.getRoleWithData(this.roles)

            this.people = await people_api.findPeopleToJoin()
            this.countries = await country_api.findAll()
            this.designations = await designation_api.findAll()
            this.calendars = await calendar_api.findAllCalendar()

            console.log("associates", this.associates)
            console.log("designations", this.designations)
            console.log("calendars", this.calendars)
            this.loading = false
        },

        async searchAssociate() {
            this.loading = true
            this.associates = []
            this.associates = await associate_api.findAll(this.firstNameSearch, this.lastNameSearch)
            this.loading = false
        },
        
        addItem() {
            this.openAddDialog()
        },

        editItem(item) {
            this.selectedItem = null
            this.selectedItem = item;
            this.$refs.detail && this.$refs.detail.itemChanged(item)
            // this.editedIndex = this.associates.indexOf(item);
            // this.editedItem = Object.assign({}, item);
            // this.openAddDialog()
        },

        // async roleEdit(item) {
        //     this.loading = true
        //     this.clearRoleData()
        //     this.selectedRoles = []
        //     this.selectedRoleId = []
        //     // this.editedIndex = this.associates.indexOf(item);
        //     this.editedItem = Object.assign({}, item);
        //     let one = await associate_api.findOne(item.id)
        //     this.initialRolesId = []
        //     console.log("edtiedItem", this.editedItem)
        //     console.log("one", one)

        //     let data = one[0].assignedRoles
        //     if (data && data.length > 0) {
        //         data.forEach(item=> {
        //             // let selected = this.roles.find(element => element.id == item.rolesid)
        //             // item.name = selected.name
        //             // item.recordType = "update"
        //             // this.selectedRoles.push(item.rolesid)
        //             this.roleData.forEach(role=> {
        //                 if (role.id == item.rolesid) {
        //                     role.data = item
        //                     this.selectedRoles.push(role)
        //                     this.selectedRoleId.push(role.id)
        //                     this.initialRolesId.push(role.id)
        //                 }
        //             })
        //         })
        //     }
        //     console.log("initial role", this.initialRolesId)
        //     console.log("selected role", this.selectedRoles)
        //     this.roleDialog = true
        //     this.loading = false
        // },
        
        openAddDialog() {
            if (this.$refs.form) {
                this.$refs.form.resetValidation();
            }
            this.dialog = true;
        },

        deleteItem(item) {
            this.editedIndex = this.associates.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialogDelete = true;
        },

        deleteItemConfirm() {
            this.associates.splice(this.editedIndex, 1);
            this.closeDelete();
        },

        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },

        closeDelete() {
            this.dialogDelete = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },

        async save() {
            if (!this.$refs.form.validate()) return

            const selectedIndex = this.editedIndex
            const item = Object.assign({}, this.editedItem)
            this.close();

            this.loading = true
            {
                let success = false
                if (selectedIndex > -1) {
                    if (item.initialDesignationDate == item.designationDate) {
                        // this.snack_warning("Designation date is already exist")
                    }

                    success = await associate_api.update(item) 
                    if (success) {
                        Object.assign(this.associates[selectedIndex], item);
                    }
                } 
                else {
                    const addedItem = await associate_api.add(item)
                    if (addedItem) {
                        success = true
                        // this.associates.push(addedItem);
                        // this.people = this.people.filter(e => e.id != addedItem.personid)
                        this.associates = await associate_api.findAll()
                        this.people = await people_api.findPeopleToJoin()
                    }
                }
                this.show_snack(success)
            }
            this.loading = false
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

        snack_warning(msg) {
            this.snack = true;
            this.snackColor = "warning"
            this.snackText = msg
        },

        // closeRole() {
        //     this.roleDialog = false
        // },
        
        // async saveRole() {
        //     if (!this.$refs.form1.validate()) return

        //     this.loading = true
        //     this.closeRole()
        //     this.setRecordType(this.initialRolesId, this.selectedRoleId)
        //     console.log("role data", this.roleData)
        //     let result = await associate_api.roleAssign(this.editedItem.id, this.roleData)
        //     this.show_snack(result)
        //     this.loading = false
        // },

        // roleDataChanged() {
        //     this.selectedRoles = []
        //     this.selectedRoleId.length > 0 && this.selectedRoleId.forEach(id=> {
        //         this.roleData.forEach(role=> {
        //             if (role.id == id) {
        //                 this.selectedRoles.push(role)
        //             }
        //         })
        //     })
        // },

        // getNameAndDesign() {
        //     if (this.editedItem && this.designations && this.designations.length > 0) {
        //         let des = this.designations.find(e => e.id == this.editedItem.designation)
        //         let ret = this.editedItem.firstname + ' ' + this.editedItem.lastname
        //         des && des.name && (ret += '(' + des.name + ')')
        //         return ret
        //     }
        //     return ""
        // },

        joinedDateChanged(item) {
            if (item.JoinDateForResourcePlanning == null) {
                let date = new Date(item.joinDate)
                date.setDate(date.getDate()-1)
                let result = people_api.dateToString(date)

                item.JoinDateForResourcePlanning = result
            }
        },

        // removeRole(item) {
        //     const filtered = this.selectedRoles.filter( e => e.id != item.id)
        //     this.selectedRoles = filtered

        //     const ids = this.selectedRoleId.filter( e => e != item.id)
        //     this.selectedRoleId = ids
        // },

        clearRoleData() {
            let data = this.roleData
            data && data.length > 0 && data.forEach( e => {
                e.data.effectivefromdate = null
                e.data.effectivetodate = null
                e.data.recordType = "noAction"
            })
        }
    },
};
</script>
