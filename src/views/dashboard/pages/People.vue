<template>
    <v-container id="regular-tables" tag="section">
        <base-material-card
        color="green"
        >
        <template v-slot:heading>
            <div class="display-1 font-weight-light">
            People List
            </div>
        </template>
            <v-data-table
                :headers="headers"
                :items="people"
                :search="search"
                :loading="loading"
                loading-text="Loading... Please wait"
                sort-by="id"
            >
                <template v-slot:top>
                    <v-container>
                        <div class="d-flex flex-row-reverse" flat tile>
                            <v-btn
                                color="blue"
                                class="mb-2"
                                fab
                                @click="addItem"
                                :disabled="!roles.add"
                            >
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
                        <v-dialog v-model="dialog" max-width="600px">
                            <v-card>
                                <v-card-title>
                                    <span class="headline">{{ formTitle }}</span>
                                </v-card-title>

                                <v-card-text>
                                    <v-form ref="form" v-model="valid" lazy-validation>
                                        <v-row>
                                            <v-col cols="12" sm="6" md="6">
                                                <v-text-field
                                                    v-model="editedItem.firstname"
                                                    :rules="nameRules"
                                                    :counter="maxNameLength"
                                                    label="First Name"
                                                    required
                                                ></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="6">
                                                <v-text-field
                                                    v-model="editedItem.lastname"
                                                    :rules="nameRules"
                                                    :counter="maxNameLength"
                                                    label="Last Name"
                                                    required
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="6" md="6">
                                                <v-select
                                                    v-model="editedItem.gender"
                                                    :items="genderList"
                                                    :rules="genderRules"
                                                    attach
                                                    item-text="name"
                                                    item-value="value"
                                                    label="Gender"
                                                ></v-select>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="6">
                                                <v-select
                                                    v-model="editedItem.COO"
                                                    :items="countries"
                                                    :rules="countryRules"
                                                    attach
                                                    item-text="name"
                                                    item-value="id"
                                                    label="Country of Origin"
                                                ></v-select>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col>
                                                <DatePicker
                                                    textName="Date of Birth (yyyy-mm-dd)"
                                                    :date="editedItem.DOB"
                                                    :submit="(date) => editedItem.DOB = date"
                                                    v-bind:type="`birth`"
                                                ></DatePicker>
                                            </v-col>
                                            <v-col>
                                                <v-text-field
                                                    v-model="editedItem.email"
                                                    :rules="emailRules"
                                                    label="Email"
                                                    :error-messages="emailError"
                                                    @keydown="emailKeypressed()"
                                                    required
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="6" md="6">
                                                <v-text-field
                                                    v-model="editedItem.fullNameOfFather"
                                                    label="Father's Full Name"
                                                    :counter="maxNameLength"
                                                    maxlength="100"
                                                ></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="6">
                                                <v-text-field
                                                    v-model="editedItem.fullNameOfMother"
                                                    :counter="maxNameLength"
                                                    maxlength="100"
                                                    label="Mother's Full Name"
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="12" md="12">
                                                <v-text-field
                                                    v-model="editedItem.pwd"
                                                    :append-icon="passwordShow ? 'mdi-eye' : 'mdi-eye-off'"
                                                    :type="passwordShow ? 'text' : 'password'"
                                                    :counter="maxNameLength"
                                                    :rules="passwordRules"
                                                    @click:append="passwordShow = !passwordShow"
                                                    label="Password"
                                                    autocomplete="new-password"
                                                    required>
                                                    <template v-slot:append-outer>
                                                        <v-btn
                                                        class="mt-1"
                                                        color="teal"
                                                        elevation="2"
                                                        x-small
                                                        @click="generatePassword()"
                                                        >Generate</v-btn>
                                                    </template>
                                                </v-text-field>
                                            </v-col>
                                        </v-row>
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

                        <!--Delete Dialog Begin-->
                        <v-dialog v-model="dialogDelete" max-width="600px">
                            <v-card>
                                <v-card-title class="headline"
                                    >Are you sure you want to delete this item?</v-card-title
                                >
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="blue darken-1" text @click="closeDelete">
                                        Cancel
                                    </v-btn>
                                    <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
		            	<!--Delete Dialog End-->

                        <!--Address Dialog Begin-->
                        <v-dialog v-model="addressDialog" max-width="600px">
                            <v-card>
                                <v-card-title class="headline">Address</v-card-title>

                                <v-tabs dark fixed-tabs>
                                    <v-tabs-slider></v-tabs-slider>

                                    <v-tabs v-model="tabModel" background-color="primary">
                                        <v-tab
                                            v-for="i in 2"
                                            :key="i"
                                            :href="`#tab-${i}`"
                                            >
                                            {{tabName(i)}}
                                        </v-tab>
                                    </v-tabs>
                                    
                                    <v-tabs-items v-model="tabModel"> 
                                        <v-tab-item :value="`tab-1`">
                                            <v-card flat>
                                                <v-card-text>
                                                    <v-form ref="form1" lazy-validation>
                                                        <v-container>
                                                            <v-row>
                                                                <v-col>
                                                                    <v-select
                                                                        v-model="localAddressItem.countryid"
                                                                        :items="countries"
                                                                        attach
                                                                        item-text="name"
                                                                        item-value="id"
                                                                        label="Country"
                                                                        :rules="addressCountryRule"
                                                                    ></v-select>
                                                                </v-col>
                                                            </v-row>
                                                            <v-row>
                                                                <v-col>
                                                                    <v-text-field
                                                                        v-model="localAddressItem.addressLine1"
                                                                        label="Address Line1"
                                                                    ></v-text-field>
                                                                </v-col>
                                                                <v-col>
                                                                    <v-text-field
                                                                        v-model="localAddressItem.addressLine2"
                                                                        label="Address Line2"
                                                                    ></v-text-field>
                                                                </v-col>
                                                            </v-row>
                                                            <v-row>
                                                                <v-col>
                                                                    <v-text-field
                                                                        v-model="localAddressItem.addressLine3"
                                                                        label="Address Line3"
                                                                    ></v-text-field>
                                                                </v-col>
                                                                <v-col>
                                                                    <v-text-field
                                                                        v-model="localAddressItem.addressLine4"
                                                                        label="Address Line4"
                                                                    ></v-text-field>
                                                                </v-col>
                                                            </v-row>
                                                            <v-row>
                                                                <v-col>
                                                                    <v-text-field
                                                                        v-model="localAddressItem.zipcode"
                                                                        label="Zip Code"
                                                                    ></v-text-field>
                                                                </v-col>
                                                                <v-col>
                                                                    <v-text-field
                                                                        v-model="localAddressItem.state_province"
                                                                        label="Province"
                                                                    ></v-text-field>
                                                                </v-col>
                                                            </v-row>
                                                        </v-container>
                                                    </v-form>
                                                </v-card-text>
                                            </v-card>
                                        </v-tab-item>
                                        <v-tab-item :value="`tab-2`">
                                            <v-card flat>
                                                <v-card-text>
                                                    <v-form ref="form2" lazy-validation>
                                                        <v-container>
                                                            <v-row>
                                                                <v-col>
                                                                    <v-select
                                                                        v-model="permanentAddressItem.countryid"
                                                                        :items="countries"
                                                                        attach
                                                                        item-text="name"
                                                                        item-value="id"
                                                                        label="Country"
                                                                        :rules="addressCountryRule"
                                                                    ></v-select>
                                                                </v-col>
                                                            </v-row>
                                                            <v-row>
                                                                <v-col>
                                                                    <v-text-field
                                                                        v-model="permanentAddressItem.addressLine1"
                                                                        label="Address Line1"
                                                                    ></v-text-field>
                                                                </v-col>
                                                                <v-col>
                                                                    <v-text-field
                                                                        v-model="permanentAddressItem.addressLine2"
                                                                        label="Address Line2"
                                                                    ></v-text-field>
                                                                </v-col>
                                                            </v-row>
                                                            <v-row>
                                                                <v-col>
                                                                    <v-text-field
                                                                        v-model="permanentAddressItem.addressLine3"
                                                                        label="Address Line3"
                                                                    ></v-text-field>
                                                                </v-col>
                                                                <v-col>
                                                                    <v-text-field
                                                                        v-model="permanentAddressItem.addressLine4"
                                                                        label="Address Line4"
                                                                    ></v-text-field>
                                                                </v-col>
                                                            </v-row>
                                                            <v-row>
                                                                <v-col>
                                                                    <v-text-field
                                                                        v-model="permanentAddressItem.zipcode"
                                                                        label="Zip Code"
                                                                    ></v-text-field>
                                                                </v-col>
                                                                <v-col>
                                                                    <v-text-field
                                                                        v-model="permanentAddressItem.state_province"
                                                                        label="Province"
                                                                    ></v-text-field>
                                                                </v-col>
                                                            </v-row>
                                                        </v-container>
                                                    </v-form>
                                                </v-card-text>
                                            </v-card>
                                        </v-tab-item>
                                    </v-tabs-items>                                 
                                </v-tabs>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="blue darken-1" text @click="closeAddress">
                                        Cancel
                                    </v-btn>
                                    <v-btn :disabled="addressBtnValid" color="blue darken-1" text @click="updateAddress">OK</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                        <!--Address Dialog End-->
                    </v-container>
                </template>

                <template v-slot:item.gender="{ value }">
                    {{ value == 'm'? 'Male' : 'Female' }}
                </template>

                <template v-slot:item.actions="{ item }">
                    <v-icon small class="mr-2" @click="editItem(item)" title="edit" color="primary" :disabled="!roles.edit">
                        mdi-pencil
                    </v-icon>
                    <v-icon small class="mr-2" @click="editAddress(item)" title="Address" color="cyan" :disabled="!roles.edit">
                        mdi-map-marker
                    </v-icon>
                    <v-icon small disabled @click="deleteItem(item)">
                        mdi-delete
                    </v-icon>
                </template>

                <template v-slot:no-data>
                    <v-btn color="primary" small outlined @click="initialize"> Reset </v-btn>
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
import people_api from "@/apis/people.js";
import country_api from "@/apis/country.js";
import auth_api from "@/apis/auth.js";

