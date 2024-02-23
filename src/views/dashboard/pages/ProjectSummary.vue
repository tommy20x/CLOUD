<template>
    <v-container fluid>
        <v-progress-linear
            class="mb-1"
            indeterminate
            color="green"
            v-if="wait">
        </v-progress-linear>
        <v-row>
            <v-col cols="12" md="5">
                <base-material-card
                color="green"
                >
                    <template v-slot:heading>
                        <div class="display-1 font-weight-light">
                            Project List
                        </div>
                    </template>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="6" sm="6">
                                <v-text-field
                                label="Project Code"
                                dense
                                v-model="search_code"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="12" md="6" sm="6">
                                <v-text-field
                                label="Project Name"
                                dense
                                v-model="search_name"
                                >
                                </v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="6" sm="6">
                                <v-text-field
                                label="Enqiry Number"
                                dense
                                v-model="search_number"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="12" md="6" sm="6">
                                <v-text-field
                                label="Client Name"
                                dense
                                v-model="search_client"
                                >
                                </v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="px-0 py-0 text-center">
                                <v-btn color="primary" small @click="searchProjects">
                                    <v-icon>mdi-magnify</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="text-right">
                                <v-btn color="blue" small elevation="8" v-on:click="project_addButtonClicked" :disabled="wait || !roles.add">
                                    New Project
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-list :disabled="wait">
                                    <v-list-item-group>
                                        <v-list-item v-for="(item, i) in projects" :key="i">
                                            <v-list-item-content v-on:click="project_listItemClicked(item)">
                                                <v-list-item-title v-text="item.prj_name"></v-list-item-title>
                                            </v-list-item-content>
                                            <v-list-item-icon @click="project_editButtonClicked(item)">
                                                <v-progress-circular
                                                    v-if="waitProject == item"
                                                    indeterminate
                                                    color="green"
                                                    :width="2"
                                                    :size="24"
                                                ></v-progress-circular>
                                                <v-icon 
                                                    v-if="waitProject != item"
                                                    color="primary"
                                                >mdi-square-edit-outline</v-icon>
                                            </v-list-item-icon>
                                        </v-list-item>
                                    </v-list-item-group>
                                </v-list>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </base-material-card>
            </v-col>
            <v-col cols="12" md="7">
                <base-material-card
                icon="mdi-notebook-edit"
                title="Phase List"
                color="purple"
                class="px-5 py-3"
                >
                    <v-row>
                        <v-col class="text-right">
                            <v-btn
                                small
                                color="blue"
                                @click="goToDetail"
                                :disabled="wait || !roles.edit"
                                elevation="8"
                            >
                                Project Detail
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field
                            label="Project Code"
                            v-model="projectCode"
                            readonly
                            >
                            </v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            label="Client"
                             v-model="projectClient"
                             readonly
                            >
                            </v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field
                            label="Project Name"
                            v-model="projectName"
                            readonly
                            >
                            </v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            label="ref.Enquiry Number"
                            v-model="projectEnqNumber"
                            readonly
                            >
                            </v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field
                            label="Approval stsatus"
                            v-model="projectApproval"
                            readonly
                            >
                            </v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field
                            label="PM"
                            v-model="projectPM"
                            readonly
                            >
                            </v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6" md="4">
                            <v-text-field readonly label="Pre sales Date" style="font-size:14px" v-model="preSalesDateRange"/>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-text-field readonly label="Billing Date" style="font-size:14px" v-model="billingDateRange"/>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-text-field readonly label="Warranty Date" style="font-size:14px"  v-model="warrantyDateRange"/>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn
                                color="purple"
                                elevation="10"
                                @click="projectApprove"
                                :disabled="!roles.edit"
                            >
                                Approve
                            </v-btn>
                        </v-col>
                    </v-row>

                    <hr>
                    <v-row>
                        <v-col>
                            <p class="text--disabled">PHASES</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-right">
                            <v-btn x-small color="purple" fab @click="phase_addButtonClicked" :disabled="!roles.edit">
                                <v-icon>mdi-plus</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-progress-linear
                                class="mb-1"
                                indeterminate
                                color="green"
                                v-if="phaseWait">
                            </v-progress-linear>
                            <v-simple-table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Active</th>
                                        <th>Editable</th>
                                        <th>Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template v-if="project">
                                        <tr v-for="(item, i) in project.phases" :key="i">
                                            <td>{{item.phaseNumber}}</td>
                                            <td>{{item.phase_opendate}}</td>
                                            <td>{{item.phase_closedate}}</td>
                                            <td>
                                                <v-icon color="primary" v-if="item.setAsDefault">mdi-check</v-icon>
                                            </td>
                                            <td>
                                                <v-icon color="primary" v-if="item.allowdEdit">mdi-check</v-icon>
                                            </td>
                                            <td>    
                                                <v-icon color="purple" @click="changePhase(item)" :disabled="!roles.edit">
                                                    mdi-square-edit-outline
                                                </v-icon>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </v-simple-table>
                        </v-col>
                    </v-row>

                    <br><hr>
                    <v-row>
                        <v-col>
                            <p class="text--disabled">DOCUMENTS</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-right">
                            <v-btn x-small color="purple" fab @click="document_addButtonClicked" :disabled="!roles.edit">
                                <v-icon>mdi-plus</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-progress-linear
                                class="mb-1"
                                indeterminate
                                color="green"
                                v-if="docWait">
                            </v-progress-linear>
                            <v-simple-table>
                                <tbody>
                                    <template v-if="project">
                                        <tr v-for="(item, i) in project.documents" :key="i">
                                            <td class="text-left">{{i + 1}}</td>
                                            <td class="text-left">{{item.documentStorefileDescription}}</td>
                                            <td class="text-center">
                                                <v-icon color="primary" :disabled="docWait" @click="showDoc(item)" class="mr-3">mdi-eye</v-icon>
                                                <v-icon color="warning" :disabled="docWait || !roles.edit" @click="deleteDoc(item)" >mdi-delete</v-icon>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </v-simple-table>
                        </v-col>
                    </v-row>
                </base-material-card>
            </v-col>
        </v-row>
        
        <!--Add project dialog-->
        <v-dialog v-model="addDialog" max-width="500px" scrollable>
            <AddProjectDialog 
                v-on:save="project_dialogSaveButtonClicked" 
                v-on:close="addDialog=false"
                v-bind:clients="clients"
                v-bind:project="project"
                v-bind:edit="editProject"
                v-bind:associates="associates"
                v-bind:dialogStatus="addDialog"
                v-bind:lastProject="lastProject"
            ></AddProjectDialog>
        </v-dialog>
        
        <!--Add phase dialog-->
        <v-dialog v-model="phaseDialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{phaseDlgTitle}}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <div>
                            <DatePicker
                                textName="Date From"
                                :date="phaseFromDate"
                                :submit="(date) => phaseFromDate = date"
                                :startDate="maxPhaseDate && maxPhaseDate"
                                :endDate="phaseToDate"
                            ></DatePicker>
                        </div>
                        <div>
                            <DatePicker
                                textName="Date To"
                                :date="phaseToDate"
                                :submit="(date) => phaseToDate = date"
                                :startDate="phaseFromDate"
                            ></DatePicker>
                        </div>
                        <v-row>
                            <v-col>
                                <v-checkbox
                                    v-model="defaultPhase"
                                    :disabled="defaultDisable"
                                >
                                    <template v-slot:label>
                                        <span style="color: #555">Active</span>
                                    </template>
                                </v-checkbox>
                            </v-col>
                            <v-col>
                                <v-checkbox
                                    v-model="allowEditPhase"
                                >
                                    <template v-slot:label>
                                        <span style="color: #555">Allow Edit</span>
                                    </template>
                                </v-checkbox>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closePhaseDialog"> Cancel </v-btn>
                    <v-btn color="blue darken-1" text @click="phase_dialogAddButtonClicked">
                        Save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--Add doc dialog-->
        <v-dialog v-model="docDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Document Manage</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form ref="docForm" lazy-validation>
                            <v-row>
                                <v-file-input
                                    accept=".xlx, .xlsx, .doc, .docs, .pdf"
                                    label="Select file"
                                    :rules="docFileRules"
                                    truncate-length="50"
                                    v-model="docFile"
                                ></v-file-input>
                            </v-row>
                            <v-row>
                                <v-text-field
                                    counter="30"
                                    label="DocTypeCode"
                                    :rules="docCodeRules"
                                    maxlength="30"
                                    v-model="docCode"
                                >
                                </v-text-field>
                            </v-row>
                            <v-row>
                                <v-textarea
                                    counter="1000"
                                    label="File Description"
                                    :rules="docDescRules"
                                    maxlength="1000"
                                    v-model="docDesc"
                                ></v-textarea>
                            </v-row>
                        </v-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDocDialog"> Cancel </v-btn>
                    <v-btn color="blue darken-1" text @click="doc_dialogAddButtonClicked">
                        Save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--Delete Dialog -->
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
import project_api from "@/apis/project.js"
import client_api from "@/apis/client.js"
import associate_api from "@/apis/associate.js"
import AddProjectDialog from './AddProjectDialog'
import DatePicker from './DatePicker'
import auth_api from "@/apis/auth.js";
import daily_api from "@/apis/daily.js";

