<template>
    <v-container id="regular-tables" tag="section" fluid>
        <v-progress-linear
            indeterminate
            class="mb-1"
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
                            Projects
                        </div>
                    </template>
                    <v-card-title class="flex flex-row-reverse px-0 mx-0 py-0">
                        <v-text-field
                            label="Search"
                            append-icon="mdi-magnify"
                            @change="searchKeyChange($event)"
                        ></v-text-field>
                    </v-card-title>
                    <v-list :disabled="wait">
                        <v-list-item-group>
                            <v-list-item v-for="(item, i) in projects" :key="i">
                                <v-list-item-content v-on:click="project_listItemClicked(item)">
                                    <v-list-item-title v-text="item.prj_name"></v-list-item-title>
                                </v-list-item-content>
                                <v-list-item-icon>
                                    <v-progress-circular
                                        v-if="waitProject == item"
                                        indeterminate
                                        color="green"
                                        :width="2"
                                        :size="24"
                                    ></v-progress-circular>
                                </v-list-item-icon>
                            </v-list-item>
                        </v-list-item-group>
                    </v-list>
                </base-material-card>
            </v-col>
            <v-col cols="12" sm="12" md="9">
                <base-material-card
                icon="mdi-chart-line"
                :title="progressTitle"
                color="purple"
                class="px-5 py-3"
                >
                    <v-row>
                        <v-col cols="12" md="4">
                            <v-text-field
                                label="Project Code"
                                v-model="projectCode"
                                readonly
                            >
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field
                                label="Client"
                                v-model="clientName"
                                readonly
                            >
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field
                                label="PM"
                                v-model="pm"
                                readonly
                            >
                            </v-text-field>
                        </v-col>
                    </v-row>
                    <div>
                        <DatePicker
                            textName="Date"
                            :date="selectedDate"
                            :submit="(date) => selectedDate = date"
                            :type="datePickeerStatus"
                        ></DatePicker>
                    </div>
                    <div class="text-center">
                        <v-btn v-for="(item, i) in phaseItems" :key="i" :color="getPhaseColor(item)" fab small @click="selectPhase(item)">
                        {{ item }}
                        </v-btn>
                    </div>
                    <br>
                    <v-progress-linear
                        indeterminate
                        class="mb-1"
                        color="purple"
                        v-if="phaseLoading">
                    </v-progress-linear>             
                    
                    <template v-for="(item, i) in progress">
                        <div :key="i">
                            <p class="body-1 purple white--text py-2 px-2 my-1">{{item.name}}</p>
                            <v-expansion-panels flat hover multiple :value="[0, 1, 2, 3]">
                                <v-expansion-panel v-if="item.L1.length > 0">
                                    <v-expansion-panel-header color="grey lighten-4" ripple>
                                        <p class="body-1 mb-0 purple--text">
                                            <v-icon color="purple">mdi-numeric-1-box-outline</v-icon> Level
                                        </p>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content class="pb-0">
                                        <ProgressDetail
                                            v-bind:items="item.L1"
                                        >
                                        </ProgressDetail>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>

                                <v-expansion-panel v-if="item.L2.length > 0">
                                    <v-expansion-panel-header color="grey lighten-4" ripple>
                                        <p class="body-1 mb-0 purple--text">
                                            <v-icon color="purple">mdi-numeric-2-box-outline</v-icon> Level
                                        </p>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <ProgressDetail
                                            v-bind:items="item.L2"
                                        >
                                        </ProgressDetail>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                                
                                <v-expansion-panel v-if="item.L3.length > 0">
                                    <v-expansion-panel-header color="grey lighten-4" ripple>
                                        <p class="body-1 mb-0 purple--text">
                                            <v-icon color="purple">mdi-numeric-3-box-outline</v-icon> Level
                                        </p>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <ProgressDetail
                                            v-bind:items="item.L3"
                                        >
                                        </ProgressDetail>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                                
                                <v-expansion-panel v-if="item.L4.length > 0">
                                    <v-expansion-panel-header color="grey lighten-4" ripple>
                                        <p class="body-1 mb-0 purple--text">
                                            <v-icon color="purple">mdi-numeric-4-box-outline</v-icon> Level
                                        </p>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <ProgressDetail
                                            v-bind:items="item.L4"
                                        >
                                        </ProgressDetail>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </div>
                    </template>
                </base-material-card>
            </v-col>
        </v-row>
</v-container>
</template>