export default {
    components: {
        DatePicker,
    },
    
    data: () => ({
        loading: true,
        snack: false,
        snackColor: "success",
	    snackText: "",
        valid: true,
        maxNameLength: 100,
        maxCodeLength: 20,
        maxPasswordLength: 200,
        inlineEditedCode: "",
        inlineEditedName: "",
        search: "",
        dialog: false,
        dialogDelete: false,
        genderList: [ {name: 'Male', value: 'm'}, { name: 'Female', value: 'f' } ],
        headers: [
            { text: "First Name", align: "start", value: "firstname", class:"success--text" },
            { text: "Last Name", value: "lastname", class:"success--text" },
            { text: "Gender", value: "gender", class:"success--text" },
            { text: "Date of Birth", value: "DOB", class:"success--text" },
            { text: "Email", value: "email", class:"success--text" },
            { text: "Actions", align: "right", value: "actions", sortable: false, class:"success--text" },
        ],
        people: [],
        countries: [],
        editedIndex: -1,
        editedItem: {},
        defaultItem: {
            id: 0,
            firstname: "",
            lastname: "",
            gender: "",
            country: 0,
            fullNameOfFather: "",
            fullNameOfMother: "",
            email: "",
            pwd: "",
            DOB: '',
            COO: 0,
        },

        addressDialog: false,
        valid1: true,
        initialAddressItem: {
            id: 0,
            addressLine1: "",
            addressLine2: "",
            addressLine3: "",
            addressLine4: "",
            countryid: 0,
            zipcode: "",
            state_province: ""
        },
        localAddressItem: {},
        permanentAddressItem: {},
        tabModel: null,
        passwordShow: false,
        emailError: "",
        roles: {}
    }),

    created: async function () {
        this.editedItem = Object.assign({}, this.defaultItem)
        await this.initialize()
        this.roles = auth_api.getRole()
    },

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? "Add People" : "Edit People";
        },
        codeRules() {
            return [
                (v) => !!v || "Code is required",
                (v) => /[a-zA-Z0-9]+$/.test(v) || 'Code must only contain letters',
                // (v) =>
                //     (v && v.length <= this.maxCodeLength) ||
                //     `Code must be less than ${this.maxCodeLength} characters`,
            ];
        },
        nameRules() {
            return [
                (v) => !!v || "This field is required",
                (v) => (v && v.trim().length > 0) || "This field is required",
                (v) =>
                    (v && v.length <= this.maxNameLength) ||
                    `This field must be less than ${this.maxNameLength} characters`,
            ];
        },
        genderRules() {
            return [
                (v) => !!v || "Gender is required"
            ]
        },
        countryRules() {
            return [
                (v) => !!v || "Country is required"
            ]
        },
        emptiableNameRules() {
            return [
                // (v) =>
                //     !v || v.length <= 200 ||
                //     `This field must be less than 200 characters`,
            ];
        },
        emailRules() {
            return [
                // v => !!v || 'E-mail is required',
                v =>  {
                    if (!v) {
                        return true
                    } else if (!/.+@.+/.test(v)) {
                        return 'E-mail must be valid'
                    }
                    return true
                }
            ]
        },
        passwordRules() {
            return [
                v => !!v || 'Password is required',
                (v) => (v && v.trim().length > 0) || "Password is required",
                (v) => (v && v.length >= 8) || ` > 8 `,
                (v) =>
                    (v && v.length <= this.maxNameLength) ||
                    `Password must be less than ${this.maxNameLength} characters`,
            ]
        },
        addressCountryRule() {
            return [
                v => !!v || 'Country is required'
            ]
        },
        addressLineRule() {
            return [
                (v) => !!v || "Address is required",
                (v) => (v && v.trim().length > 0) || "Address is required",
                // (v) =>
                //     (v && v.length <= 200) ||
                //     `Address must be less than 200 characters`,
            ];
        },
        addressBtnValid() {
            let addressItem
            if (this.tabModel == "tab-1") {
                addressItem = this.localAddressItem
            } else if (this.tabModel == "tab-2") {
                addressItem = this.permanentAddressItem
            }

            return !(addressItem && addressItem.countryid)
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
            this.people = await people_api.findAll()
            console.log("people", this.people)
            this.countries = await country_api.findAll()
            this.loading = false;
        },

        addItem() {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.openAddDialog()
        },

        editItem(item) {
            this.editedIndex = this.people.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.openAddDialog()
        },
        
        async editAddress(item) {
            this.loading = true
            
            this.editedItem = Object.assign({}, item);
            let people = await people_api.findOne(item.id)
            console.log("people", people)

            if (people[0].localAddress[0]) {
                this.localAddressItem = people[0].localAddress[0]
            } else {
                this.localAddressItem = Object.assign({}, this.initialAddressItem)
            }
            
            if (people[0].permanentaddress[0]) {
                this.permanentAddressItem = people[0].permanentaddress[0]
            } else {
                this.permanentAddressItem = Object.assign({}, this.initialAddressItem)
            }

            this.loading = false    
            console.log("localAddressItem   ", this.localAddressItem)
            console.log("permanentAddressItem", this.permanentAddressItem)
            this.openAddressDialog()
        },

        openAddDialog() {
            this.emailError = ""
            if (this.$refs.form) {
                this.$refs.form.resetValidation();
            }
            this.dialog = true;
        },

        openAddressDialog() {
            if (this.$refs.form1) {
                this.$refs.form1.resetValidation()
            }
            if (this.$refs.form2) {
                this.$refs.form2.resetValidation()
            }
            this.addressDialog = true
        },

        closeAddress() {
            this.addressDialog = false
        },

        async updateAddress() {
            this.loading = true

            let result
            if (this.tabModel == "tab-1") {
                if (!this.$refs.form1.validate()) return
                this.closeAddress()
                result = await people_api.updateLocalAddress(this.editedItem.id, this.localAddressItem) 
                
            }
            if (this.tabModel == "tab-2") {
                if (!this.$refs.form2.validate()) return
                this.closeAddress()
                result = await people_api.updatePermanentAddress(this.editedItem.id, this.permanentAddressItem)
            }
            this.show_snack(result)
            console.log("result", result)
            this.loading = false
        },

        deleteItem(item) {
            this.editedIndex = this.people.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialogDelete = true;
        },

        deleteItemConfirm() {
            this.people.splice(this.editedIndex, 1);
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
            if (!this.$refs.form.validate()) {
                return;
            }	

            const selectedIndex = this.editedIndex
            const item = Object.assign({}, this.editedItem)

            console.log('item', item)
            this.loading = true
            {
                let emailcheck
                let success = false

                if (selectedIndex > -1) {
                    if (item.email) {
                        emailcheck = await people_api.checkEmailToBeUpdated(item.email, item.id) 
                        if (!emailcheck) {
                            this.emailError = "Email is already exist"
                            this.loading = false
                            return
                        }
                    }
                    this.close()

                    success = await people_api.update(item) 
                    if (success) {
                        Object.assign(this.people[selectedIndex], item);
                    }
                } 
                else {
                    if (item.email) {
                        emailcheck = await people_api.checkEmailToBeAdded(item.email) 
                        if (!emailcheck) {
                            this.emailError = "Email is already exist"
                            this.loading = false
                            return
                        }
                    }
                    this.close()    

                    const addedItem = await people_api.add(item)
                    if (addedItem) {
                        success = true
                        this.people.push(addedItem);
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

        tabName(i) {
            if (i == 1) return "LocalAddress"
            else if (i == 2) return "PermanantAddress"
        },

        generatePassword() {
            let chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
            let pass = "";
            for (let x = 0; x < 8; x++) {
                let i = Math.floor(Math.random() * chars.length);
                pass += chars.charAt(i);
            }
            this.editedItem.pwd = pass
        },

        emailKeypressed: function() {
            this.emailError = ""
        }
    },
};
</script>
