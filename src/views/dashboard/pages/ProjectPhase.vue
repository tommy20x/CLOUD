<template>
    <v-container class="px-0 py-0">
        <v-card>
            <v-progress-linear
                indeterminate
                color="teal darken-2"
                v-if="wait">
            </v-progress-linear>
            <v-card-title>
                <v-row>
                    <v-col class="pb-0" md="6">
                        <p class="subtitle-1 mb-0"><b>{{ `Phase ${this.phase.phaseNumber}` }}</b></p>
                        <p class="title mb-0" @click="openPhaseEditDialog">
                            {{ `${this.phase.phase_opendate} ~ ${this.phase.phase_closedate}` }} 
                        </p>
                    </v-col>
                    <v-col class="pb-0 text-right" md="6">
                        <v-btn small @click="openPhaseEditDialog()" color="cyan">Change Date</v-btn>
                        <v-btn small width="70px" @click="openTreeDialog()" color="teal">Add Task</v-btn>
                        <v-btn small width="70px" @click="saveTask()" color="teal" :disabled="saveBtnStatus()">Save Task</v-btn>
                    </v-col>
                </v-row>
            </v-card-title>
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
                        open-on-click
                        activatable>
                        <template v-slot:prepend="{ item }">
                            <v-icon v-if="item.level == 0" color="teal">mdi-cube</v-icon>
                            <v-icon v-if="item.level == 1" color="teal">mdi-numeric-1-box-outline</v-icon>
                            <v-icon v-if="item.level == 2" color="teal">mdi-numeric-2-box-outline</v-icon>
                            <v-icon v-if="item.level == 3" color="teal">mdi-numeric-3-box-outline</v-icon>
                            <v-icon v-if="item.level == 4" color="teal">mdi-numeric-4-box-outline</v-icon>
                        </template>
                        <template v-slot:label="{ item }">
                            <v-row>
                                <v-col cols="12" sm="12" md="8" >
                                    <p class="subtitle-1 mb-0">{{ item.name }}
                                        <v-badge
                                        v-if="item.state == `newData`"
                                        content="new"
                                        color="blue darken-1"
                                        ></v-badge>
                                    </p>
                                    <p v-if="item.level > 0" class="title mb-0 text--disabled">
                                        {{ item.description || 'You can input task description.' }}
                                    </p>
                                </v-col>
                                <v-col cols="12" sm="12" md="4">
                                    <p v-if="item.level == 1" class="title mb-0 text--disabled text-right mr-10">
                                        {{ `${item.datefrom} ~ ${item.dateto}` }}
                                    </p>
                                    <p v-if="item.level > 0" class="title mb-0 text--disabled text-right mr-10">
                                        {{ item.quantity * 1 || 0 }}
                                    </p>
                                </v-col>
                            </v-row>
                        </template>
                        <template v-slot:append="{ item }">
                            <v-icon v-if="item.level > 0"
                                class="mr-8"
                                color="purple"
                                @click="openTaskEditDialog(item)"
                            >mdi-square-edit-outline</v-icon>
                        </template>
                    </v-treeview>
                </v-col>
            </v-row>
        </v-card>

        <!-- Add tree dialog -->
        <v-dialog v-model="treeDialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">Tasks</span>
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
                                selection-type="independent"
                                @input="treeSelectChanged"
                            >
                            </v-treeview>
                        </v-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeTreeDialog">
                        Cancel
                    </v-btn>
                    <v-btn color="blue darken-1" text @click="saveTreeDialog">
                        Add to phase
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--Task date dialog-->
        <v-dialog v-model="taskDialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">Task Information</span>
                </v-card-title>
                <v-card-text>
                    <v-container v-if="editTask != null">
                        <v-row>
                            <v-col cols="12" sm="12" md="12">
                                <v-text-field
                                    v-model="editTask.name"
                                    prepend-icon="mdi-book-lock-outline"
                                    label="Name"
                                    readonly
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" sm="12" md="12">
                                <v-text-field
                                    v-model="editTask.description"
                                    prepend-icon="mdi-alpha-d-circle-outline"
                                    label="Description"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row v-if="editTask.level == 1">
                            <v-col>
                                <v-select
                                    v-model="editTask.people"
                                    :items="peoples"
                                    attach
                                    label="Peoples"
                                    multiple
                                    chips
                                    item-text="name"
                                    item-value="id"
                                    prepend-icon="mdi-account-group"
                                ></v-select>
                            </v-col>
                        </v-row>
                        <v-row v-if="editTask.level == 1">
                            <v-col cols="12" sm="12" md="6">
                                <v-menu
                                    ref="taskFromMenu"
                                    v-model="taskFromMenu"
                                    :close-on-content-click="false"
                                    :return-value.sync="editTask.datefrom"
                                    transition="scale-transition"
                                    offset-y
                                    min-width="auto"
                                >
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field
                                            v-model="editTask.datefrom"
                                            label="Date From"
                                            prepend-icon="mdi-calendar"
                                            readonly
                                            v-bind="attrs"
                                            v-on="on"
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker v-model="editTask.datefrom" no-title scrollable>
                                        <v-spacer></v-spacer>
                                        <v-btn text color="primary" @click="taskFromMenu = false">Cancel</v-btn>
                                        <v-btn text color="primary" @click="$refs.taskFromMenu.save(editTask.datefrom)">OK</v-btn>
                                    </v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="12" sm="12" md="6">
                                <v-menu
                                    ref="taskToMenu"
                                    v-model="taskToMenu"
                                    :close-on-content-click="false"
                                    :return-value.sync="editTask.dateto"
                                    transition="scale-transition"
                                    offset-y
                                    min-width="auto">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field
                                            v-model="editTask.dateto"
                                            label="Date To"
                                            prepend-icon="mdi-calendar"
                                            readonly
                                            v-bind="attrs"
                                            v-on="on"
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker 
                                        v-model="editTask.dateto" 
                                        no-title 
                                        scrollable>
                                        <v-spacer></v-spacer>
                                        <v-btn text color="primary" @click="taskToMenu = false">Cancel</v-btn>
                                        <v-btn text color="primary" @click="$refs.taskToMenu.save(editTask.dateto)">OK</v-btn>
                                    </v-date-picker>
                                </v-menu>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-select
                                    v-model="editTask.unitOfMeasure"
                                    :items="units"
                                    attach
                                    label="Unit"
                                    prepend-icon="mdi-menu-right"
                                ></v-select>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-text-field
                                    v-model="editTask.quantity"
                                    prepend-icon="mdi-numeric"
                                    label="Quantity"
                                    type="number"
                                    :rules="qtyRules"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeTaskEditDialog">
                        Cancel
                    </v-btn>
                    <v-btn
                        color="blue darken-1"
                        text
                        @click="saveTaskEditDialog"
                    >
                        SAVE
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--Edit Phase Date Dialog-->
        <v-dialog v-model="editPhaseDateDialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">Edit Phase Date</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <DatePicker
                                textName="Date From"
                                :date="phase.phase_opendate"
                                :submit="(date) => phase.phase_opendate = date"
                                :endDate="phase.phase_closedate"
                                :startDate="previousPhaseDate"
                            ></DatePicker>
                        </v-row>
                        <v-row>
                            <DatePicker
                                textName="Date To"
                                :date="phase.phase_closedate"
                                :submit="(date) => phase.phase_closedate = date"
                                :startDate="phase.phase_opendate"
                            ></DatePicker>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closePhaseEditDialog"> Cancel </v-btn>
                    <v-btn color="blue darken-1" text @click="savePhaseEditDialog">
                        Save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
            {{ snackText }}
            <template v-slot:action="{ attrs }">
                <v-btn v-bind="attrs" text @click="snack = false"> Close </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script>
