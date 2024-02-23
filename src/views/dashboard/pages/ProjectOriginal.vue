<template>
    <v-container id="regular-tables" tag="section" fluid>
        <v-progress-linear
            class="mb-1"
            indeterminate
            color="green"
            v-if="wait">
        </v-progress-linear>
        <v-row>
            <v-col cols="12" sm="12" md="3">
                <base-material-card
                color="green"
                >
                <template v-slot:heading>
                    <div class="display-1 font-weight-light">
                    Project List
                    </div>
                </template>
                    <v-card-title class="flex flex-row-reverse px-0 mx-0">
                        <v-btn small :disabled="wait" v-on:click="project_addButtonClicked" color="pink" text class="py-5">New Project</v-btn>
                    </v-card-title>
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
                </base-material-card>
            </v-col>
            <v-col cols="12" sm="12" md="9">
                <ProjectDetails 
                    v-on:addPhase="phase_addButtonClicked"
                    v-bind:project="this.selectedProject"
                    v-bind:clients="this.clients"
                ></ProjectDetails>
                <div v-if="this.selectedProject != null">
                    <ProjectPhase
                        v-for="(phase, i) in this.selectedProject.phases" :key="phase.phase_id"
                        v-bind:phase="phase"
                        v-bind:treeItems="treeItems"
                        v-bind:projectId="selectedProject.prj_id"
                        v-bind:previousPhaseDate="selectedProject.phases[i-1] && selectedProject.phases[i-1].phase_closedate && selectedProject.phases[i-1].phase_closedate"
                    ></ProjectPhase>
                </div>
            </v-col>
        </v-row>

        <!--Add project dialog-->
        <v-dialog v-model="addDialog" max-width="500px">
            <AddProjectDialog 
                v-on:save="project_dialogSaveButtonClicked" 
                v-on:close="addDialog=false"
                v-bind:clients="clients"
                v-bind:project="sampleProject"
                v-bind:edit="editProject"
            ></AddProjectDialog>
        </v-dialog>

        <!--Add phase dialog-->
        <v-dialog v-model="phaseDialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">Add Phase</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <DatePicker
                                textName="Date From"
                                :date="phaseFromDate"
                                :submit="(date) => phaseFromDate = date"
                                :startDate="maxPhaseDate && maxPhaseDate"
                                :endDate="phaseToDate"
                            ></DatePicker>
                        </v-row>
                        <v-row>
                            <DatePicker
                                textName="Date To"
                                :date="phaseToDate"
                                :submit="(date) => phaseToDate = date"
                                :startDate="phaseFromDate"
                            ></DatePicker>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closePhaseDialog"> Cancel </v-btn>
                    <v-btn :disabled="phaseValid" color="blue darken-1" text @click="phase_dialogAddButtonClicked">
                        Save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
</v-container>
</template>

<script>
import api from "@/apis/project.js";
import client_api from "@/apis/client.js";
import ProjectDetails from './ProjectDetails'
import AddProjectDialog from './AddProjectDialog'
import ProjectPhase from './ProjectPhase'
import DatePicker from './DatePicker'

