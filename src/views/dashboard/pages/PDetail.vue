<template>
    <v-container>
        <v-progress-linear
            class="mb-1"
            indeterminate
            color="green"
            v-if="wait">
        </v-progress-linear>
        <base-material-card
        color="green"
        >
            <template v-slot:heading>
                <div class="display-1 font-weight-light">
                    {{projectName}}
                </div>
            </template>
            <v-btn color="pink" @click="goBack()" text title="Back">
                <v-icon>mdi-arrow-left-bold</v-icon>
            </v-btn>

            <v-card-text>
                <v-row>
                    <v-col cols="12" md="3">
                        <v-text-field
                            label="Project Code"
                            v-model="projectCode"
                            readonly
                        >
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-text-field
                            label="Client"
                            v-model="client"
                            readonly
                        >
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-text-field
                            label="PM"
                            v-model="pm"
                            readonly
                        >
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-text-field
                            label="Approval Status"
                            v-model="approvalStatus"
                            readonly
                        >
                        </v-text-field>
                    </v-col>
                </v-row>
                <!--
                <v-row>
                    <v-col>
                        <v-select
                            label="Phase"
                            :items="phaseItems"
                            @change="changePhase"
                            v-model="selectedPhase"
                            :disabled="wait"
                        >
                        </v-select>
                    </v-col>
                </v-row>
                -->
                <div class="text-center">
                    <v-btn v-for="(item, i) in phaseItems" :key="i" :color="getPhaseColor(item)" fab small @click="selectPhase(item)">
                     {{ item }}
                    </v-btn>
                </div>
            </v-card-text>
        </base-material-card>
        <v-row>
            <v-col cols="12" md="6">
                <base-material-card
                    icon="mdi-file-tree"
                    title="Deliverables"
                    color="blue"
                >
                    <v-progress-linear
                        class="mb-1"
                        indeterminate
                        color="blue"
                        v-if="wait1">
                    </v-progress-linear>
                    <v-row>
                        <v-col class="text-right">
                            <v-btn small class="mr-5" width="150px" @click="openTreeDialog()" color="blue" elevation="8">Manage Deliverable</v-btn>
                            <v-btn small elevation="8" width="150px" @click="saveTask()" color="primary" :disabled="saveBtnStatus()">Save Task</v-btn>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col>
                            <v-treeview
                                class="mt-5"
                                :open="initiallyOpen"
                                :items="treeForShow"
                                :search="searchName"
                                :filter="filterTreeItems"
                                :open-all="true"
                                item-key="ikey"
                                activatable>
                                <template v-slot:prepend="{ item }">
                                    <v-icon v-if="item.level == 0" color="blue">mdi-cube</v-icon>
                                    <v-icon v-if="item.level == 1" color="blue">mdi-numeric-1-box-outline</v-icon>
                                    <v-icon v-if="item.level == 2" color="blue">mdi-numeric-2-box-outline</v-icon>
                                    <v-icon v-if="item.level == 3" color="blue">mdi-numeric-3-box-outline</v-icon>
                                    <v-icon v-if="item.level == 4" color="blue">mdi-numeric-4-box-outline</v-icon>
                                </template>
                                <template v-slot:label="{ item }">
                                    <v-row>
                                        <v-col>
                                            <p class="subtitle-1 mb-0">{{ item.name }}
                                                <v-badge
                                                v-if="item.state == `newData`"
                                                content="new"
                                                color="blue"
                                                ></v-badge>
                                            </p>
                                            <p v-if="item.level > 0" class="title mb-0 text--disabled">
                                                {{ item.description || 'You can input task description.' }}
                                            </p>
                                        </v-col>
                                    </v-row>
                                </template>
                                <template v-slot:append="{ item }">
                                    <v-icon v-if="item.level > 0"
                                        color="blue" class="mr-2"
                                        @click="openTaskEditDialog($event, item)"
                                    >mdi-format-color-fill</v-icon>
                                    <v-icon v-if="item.level > 0"
                                        @click="selectTask(item)"
                                        color="purple" title="Estimation">mdi-pencil</v-icon>
                                </template>
                            </v-treeview>
                        </v-col>
                    </v-row>
                </base-material-card>
            </v-col>
            <v-col cols="12" md="6">
                <!--
                <base-material-card
                    icon="mdi-notebook-edit"
                    title="Estimation"
                    color="purple"
                >
                    <template v-if="task">
                        <PEstimation
                            v-bind:project=project
                            v-bind:phase=phase
                            v-bind:task=task
                        >
                        </PEstimation>
                    </template>
                    <template v-else>
                        <br>
                        <p class="text-center purple--text display-2">No Task selected</p>
                    </template>
                </base-material-card>
                -->
                <PEstimation
                    v-bind:project=project
                    v-bind:phase=phase
                    v-bind:task=task
                >
                </PEstimation>
            </v-col>
        </v-row>

        <!-- Add tree dialog -->
        <v-dialog v-model="treeDialog" max-width="600px" scrollable>
            <v-card>
                <v-card-title>
                    <span class="headline">Deliverables</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form ref="treeForm" lazy-validation>
                            <v-treeview
                                v-model="dialogTreeSelected"
                                :open="initiallyOpen"
                                :items="treeItems"
                                item-key="ikey"
                                selectable
                                dense
                                selection-type="independent"
                                @input="treeSelectChanged"
                            >
                                <template v-slot:label="{ item }">
                                    <span class="mr-1">{{ item.sortorder }}. </span>
                                    <span>{{ item.name }}</span>
                                </template>
                            </v-treeview>
                        </v-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue" text @click="closeTreeDialog">
                        Cancel
                    </v-btn>
                    <v-btn color="blue" text @click="saveTreeDialog">
                        Add to phase
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--Task date dialog-->
        <v-dialog v-model="taskDialog" max-width="600px" scrollable>
            <v-card>
                <v-card-title>
                    <span class="headline">Task Information</span>
                </v-card-title>
                <v-card-text>
                    <v-container v-if="editTask != null">
                        <v-text-field
                            v-model="editTask.name"
                            prepend-icon="mdi-book-lock-outline"
                            label="Name"
                            readonly
                        ></v-text-field>
                        <v-text-field
                            v-model="editTask.description"
                            prepend-icon="mdi-alpha-d-circle-outline"
                            label="Description"
                        ></v-text-field>
                        <v-select
                            v-model="editTask.unitOfMeasure"
                            :items="units"
                            attach
                            dense
                            label="Unit"
                            prepend-icon="mdi-menu-right"
                        ></v-select>
                        <v-text-field
                            v-model="editTask.quantity"
                            prepend-icon="mdi-numeric"
                            label="Quantity"
                            type="number"
                            :rules="qtyRules"
                        ></v-text-field>
                        <br>
                        <ColorPicker
                            :label="`Background Color`"
                            :initial = "setBackgroundColor(editTask)"
                            :submit="(color) => {this.setBackTempColor(color)}"
                            :task = "editTask"
                        ></ColorPicker>
                        <ColorPicker
                            :label="`Font Color`"
                            :initial = "setFontColor(editTask)"
                            :submit="(color) => {this.setFontTempColor(color)}"
                            :task = "editTask"
                        ></ColorPicker>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue" text @click="closeTaskEditDialog">
                        Cancel
                    </v-btn>
                    <v-btn
                        color="blue"
                        text
                        @click="saveTaskEditDialog"
                    >
                        SAVE
                    </v-btn>
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
import associate_api from "@/apis/associate.js";
import PEstimation from './PEstimation'
import ColorPicker from './ColorPicker'