<script>
    import DatePicker from './DatePicker'
    import api from "@/apis/project.js";
    import Chart from './Chart'
    import ProgressDetail from './ProgressDetail'
    import associate_api from "@/apis/associate.js";
    import daily_api from "@/apis/daily.js";

    export default {
        components: {
            DatePicker,
            Chart,
            ProgressDetail,
        },

        data: () => ({
            wait: false,
            project: null,
            projects: [],
            initiallyOpen: ["public"],
            phases: [],
            phase: null,
            selectedPhase: null,
            waitProject: null,
            progress:[],
            phaseLoading: false,
            selectedDate: null
        }),
        
        created: async function() {
            this.wait = true
            this.selectedDate = daily_api.getToday()
            this.allProjects = await api.findAll()
            this.associates = await associate_api.findAll()
            this.projects = this.allProjects

            this.wait = false
        },

        watch: {
            selectedDate: async function(n, o) {
                if (o) {
                    if (this.project.phases.length == 0)
                        return
                    if (!this.selectedPhase) {
                        this.selectedPhase = 1
                    }

                    this.wait = true
                    this.phaseLoading = true
                    await this.getProgress()
                    this.wait = false
                    this.phaseLoading = false
                }
            }
        },

        computed: {
            clientName() {
                if (this.project)
                    return (this.project.cl_name.length > 20 ? this.project.cl_name.substring(0, 20) + '...' : this.project.cl_name)
                return null
            },

            projectCode() {
                if (this.project)
                    return this.project.prj_code
                return null
            },

            progressTitle() {
                return this.project ? this.project.prj_name : "Project Progress"
            },

            phaseItems() {
                if (this.project) {
                    let ret = []
                    console.log("project", this.project)
                    this.project.phases.forEach( e => {
                        ret.push(e.phaseNumber)
                    })
                    return ret
                }
                return []
            },
            
            pm() {
                if (this.project && this.associates) {
                    const found = this.associates.find(e => e.id == this.project.prj_projectmanagerhrid)
                    if (found)
                        return found.firstname + ' ' + found.lastname
                }
                return ''
            },

            datePickeerStatus() {
                if (!this.project || this.wait)
                    return 'disable'
                return ''
            }
        },

        methods: {
            initialize() {
                this.project = null
                this.phase = null
                this.progress = []
                this.selectedPhase = null
            },

            async project_listItemClicked(item) {
                this.wait = true
                this.waitProject = item
                this.initialize()
                const ret = await api.getProjectWithPhase(item.prj_code)
                this.project = ret[0]
                this.phases = ret[0].phases
                
                this.phases && this.phases.length > 0 && this.phases.forEach( e => {
                    if (e.setAsDefault == 1) {
                        this.selectedPhase = e.phaseNumber
                        return
                    }
                })
                if (this.selectedPhase)
                    await this.getProgress()
                this.waitProject = null
                this.wait = false
            },

            searchKeyChange: function(event) {
                this.projects = this.allProjects.filter(item => item.prj_name.toUpperCase().includes(event.toUpperCase()))
            },
            
            getPhaseColor(item) {
                if (this.selectedPhase == item)
                    return 'purple'
                return 'white'
            },
            
            async selectPhase(item) {
                if (this.wait) return
                this.wait = true
                this.phaseLoading = true
                this.selectedPhase = item
                await this.getProgress()
                this.wait = false
                this.phaseLoading = false
            },
            
            async getProgress() {
                const num = this.getPhaseNumber(this.selectedPhase)     
                this.phase = this.project.phases.find(e => e.phaseNumber == num)
                if (!this.phase.progress || this.phase.progressDate != this.selectedDate) {
                    const tempProgress = await api.getProgress(this.phase.phase_id, this.selectedDate)
                    this.progress = this.sortProgress(tempProgress)
                    this.phase.progress = this.progress
                    this.phase.progressDate = this.selectedDate
                } else {
                    this.progress = this.phase.progress
                }
                console.log('progress', this.progress)
            },

            sortProgress(item) {
                if (!item || item.length == 0)
                    return []
                let result = []
                let categoryIds = []
                item.forEach( e => categoryIds.push(e.taskCategoryID));
                categoryIds = [...new Set(categoryIds)]
                categoryIds.forEach( e => {
                    const temp = item.filter( v => v.taskCategoryID == e)
                    const categoryName = temp[0].taskCategoryName
                    const l1 = temp.filter( v => v.level == "L1")
                    const l2 = temp.filter( v => v.level == "L2")
                    const l3 = temp.filter( v => v.level == "L3")
                    const l4 = temp.filter( v => v.level == "L4")
                    result.push({
                        "name": categoryName,
                        "L1": l1,
                        "L2": l2,
                        "L3": l3,
                        "L4": l4
                    })
                })

                console.log("progress", result)
                return result
            },
            
            getPhaseNumber(phase) { 
                return phase
            },
        }
    }
</script>