import moment from 'moment'
import api from "@/apis/project.js"
import associate_api from "@/apis/associate.js"
import DatePicker from './DatePicker'

export default {
    name: "ProjectPhase",
    props: ["phase", "treeItems", "projectId", "previousPhaseDate"],
    components: {
        DatePicker,
    },

    data: () => ({
        wait: false,
        treeDialog: false,
        initiallyOpen: ["public"],
        dialogTreeSelected: [],
        taskFromMenu: false,
        taskToMenu: false,
        taskDialog: false,
        editPhaseDateDialog: false,
        editTask: null,
        searchName: "1",
        unitOfMeasureItems: ['Nos', 'Item'],
        treeForShow: [],
        peoples: [],
        snack: false,
        snackColor: "",
        snackText: "",
        units: ["Item", "Nos"]
    }),

    computed: {
        filterTreeItems() {
            return (item, search, textKey) => {
                return item.state && item.state != 'remove'
            }
        },

        taskValid() {
            return true;
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
        this.peoples = await api.findPeople()
        this.initialize()
    },

    //TODO
    //category.est_MP_categ_id                  // unique_category_id
    //category.est_MP_categ_phaseid             // unique_phase_id
    //category.est_MP_categ_taskCategoryID      // id in task_category_list

    methods: {
        phaseTitle() {
            // (${this.phase.phase_opendate} ~ ${this.phase.phase_closedate})
            return `Phase ${this.phase.phaseNumber}`
        },

        initialize() {
            if (!this.phase.serverItems) {
                this.phase.serverItems = []
            }

            // console.log('initialize_phase:', this.phase)
            // console.log('initialize_phase_serverItems:', this.phase.serverItems)
            // console.log('intial_tree', this.treeItems)

            this.phase.tree = this.cloneTaskTree(this.treeItems)
            this.phase.tree = this.setDefaultValues(this.phase.tree)
            this.setAllInfo(this.phase.tree)

            console.log('initialize_phase_tree:', this.phase.tree)

            this.setShowingTree()
        },

        //----------------------mangae task list -------------------------------------
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

        findTaskByKey(tasks, ikey) {
            for (const i in tasks) {
                const item = tasks[i]

                if (item.ikey == ikey) {
                    return item
                }
                if (item.children && item.children.length > 0) {
                    const result = this.findTaskByKey(item.children, ikey)
                    if (result) {
                        return result
                    }
                }
            }
            return null
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
        //----------------------mangae task list -------------------------------------

        //----------------------phase.tree state -------------------------------------
        getInterestedItems: function() {
            return this.phase.tree && this.phase.tree.filter(it => it.state && it.state != 'remove')
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

        resetStates: function(tasks) {
            for (const i in tasks) {
                const item = tasks[i]

                if (item.state) {
                    item.state = 'nochange'
                }
                
                if (item.children && item.children.length > 0) {
                    this.resetStates(item.children)
                }
            }
        },
        //----------------------phase.tree state -------------------------------------

        //----------------------manage sync data -------------------------------------
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

        getTreeIdFromLevel: function(item, level) {
            if (level == 0) return item.est_MP_categ_taskCategoryID
            if (level == 1) return item.est_MP_TL1_level1taskid
            if (level == 2) return item.est_MP_TL2_level2taskid
            if (level == 3) return item.est_MP_TL3_level3taskid
            if (level == 4) return item.est_MP_TL4_level4taskid
            return null
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

        addServerCategory: function(serverItem) {
            this.phase.serverItems.push(serverItem)
        },
        //----------------------manage sync data -------------------------------------

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

        openTreeDialog: function() {
            this.treeDialog = true;

            const selectedTasks = this.getInterestedItems()
            this.dialogTreeSelected = this.getKeyList(selectedTasks);
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

        refreshTree: function() {
            this.searchName = (parseInt(this.searchName) + 1).toString()
        },

        openTaskEditDialog: function(item) {
            console.log('open_task_date_dialog', item)
            this.taskDialog = true
            this.editTask = item
            console.log('selected.edittask', this.editTask)
        },

        closeTaskEditDialog: function() {
            this.taskDialog = false;
        },

        saveTaskEditDialog: function() {
            this.editTask.state = "modified"
            this.updatePhaseTree(this.editTask)
            this.taskDialog = false;
        },

        onDescriptionChanged: function(event, item) {
            item.description = event
            if (item.state != 'newData') {
                item.state = 'modified'
            }
        },

        onUnitOfMeasureChanged: function(event, item) {
            item.unitOfMeasure = event
            if (item.state != 'newData') {
                item.state = 'modified'
            }
        },

        onQuantityChanged: function(event, item) {
            item.quantity = event
            if (item.state != 'newData') {
                item.state = 'modified'
            }
        },

        saveTask: async function(index) {
            this.wait = true
            const items = this.getUpdatedItems('NoFilter')
            for (const i in items) {
                const item = items[i]
                // this.setAllInfo(item)
                console.log('saveTask_add_item', item, item.state)

                if (item.state === "newData" || item.state === "modified") {
                    const insertId = await api.addProjectCategory(this.phase.phase_id, item)
                    console.log('Save_Add_Category_Result', item, insertId)

                    if (insertId) {
                        let serverItem = this.findServerItem(item)
                        if (!serverItem) {
                            serverItem = this.getDefaultTask(0)
                            serverItem.est_MP_categ_id = insertId
                            serverItem.est_MP_categ_taskCategoryID = item.id
                            this.addServerCategory(serverItem)
                            console.log('Save_New_Server_Category', serverItem)
                        }
                        else {
                            serverItem.est_MP_categ_id = insertId
                            serverItem.est_MP_categ_taskCategoryID = item.id
                            console.log('Save_Update_Server_Category', serverItem)
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
                    const removeResult = await api.removeProjectCategory(this.phase.phase_id, item)
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
            // this.phase.tree = this.cloneTaskTree(this.treeItems)
            // this.phase.tree = this.setDefaultValues(this.phase.tree)

            // this.resetStates(this.phase.tree)
            // this.setShowingTree()
            this.initialize()
            this.wait = false;
        },

        modifyTaskByLevel: async function(tazk, state, level) {
            this.setInfo(tazk)

            const insertId = await api.saveTaskByLevel(tazk, state, tazk.level)
            if (insertId) {
                let children = await api.getTaskByKeyInfo(tazk, tazk.level)
                console.log('---------childre', children)
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
            const insertId = await api.saveTaskByLevel(tazk, state, tazk.level)
            if (insertId) {
                // console.log('saveTaskByLevel________inserted', insertId, tazk)
                const children = await api.getTaskByKeyInfo(tazk, tazk.level)
                // console.log('children_______', children)
                if (children) {
                    const projItem = this.findServerItem(tazk)
                    projItem.children = children
                    // console.log('saveTaskByLevel________serverItems', this.phase.serverItems)
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

            let status = await api.saveTaskByLevel(tazk, state, tazk.level)
            if (status) {
                const children = await api.getTaskByKeyInfo(tazk, tazk.level)
                let projItem = this.findServerItem(tazk)
                projItem.children = children

            }
        },

        openPhaseEditDialog: function() {
            this.editPhaseDateDialog = true
        },

        closePhaseEditDialog: function() {
            this.editPhaseDateDialog = false
        },

        savePhaseEditDialog: async function() {
            this.wait = true
            this.editPhaseDateDialog = false
            let phaseData = [{
                "phase_id": this.phase.phase_id,
                "phaseNumber": this.phase.phaseNumber,
                "phase_opendate": this.phase.phase_opendate,
                "phase_closedate": this.phase.phase_closedate,
            }]
            let status = await api.phaseSet(this.projectId, phaseData)
            this.show_snack(status)
            this.wait = false
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

        cloneTree(items) {
            return items && items.length > 0 && items.map((item) => {
                const node = Object.assign({}, item)
                if (item.children && item.children.length > 0) {
                    node.children = this.cloneTree(item.children)
                }
                return node
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
        
        saveBtnStatus() {
            if (this.phase.tree && this.phase.tree.length > 0) {
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
        }
    }
};
</script>