export default {
    components: {
        ProjectDetails,
        AddProjectDialog,
        ProjectPhase,
        DatePicker,
    },

    data: () => ({
        projects: [],
        clients: [],
        wait: false,
        waitProject: null,
        selectedProject: null,
        sampleProject: {},
        editProject: false,
        addDialog: false,
        initiallyOpen: ["public"],
        treeItems: [],
        phaseDialog: false,
        phaseFromDate: '',
        phaseFromMenu: false,
        phaseToDate: '',
        phaseToMenu: false,
        maxPhaseDate: null
    }),

    created: async function() {
        this.wait = true
        this.treeItems = await api.getTree()
        this.clients = await client_api.findAll()
        this.projects = await api.getProjects()

        console.log("tree", this.treeItems)
        this.wait = false
    },

    computed: {
        phaseValid() {
            if (this.phaseFromDate && this.phaseToDate)
                return false
            return true
        },
    },

    methods: {
        submit: function () {},
        
        project_listItemClicked: async function(project) {
            if (!project.updated) {
                this.wait = true
                this.waitProject = project
                
                await api.updateTaskList(project)
                this.wait = false
                this.waitProject = null
            }
            this.selectedProject = project
            this.setMaxPhaseDate()
            console.log("selectedProject", this.selectedProject)
        },

        project_addButtonClicked: function() {
            console.log('project_addButtonClicked')
            this.editProject = false
            this.sampleProject = this.project_sample()
            this.addDialog = true
        },

        project_editButtonClicked: function(project) {
            console.log('project_editButtonClicked')
            this.selectedProject = project
            this.sampleProject = project
            this.editProject = true
            this.addDialog = true
        },

        project_dialogSaveButtonClicked: function(params) {
            this.addDialog = false
            if (params.edit) { //edit project
                this.project_edit(this.selectedProject, params.project)
            }
            else {
                this.project_add(params.project)
            }
        },

        project_add: async function(project) {
            this.wait = true

            const result = await api.addProject(project)
            if (result) {
                const updated = await api.getProjectWithPhase(project.prj_code)
                    if (updated && updated.length > 0) {
                        this.projects.push(updated[0])
                    }
            }
            this.project_reset()
            this.wait = false
        },

        project_edit: async function(selected, updated) {
            this.wait = true
            this.waitProject = selected

            const project = Object.assign(selected, updated)
            const result = await api.updateProject(project)
            if (result) {
                const index = this.projects.indexOf(selected)
                if (index >= 0) {
                    this.projects[index] = Object.assign({}, selected, updated)
                }
            }
            this.project_reset()
            
            this.waitProject = null
            this.wait = false
        },

        project_reset: function() {
            
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
            }
        },

        phase_addButtonClicked: function() {
            this.phaseFromDate = ''
            this.phaseToDate = ''
            this.phaseDialog = true
        },

        phase_dialogAddButtonClicked: async function() {
            console.log('phase_dialogAddButtonClicked', this.selectedProject)
            const number = this.getPhaseNumber(this.selectedProject.phases) + 1
            if (number <= 5) {
                this.phaseDialog = false
                this.wait = true

                let newPhase = {
                    "phase_opendate": this.phaseFromDate,
                    "phase_closedate": this.phaseToDate,
                    "phase_id": 0,
                    "phaseNumber": number,
                    "serverItems": []
                }
                const tempPhases = [newPhase]
                // [...this.selectedProject.phases, newPhase]
                const result = await api.phaseSet(this.selectedProject.prj_id, tempPhases)
                if (result) {
                    const updated = await api.getProjectWithPhase(this.selectedProject.prj_code)
                    if (updated && updated.length > 0) {
                        const addedPhase = updated[0].phases.find(it => it.phaseNumber == number)
                        if (!addedPhase) {
                            console.log('Someting wrong [AddPhase]');
                        }
                        else {
                            this.selectedProject.phases.push(addedPhase)
                        }
                    }
                }
                this.setMaxPhaseDate()
                this.wait = false
            }
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

        savePhases: async function() {
            this.wait = true
            const project = this.selectedProject
            const result = await api.phaseSet(project.prj_id, project.phases)
            if (result) {
                const updated = await api.getProjectWithPhase(project.prj_code)
                if (updated && updated.length > 0) {
                    const addedPhase = updated[0].phases.find(it => it.phaseNumber == number)
                    if (!addedPhase) {
                        console.log('Someting wrong [AddPhase]');
                    }
                    else {
                        project.phases.push(addedPhase)
                    }
                }
            }
            this.wait = false
        },

        setMaxPhaseDate () {
            if (this.selectedProject.phases.length > 0 && this.selectedProject.phases[this.selectedProject.phases.length - 1].phase_closedate)            
                this.maxPhaseDate = this.selectedProject.phases[this.selectedProject.phases.length - 1].phase_closedate
        }
    },
};
</script>