export default {
    components: {
        AddProjectDialog,
        DatePicker,
    },

    data: () => ({
        wait: false,
        docWait: false,
        phaseWait: false,

        snack: false,
        snackColor: "success",
	    snackText: "",

        search_code: null,
        search_name: null,
        search_number: null,
        search_client: null,

        clients: [],
        projects: [],
        project: null,
        waitProject: null,

        addDialog: false,
        editProject: false,

        phaseDialog: false,
        phaseFromDate: '',
        phaseFromMenu: false,
        phaseToDate: '',
        phaseToMenu: false,
        maxPhaseDate: null,

        phase: null,
        phaseEdit: false,
        defaultPhase: false,
        allowEditPhase: false,

        associates: [],

        docDialog: false,
        docFile: null,
        docCode: null,
        docDesc: null,
        selectedDoc: null,
        dialogDelete: false,

        roles: {},
        queryCode: null,
        lastProject: null,
    }),

    computed: {
        projectName: function() {
            return (this.project) ? this.project.prj_name : ''
        },
        projectCode: function() {
            return (this.project) ? this.project.prj_code : ''
        },
        projectClient: function() {
            let name = ''
            this.project && this.clients.forEach(client => {
            if (client.id == this.project.cl_id) {
                name = client.name
                return
            }
            })
            return name
        },
        preSalesDateRange() {
            if (this.project == null) return ''
            return (this.project.prj_presalesopendate || '') + ' ~ ' + (this.project.prj_presalesclosedate || '')
        },
        billingDateRange() {
            if (this.project == null) return ''
            return (this.project.prj_executionopendate || '') + ' ~ ' + (this.project.prj_executionclosedate || '')
        },
        warrantyDateRange() {
            if (this.project == null) return ''
            return (this.project.prj_warrantyopendate || '') + ' ~ ' + (this.project.prj_warrantyclosedate || '')
        },
        projectApproval() {
            return (this.project) ? this.project.prj_approval : ''
        },
        projectEnqNumber() {
            return (this.project) ? this.project.prj_refEnqNumber : ''
        },
        
        projectPM() {
            // return (this.project) ? this.project.prj_projectmanagerhrid : ''
            if (this.project) {
                const found = this.associates.find(e => e.id == this.project.prj_projectmanagerhrid)
                if (found)
                    return found.firstname + ' ' + found.lastname
            }
            return ''
        },

        docFileRules() {
            return [
                (v) => {
                    if (!v)
                        return 'File is required'
                    else if (v.size > 2097152)
                        return ' < 2MB'
                    return true
                }
            ]
        },
        docCodeRules() {
            return [
                (v) => !!v || "Code is required",
                (v) => (v && v.trim().length > 0) || "Code is required"
            ]
        },
        docDescRules() {
            return [
                (v) => !!v || "File Description is required",
                (v) => (v && v.trim().length > 0) || "File Description is required",
            ]
        },

        phaseDlgTitle() {
            if (this.phaseEdit)
                return "Edit Phase"
            return "Add Phase"
        },

        defaultDisable() {
            if (!this.project || !this.project.phases)
                return false
            let find = false
            this.project.phases.forEach( e => {
                if (e != this.phase) {
                    if (e.setAsDefault == 1) {
                        find = true
                        return
                    }
                }
            })
            return find
        },

    },

    created: async function() {
        this.wait = true
        this.queryCode = this.$route.query.prj_code
        if (this.queryCode) {
            this.search_code = this.queryCode
            this.searchProjects()
            // const project = this.projects.find(e => e.prj_code == this.queryCode)
            // this.getProject(project)
            const temp = await project_api.getProjectWithPhase(this.queryCode)
            this.project = temp[0]
        }
        this.clients = await client_api.findAll()
        
        this.associates= await project_api.getProjectManager()
        // this.associates = temp.filter(e => e.assocationStatus == "joined")
        // console.log("associates", this.associates)
        this.lastProject = await project_api.getLastProject()
        console.log("lastProject", this.lastProject)
        this.roles = auth_api.getRole()
        this.wait = false
    },

    methods: {
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

        snack_message(color, message) {
            this.snack = true;
            this.snackColor = color
            this.snackText = message
        },
        
        async searchProjects() {
            this.wait = true
            this.projects = await project_api.findAll(this.search_code, this.search_name, this.search_number, this.search_client)
            console.log("projects", this.projects)
            this.wait = false
        },

        async project_listItemClicked(project) {
            this.wait = true
            await this.getProject(project)
            this.wait = false
        },

        async getProject(project) {
            this.waitProject = project
            const temp = await project_api.getProjectWithPhase(project.prj_code)
            this.project = temp[0]
            this.waitProject = null
            this.setMaxPhaseDate()
        },

        project_editButtonClicked: async function(project) {
            // this.selectedProject = project
            // this.sampleProject = project
            await this.getProject(project)
            this.editProject = true
            this.addDialog = true
        },
        
        project_edit: async function(selected, updated) {
            this.wait = true
            this.waitProject = selected

            const project = Object.assign(selected, updated)
            const result = await project_api.updateProject(project)
            if (result == 1) {
                const index = this.projects.indexOf(selected)
                if (index >= 0) {
                    this.projects[index] = Object.assign({}, selected, updated)
                }
                this.show_snack(true)
            } else if (result == -1) {
                this.snack_message('error', 'Project code already exist')  
            } else {
                this.show_snack(false)
            }
            
            this.waitProject = null
            this.wait = false
        },

        project_dialogSaveButtonClicked: function(params) {
            this.addDialog = false
            if (params.edit) { //edit project
                this.project_edit(this.project, params.project)
            }
            else {
                this.project_add(params.project)
            }
        },

        project_add: async function(project) {
            this.wait = true

            const result = await project_api.addProject(project)
            if (result == 1) {
                const updated = await project_api.getProjectWithPhase(project.prj_code)
                if (updated && updated.length > 0) {
                    this.projects.push(updated[0])
                }
                this.show_snack(true)
            }else if (result == -1) {
                this.snack_message('error', 'Project code already exist')  
            }  else {
                this.show_snack(false)
            }
            // this.project_reset()
            this.wait = false
        },

        project_addButtonClicked: function() {
            this.editProject = false
            this.project = this.project_sample()
            this.addDialog = true
        },

        project_sample: function() {
            return {
                prj_name: '',
                prj_code: '',
                cl_id: 0,
                prj_presalesopendate:     '', //moment().format("YYYY-MM-DD"),
                prj_presalesclosedate:    '',
                prj_executionopendate:    '',
                prj_executionclosedate:   '',
                prj_warrantyopendate:     '',
                prj_warrantyclosedate:    '',
                prj_refEnqNumber: '',   
                prj_projectmanagerhrid: 0
            }
        },

        phase_addButtonClicked: function() {
            if (!this.project)
                return
            this.phase = null
            this.setPhaseDate()
            this.phaseDialog = true
            this.defaultPhase = false
            this.allowEditPhase = false
            this.phaseEdit = false
        },

        setPhaseDate() {
            this.setMaxPhaseDate()
            this.phaseFromDate = this.maxPhaseDate
            this.phaseToDate = this.project.prj_executionclosedate
        },

        closePhaseDialog: function() {
            this.phaseDialog = false; 
        },
        
        getPhaseNumber: function(phases) {
            if (phases && phases.length > 0) {
                const numbers = phases.map((it) => it.phaseNumber)
                return Math.max.apply(Math, numbers)
            }
            return 0
        },

        phase_dialogAddButtonClicked: async function() {
            this.wait = true
            this.phaseWait = true

            this.phaseDialog = false

            if (this.phaseEdit) {
                let newPhase = {
                    "phase_opendate": this.phaseFromDate,
                    "phase_closedate": this.phaseToDate,
                    "phase_id": this.phase.phase_id,
                    "phaseNumber": this.phase.phaseNumber,
                    "phase_allowdEdit": this.allowEditPhase ? 1 : 0,
                    "phase_setAsDefault": this.defaultPhase ? 1 : 0
                }
                const tempPhases = [newPhase]
                const result = await project_api.phaseSet(this.project.prj_id, tempPhases)
                if (result) {
                    this.phase.phase_opendate = this.phaseFromDate
                    this.phase.phase_closedate = this.phaseToDate
                    this.phase.allowdEdit = this.allowEditPhase ? 1 : 0
                    this.phase.setAsDefault = this.defaultPhase ? 1 : 0
                }
                this.show_snack(result)
            } else {
                const number = this.getPhaseNumber(this.project.phases) + 1
                if (number <= 5) {
                    let newPhase = {
                        "phase_opendate": this.phaseFromDate,
                        "phase_closedate": this.phaseToDate,
                        "phase_id": 0,
                        "phaseNumber": number,
                        "phase_allowdEdit": this.allowEditPhase ? 1 : 0,
                        "phase_setAsDefault": this.defaultPhase ? 1: 0
                    }
                    const tempPhases = [newPhase]
                    // [...this.selectedProject.phases, newPhase]
                    const result = await project_api.phaseSet(this.project.prj_id, tempPhases)
                    if (result) {
                        const updated = await project_api.getProjectWithPhase(this.project.prj_code)
                        if (updated && updated.length > 0) {
                            const addedPhase = updated[0].phases.find(it => it.phaseNumber == number)
                            if (!addedPhase) {
                                console.log('Something wrong [AddPhase]');
                            }
                            else {
                                this.project.phases.push(addedPhase)
                            }
                        }
                    }
                    this.show_snack(result)
                }
            }
            this.setMaxPhaseDate()
            this.wait = false   
            this.phaseWait = false
        },

        setMaxPhaseDate () {
            // this.billEndDate = this.project.prj_executionclosedate
            if (this.project.phases.length > 0 && this.project.phases[this.project.phases.length - 1].phase_closedate)            
                this.maxPhaseDate = daily_api.getDayByDiff(this.project.phases[this.project.phases.length - 1].phase_closedate, 1)
            else
                this.maxPhaseDate = this.project.prj_executionopendate
        },

        changePhase(item) {
            console.log("item", item)
            this.phase = item
            this.phaseDialog = true
            this.defaultPhase = item.setAsDefault ? true : false
            this.allowEditPhase = item.allowdEdit ? true : false
            this.phaseEdit = true

            this.phaseFromDate = item.phase_opendate
            this.phaseToDate = item.phase_closedate
            this.project.phases.forEach( (e, i) => {
                if (e == item) {
                    if (i == 0) {
                        this.maxPhaseDate = this.project.prj_executionopendate
                        return
                    }
                    this.maxPhaseDate = this.project.phases[i - 1].phase_closedate
                }
            })
        },

        async projectApprove() {
            if (!this.project)
                return
            this.wait = true
            const result = await project_api.approveProject(this.project.prj_id)
            if (result) {
                this.project.prj_approval = "approved"
                this.show_snack(result)
            }
            this.wait = false
        },

        document_addButtonClicked() {
            if (!this.project) return

            this.$refs.docForm && this.$refs.docForm.resetValidation()
            this.docFile = null
            this.docCode = null
            this.docDesc = null
            this.docDialog = true
        },

        closeDocDialog() {
            this.docDialog = false
        },

        async doc_dialogAddButtonClicked() {
            if (!this.$refs.docForm.validate()) {
                return
            }
            this.closeDocDialog()
            this.wait = true
            this.docWait = true
            let result = await project_api.addDoc(this.project.prj_id, this.docCode, this.docDesc, this.docFile)
            if (result) {
                const temp = await project_api.getProjectWithPhase(this.project.prj_code)
                this.project.documents = temp[0].documents
            }
            this.show_snack(result)
            this.docWait = false
            this.wait = false
        },

        deleteDoc(item) {
            this.dialogDelete = true
            this.selectedDoc = item
        },

        closeDelete() {
            this.dialogDelete = false
        },

        async deleteItemConfirm() {
            this.closeDelete()
            const item = this.selectedDoc

            this.wait = true
            this.docWait = true
            let result = await project_api.deleteDoc(this.project.prj_id, item.projectDocsid, item.documentStoreid)
            if (result) {
                for (const i in this.project.documents) {
                    const e = this.project.documents[i]
                    if (item.projectDocsid == e.projectDocsid) {
                        this.project.documents.splice(i, 1)
                        break
                    }
                }
            }
            this.show_snack(result)
            this.docWait = false
            this.wait = false
        },

        async showDoc(item) {
            this.wait = true
            this.docWait = true
            const result = await project_api.getDoc(this.project.prj_id, item.projectDocsid, item.documentStoreid)

            const byteCharacters = window.atob(result.data)
            //console.log("binary", result.data)

            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            let blob = new Blob([byteArray], {
                type: item.documentStoremimetype
            }); 
            let url = window.URL.createObjectURL(blob); 

            let a = document.createElement("a");
            a.href = url;
            a.download = item.documentStorefilename;
            a.click();
            window.URL.revokeObjectURL(url);

            this.docWait = false
            this.wait = false
        },

        goToDetail() {
            if (!this.project) {
                this.snack_message("info", "Please select project")
                return
            }
            this.$router.push('/pages/project_detail?prj_code=' + this.project.prj_code)
        },

    }
}
</script>