export default {
    components: {
        PEstimation,
        ColorPicker
    },

    data: () => ({
        wait: false,
        snack: false,
        snackColor: "success",
        snackText: "",
        wait1: false,
        project: null,
        associates: [],
        phase: null,
        selectedPhase: null,
        initiallyOpen: ["public"],
        treeForShow: [],
        searchName: "1",
        treeItems: [],

        treeDialog: false,
        dialogTreeSelected: [],
        isSetPhase: false,

        menu: false,

        task: null,
        editTask: null,
        taskDialog: false,
        units: ["Item", "Nos",'Sq-Mtr','QV-Mtr','Ltr','Lum'],

        bTempColor: null,
        fTempColor: null
    }),

    watch: {
        bColor: function(newValue, oldValue) {
            console.log("bColor new", newValue)
        }
    },

    computed: {

        filterTreeItems() {
            return (item, search, textKey) => {
                return item.state && item.state != 'remove'
            }
        },

        projectName() {
            if (this.project)
                return this.project.prj_name
            return ''
        },
        
        projectCode() {
            if (this.project)
                return this.project.prj_code
            return ''
        },

        client() {
            if (this.project)
                return this.project.cl_name
            return ''
        },

        pm() {
            if (this.project && this.associates) {
                const found = this.associates.find(e => e.id == this.project.prj_projectmanagerhrid)
                if (found)
                    return found.firstname + ' ' + found.lastname
            }
            return ''
        },

        approvalStatus() {
            if (this.project)
                return this.project.prj_approval
            return ''
        },

        phaseItems() {
            if (this.project) {
                let ret = []
                this.project.phases.forEach( e => {
                    ret.push(e.phaseNumber)
                })
                return ret
            }
            return []
        },
        
        qtyRules() {
            return [
                (v) => {
                    if (!v) return true
                    else if  (v && v%1 != 0) return "input valid number"
                    return true
                }
            ]
        },

    },

    created: async function() {
        this.wait = true
        const prj_code = this.$route.query.prj_code

        const temp = await project_api.getProjectWithPhase(prj_code)
        this.project = temp[0]

        this.associates = await associate_api.findAll()
        this.treeItems = await project_api.getTree()
                
        this.project.phases && this.project.phases.length > 0 && this.project.phases.forEach( e => {
            if (e.setAsDefault == 1) {
                this.selectedPhase = e.phaseNumber
                return
            }
        })
        if (this.selectedPhase)
            await this.changePhase()
        // console.log("tree", this.treeItems)
        this.wait = false
    },

    methods: {
        async changePhase() {
            !this.project.updated && await this.updateProject()
            const num = this.getPhaseNumber(this.selectedPhase)     
            this.phase = this.project.phases.find(e => e.phaseNumber == num)
            console.log("phase", this.phase)
            // if (!this.isSetPhase)
                this.setPhase()
                this.isSetPhase = true
        },

        getPhaseNumber(phase) { 
            // return phase.slice(6, phase.length)
            return phase
        },

        async updateProject() {
            this.wait = true
            this.wait1 = true
            await project_api.setServerItem(this.project)
            await project_api.updateTaskList(this.project)
            console.log("project", this.project)
            this.wait1 = false
            this.wait = false
        },

        setPhase() {
            if (!this.phase.serverItems) {
                this.phase.serverItems = []
            }

            this.phase.tree = this.cloneTaskTree(this.treeItems)
            this.phase.tree = this.setDefaultValues(this.phase.tree)
            this.setAllInfo(this.phase.tree)

            this.setShowingTree()
        },

        cloneTaskTree(items) {
            return items.map((item) => {
                const node = { 
                    task: item, 
                    id: item.id,
                    name: item.name, 
                    ikey: item.ikey,
                    level: item.level,
                    datefrom: '',
                    dateto: '',
                    description: '', //'You can input task description.',
                    unitOfMeasure: 'Nos',
                    quantity: 0,
                    children: [],
                }
                const serverItem = this.findServerItem(item)

                if (serverItem) {
                    node.state = "nochange"
                }
                if (item.children && item.children.length > 0) {
                    node.children = this.cloneTaskTree(item.children)
                }
                return node
            })
        },
        
        findServerItem: function(subject) {
            return this.findServerItemEx(this.phase.serverItems, subject, 0)
        },

        findServerItemEx: function(serverItems, subject, level) {
            for (const i in serverItems) {
                const item = serverItems[i]
                
                if (level == subject.level) {
                    const findId = this.getTreeIdFromLevel(item, level)
                    if (subject.id == findId) {
                        return item
                    }
                }
                else {
                    const children = item.children
                    if (children && children.length > 0) {
                        let ret = this.findServerItemEx(children, subject, level + 1)
                        if (ret) return ret
                    }
                }
            }
            return null
        },

        getDefaultTask(level) {
            if (level == 0) {
                return {
                    ph_phaseNumber: this.phase.phaseNumber,
                    est_MP_categ_id: 0,
                    est_MP_categ_phaseid: 0,
                    est_MP_categ_taskCategoryID: 0,
                    taskCateg_name: '',
                    children_cnt: 0,
                }
            }
            if (level == 1) {
                 return {
                    est_MP_TL1_id: 0,
                    est_MP_TL1_level1taskid: 0,
                    est_MP_TL1_level1taskDesc: '',
                    est_MP_TL1_datefrom: '',
                    est_MP_TL1_dateto: '',
                    est_MP_TL1_unitOfMeasure: 'Nos',
                    est_MP_TL1_qty: 0
                }
            }
            if (level == 2) {
                 return {
                    est_MP_TL2_id: 0,
                    est_MP_TL2_level2taskid: 0,
                    TL2_name: '',
                    est_MP_TL2_level2taskDesc: '',
                    est_MP_TL2_unitOfMeasure: 'Nos',
                    est_MP_TL2_qty: 0,
                    children_cnt: 0,
                }
            }
            if (level == 3) {
                 return {
                    est_MP_TL3_id: 0,
                    est_MP_TL3_level3taskid: 0,
                    TL3_name: '',
                    est_MP_TL3_level3taskDesc: '',
                    est_MP_TL3_unitOfMeasure: 'Nos',
                    est_MP_TL3_qty: 0,
                    children_cnt: 0,
                }
            }
            if (level == 4) {
                 return {
                    est_MP_TL4_id: 0,
                    est_MP_TL4_level4taskid: 0,
                    TL4_name: '',
                    est_MP_TL4_level4taskDesc: '',
                    est_MP_TL4_unitOfMeasure: 'Nos',
                    est_MP_TL4_qty: 0,
                    children_cnt: 0,
                }
            }
            return {}
        },

        setDefaultValues(tasks) {
            return tasks.map((item) => {
                const node = Object.assign(item, { info: this.getDefaultTask(item.level) })
                if (node.children && node.children.length > 0) {
                    node.children = this.setDefaultValues(node.children)
                }
                return node
            })
        },
        
        setAllInfo(tree) {
            tree && tree.length > 0 && tree.forEach( e => {
                const pInfo = this.findServerItem(e)
                if (pInfo) {
                    e.info = pInfo
                    if (e.level == 1)  {
                        e.dateto = pInfo.est_MP_TL1_dateto
                        e.datefrom = pInfo.est_MP_TL1_datefrom
                        e.quantity = pInfo.est_MP_TL1_qty
                        e.description = pInfo.est_MP_TL1_level1taskDesc
                        e.unitOfMeasure = pInfo.est_MP_TL1_unitOfMeasure
                        e.people = []
                        e.initial = []
                        pInfo.inlcudedResources && pInfo.inlcudedResources.length > 0 && pInfo.inlcudedResources.forEach(e1 => {
                            e.people.push(e1.hrid)
                            e.initial.push(e1.hrid)
                        })
                    } else if (e.level == 2) {
                        e.quantity = pInfo.est_MP_TL2_qty
                        e.description = pInfo.est_MP_TL2_level2taskDesc
                        e.unitOfMeasure = pInfo.est_MP_TL2_unitOfMeasure
                    } else if (e.level == 3) {
                        e.quantity = pInfo.est_MP_TL3_qty
                        e.description = pInfo.est_MP_TL3_level3taskDesc
                        e.unitOfMeasure = pInfo.est_MP_TL3_unitOfMeasure
                    } else if (e.level == 4) {
                        e.quantity = pInfo.est_MP_TL4_qty
                        e.description = pInfo.est_MP_TL4_level4taskDesc
                        e.unitOfMeasure = pInfo.est_MP_TL4_unitOfMeasure
                    }
                }

                e.children && e.children.length > 0 && this.setAllInfo(e.children)
            })
        },

        setShowingTree() {
            let temp = this.cloneTree(this.phase.tree)
            console.log('pahse tree', this.phase.tree)
            this.treeForShow = this.makeShowingTree(temp)
            console.log('treeForShow', this.treeForShow)
        },
        
        makeShowingTree(items) {
            let result = []
            result = items && items.length > 0 && items.filter(item => item.state && item.state != "remove")
            if (result && result.length > 0) {
                for (let i in result) {
                    if (result[i].children && result[i].children.length > 0)
                        result[i].children = this.makeShowingTree(result[i].children)
                }
            }
            return result
        },
        
        getTreeIdFromLevel: function(item, level) {
            if (level == 0) return item.est_MP_categ_taskCategoryID
            if (level == 1) return item.est_MP_TL1_level1taskid
            if (level == 2) return item.est_MP_TL2_level2taskid
            if (level == 3) return item.est_MP_TL3_level3taskid
            if (level == 4) return item.est_MP_TL4_level4taskid
            return null
        },

        cloneTree(items) {
            return items && items.length > 0 && items.map((item) => {
                const node = Object.assign({}, item)
                if (item.children && item.children.length > 0) {
                    node.children = this.cloneTree(item.children)
                }
                return node
            })
        },
        
        openTreeDialog: function() {
            if (!this.phase) {
                return 
            }
            this.treeDialog = true;

            const selectedTasks = this.getInterestedItems()
            this.dialogTreeSelected = this.getKeyList(selectedTasks);
        },
        
        getInterestedItems: function() {
            return this.phase.tree && this.phase.tree.filter(it => it.state && it.state != 'remove')
        },
        
        getKeyList: function(tasks) {
            const thiz = this
            let result = []
            tasks && tasks.length > 0 && tasks.forEach(function(item) {
                let subItemKeys = null
                if (item.children && item.children.length > 0) {
                    subItemKeys = thiz.getKeyList(item.children);                    
                }
                if (subItemKeys && subItemKeys.length > 0) {
                    result.push(item.ikey)
                    result = result.concat(subItemKeys)
                }
                else {
                    // result.push(item.ikey)
                    item.state && result.push(item.ikey)
                }
            })
            return result
        },

        closeTreeDialog: function() {
            this.treeDialog = false;
        },
                
        saveTreeDialog: function() {
            this.treeDialog = false
            console.log('saveTreeDialog.selected:', this.dialogTreeSelected);

            this.updateInterestedItems(this.phase.tree, this.dialogTreeSelected)
            this.refreshTree()

            this.setShowingTree()
        },
        
        updateInterestedItems: function(tasks, keyList) {
            for (const i in tasks) {
                const item = tasks[i]

                if (this.existsInKeyList(item, keyList)) {
                    //console.log('test~~~~~~~~~~~~~~1:', item.ikey, item.state, item.level, item)
                    if (!item.state) {
                        item.state = "newData"
                    }
                    else if (item.state == "remove") {
                        item.state = "modified"
                    }
                    //console.log('test~~~~~~~~~~~~~~2:', item.ikey, item.state, item.level, item)
                }
                else {
                    if (item.state && item.state == 'newData') {
                        item.state = undefined;
                    }
                    else if (item.state) {
                        item.state = "remove"
                    }
                }
                if (item.children && item.children.length > 0) {
                    this.updateInterestedItems(item.children, keyList)
                }
            }
        },
        
        existsInKeyList: function(task, keyList) {
            if (keyList.find(it => it == task.ikey)) {
                return true;
            }
            const children = task.children
            if (children && children.length > 0) {
                for (var i in children) {
                    if (this.existsInKeyList(children[i], keyList)) {
                        return true;
                    }
                }
            }
            return false;
        },
        
        refreshTree: function() {
            this.searchName = (parseInt(this.searchName) + 1).toString()
        },
        
        treeSelectChanged() {
            console.log("-----------", this.dialogTreeSelected)
            console.log('tree', this.treeItems)
            let keys = []
            this.dialogTreeSelected.forEach(key=>{
                let level = []
                this.getLevel(this.treeItems, key, level)
                console.log('level', level)
                level.forEach(e=> keys.push(e))
            })
            const uniqueKeys = [...new Set(keys)]
            console.log('uniqueKeys', uniqueKeys)
            this.dialogTreeSelected = uniqueKeys
        },

        saveBtnStatus() {
            if (this.phase && this.phase.tree && this.phase.tree.length > 0) {
                const result = this.isThereRemoveOrModify(this.phase.tree)
                return !result
            } else {
                return true
            }
        },
        
        isThereRemoveOrModify(items) {
            let result = false
            items && items.length > 0 && items.forEach( e => {
                if (e.state == "remove" || e.state == "modified" || e.state == "newData") {
                    result = true
                    return
                }
                e.children && e.children.length > 0 && e.children.forEach( e1 => {
                    let ret = this.isThereRemoveOrModify(e.children)
                    if (ret) {
                        result = true
                        return
                    }
                })
            })
            return result
        },
        
        getLevel(items, key, level) {
            let result = []
            items.forEach(item=>{
                if (item.ikey == key) {
                    level.push(key)
                    result.push(key)
                    return
                }
                else if (item.children && item.children.length > 0) {
                    let ret = this.getLevel(item.children, key, level)
                    if (ret.length > 0) {
                        level.push(item.ikey)
                        result.push(item.ikey)
                        return
                    }
                }
            })
            return result
        },
        
        getUpdatedItems: function(filter = 'remove') {
            return this.updatedItemsEx(this.phase.tree, filter)
        },

        updatedItemsEx: function(tasks, filter) {
            const temp = tasks.map((it) => Object.assign({}, it))
            const result = temp.filter((it) => it.state && it.state != filter)
            for (const i in result) {
                const children = result[i].children
                if (children && children.length > 0) {
                    result[i].children = this.updatedItemsEx(children, filter)
                }
            }
            return result
        },

        addServerCategory: function(serverItem) {
            this.phase.serverItems.push(serverItem)
        },

        saveTask: async function(index) {
            this.wait = true
            this.wait1 = true
            const items = this.getUpdatedItems('NoFilter')
            for (const i in items) {
                const item = items[i]

                if (item.state === "newData" || item.state === "modified") {
                    const insertId = await project_api.addProjectCategory(this.phase.phase_id, item)

                    if (insertId) {
                        let serverItem = this.findServerItem(item)
                        if (!serverItem) {
                            serverItem = this.getDefaultTask(0)
                            serverItem.est_MP_categ_id = insertId
                            serverItem.est_MP_categ_taskCategoryID = item.id
                            this.addServerCategory(serverItem)
                        }
                        else {
                            serverItem.est_MP_categ_id = insertId
                            serverItem.est_MP_categ_taskCategoryID = item.id
                        }
                    }
                } 

                const children = item.children
                if (children && children.length > 0) {
                    await this.modifyTaskByLevel(item, 'modified', 1)
                    await this.saveTaskByLevel(item, 'newData', 1)
                    await this.removeTaskByLevel(item, 'remove', 1)
                }

                if (item.state === "remove") {
                    const removeResult = await project_api.removeProjectCategory(this.phase.phase_id, item)
                    if (removeResult) {
                        let serverItem = this.findServerItem(item)
                        this.phase.serverItems.forEach( (e, i) => {
                            if (e.est_MP_categ_id == serverItem.est_MP_categ_id) {
                                this.phase.serverItems.splice(i, 1)
                                return
                            }
                        })
                    }
                }
            }            
            this.setPhase()
            this.wait1 = false
            this.wait = false
        },
        
        modifyTaskByLevel: async function(tazk, state, level) {
            this.setInfo(tazk)

            const insertId = await project_api.saveTaskByLevel(tazk, state, tazk.level)
            if (insertId) {
                let children = await project_api.getTaskByKeyInfo(tazk, tazk.level)
                if (children) {
                    let projItem = this.findServerItem(tazk)
                    for(let i in children) {
                        children[i].children = projItem.children[i].children && projItem.children[i].children
                        projItem.children[i] = children[i]
                    }
                }
            }

            for (const i in tazk.children) {
                const child = tazk.children[i]
                if (child.children && child.children.length > 0) {
                    await this.modifyTaskByLevel(child, state, level+1)
                }
            }
        },

        saveTaskByLevel: async function(tazk, state, level) {
            this.setInfo(tazk)
            const insertId = await project_api.saveTaskByLevel(tazk, state, tazk.level)
            if (insertId) {
                const children = await project_api.getTaskByKeyInfo(tazk, tazk.level)
                if (children) {
                    const projItem = this.findServerItem(tazk)
                    projItem.children = children
                }
            }

            for (const i in tazk.children) {
                const child = tazk.children[i]
                if (child.children && child.children.length > 0) {
                    await this.saveTaskByLevel(child, state, level+1)
                }
            }
        },

        removeTaskByLevel: async function(tazk, state, level) {
            this.setAllInfo(tazk)

            for (const i in tazk.children) {
                const child = tazk.children[i]
                if (child.children && child.children.length > 0) {
                    await this.removeTaskByLevel(child, state, level+1)
                }
            }

            let status = await project_api.saveTaskByLevel(tazk, state, tazk.level)
            if (status) {
                const children = await project_api.getTaskByKeyInfo(tazk, tazk.level)
                let projItem = this.findServerItem(tazk)
                projItem.children = children
            }
        },
        
        setInfo(task) {
            const pInfo = this.findServerItem(task)
            if (pInfo) {
                task.info = pInfo
            }
            task.children && task.children.length > 0 && task.children.forEach( e => {
                this.setInfo(e)
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

        selectTask(item) {
            this.task = item
        },
        
        openTaskEditDialog: function(event, item) {
            event.preventDefault();
            console.log('open_task_date_dialog', event, item)
            this.taskDialog = true
            this.editTask = item
            console.log('selected.edittask', this.editTask)
        },

        saveTaskEditDialog: function() {
            this.editTask.state = "modified"
            this.updatePhaseTree(this.editTask)
            if (this.bTempColor) {
                this.getBackColor(this.bTempColor)
                this.bTempColor = null
            }
            if (this.fTempColor) {
                this.getFontColor(this.fTempColor)
                this.fTempColor = null
            }
            this.taskDialog = false;
        },
        
        updatePhaseTree(item) {
            this.findModifiedItem(this.phase.tree, item)
        },
        
        findModifiedItem(items, item) {
            items && items.length > 0 && items.forEach(e => {
                if (e.ikey == item.ikey) {
                    e.description = item.description
                    e.state != 'newData' && (e.state = item.state)
                    e.datefrom = item.datefrom
                    e.dateto = item.dateto
                    e.quantity = item.quantity
                    e.unitOfMeasure = item.unitOfMeasure
                    e.level == 1 && (e.people = item.people)
                    return
                }
                e.children && e.children.length > 0 && this.findModifiedItem(e.children, item)
            })
        },

        closeTaskEditDialog: function() {
            this.taskDialog = false;
        },

        selectPhase(item) {
            if (this.wait) return
            this.selectedPhase = item
            this.changePhase()
        },

        getPhaseColor(item) {
            if (this.selectedPhase == item)
                return 'primary'
            return 'white'
        },

        setBackTempColor(color) {
            this.bTempColor = color
        },

        setFontTempColor(color) {
            this.fTempColor = color
        },

        getBackColor(color) {
            if (this.editTask.level == 1) {
                this.editTask.info.est_MP_TL1_backgroundColor = color
            } else if (this.editTask.level == 2) {
                this.editTask.info.est_MP_TL2_backgroundColor = color
            } else if (this.editTask.level == 3) {
                this.editTask.info.est_MP_TL3_backgroundColor = color
            } else if (this.editTask.level == 4) {
                this.editTask.info.est_MP_TL4_backgroundColor = color
            }
        },

        getFontColor(color) {
            if (this.editTask.level == 1) {
                this.editTask.info.est_MP_TL1_fontColor = color
            } else if (this.editTask.level == 2) {
                this.editTask.info.est_MP_TL2_fontColor = color
            } else if (this.editTask.level == 3) {
                this.editTask.info.est_MP_TL3_fontColor = color
            } else if (this.editTask.level == 4) {
                this.editTask.info.est_MP_TL4_fontColor = color
            }
        },

        setBackgroundColor(item) {
            if (item.level == 1) {
                return [item.info.est_MP_TL1_backgroundColor, item.ikey]
            } else if (item.level == 2) {
                return [item.info.est_MP_TL2_backgroundColor, item.ikey]
            } else if (item.level == 3) {
                return [item.info.est_MP_TL3_backgroundColor, item.ikey]
            } else if (item.level == 4) {
                return [item.info.est_MP_TL4_backgroundColor, item.ikey]
            }
        },

        setFontColor(item) {
            if (item.level == 1) {
                return [item.info.est_MP_TL1_fontColor, item.ikey]
            } else if (item.level == 2) {
                return [item.info.est_MP_TL2_fontColor, item.ikey]
            } else if (item.level == 3) {
                return [item.info.est_MP_TL3_fontColor, item.ikey]
            } else if (item.level == 4) {
                return [item.info.est_MP_TL4_fontColor, item.ikey]
            }
        },

        goBack() {
            this.$router.push('/pages/project_summary?prj_code=' + this.project.prj_code)
        }

    }
}
</script>