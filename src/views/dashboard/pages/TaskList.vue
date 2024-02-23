<template>
  <v-container tag="section">
    <base-material-card
    color="green"
    >
    <template v-slot:heading>
        <div class="display-1 font-weight-light">
            Task List
        </div>
    </template>
      <v-card class="d-flex flex-row-reverse" flat tile>
        <div>
          <v-btn
            class="mx-4"
            color="blue"
            @click="addCategory"
            :disabled="!proles.add"
            elevation="8"
            small
          >
            New Category
          </v-btn>
          <v-btn
            class="px-2"
            color="pink"
            elevation="8"
            small
            @click="saveAll"
            :disabled="saveBtnStatus"
          >
            Save
          </v-btn>
        </div>
      </v-card>

      <v-card flat tile>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          class="mb-2"
          single-line
          flat
          hide-details
          clearable
          clear-icon="mdi-close-circle-outline"
        ></v-text-field>
      </v-card>

      <v-progress-linear
        v-if="loading"
        indeterminate
        color="green"
      ></v-progress-linear>

      <!--Add, Edit dialog-->
      <v-dialog v-model="dialog" max-width="700px" scrollable>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-form ref="form" v-model="valid" lazy-validation>
                <v-text-field
                  :counter="maxNameLength"
                  :rules="nameRules"
                  v-model="editName"
                  label="Name"
                  required
                ></v-text-field>
                <!--
                <v-select
                  v-if="isTask"
                  :items="roles"
                  :rules="roleRules"
                  v-model="selectedRole"
                  item-text="nameWithType"
                  item-value="id"
                  label="Role"
                  chips
                  multiple
                ></v-select>
                -->
                <v-text-field
                  v-model="order"
                  :rules="orderRules"
                  label="order"
                  type="number"
                >
                </v-text-field>
                <div v-if="isTask">
                  <p class="py-1 mt-3 mb-0 text--disabled body-1">Please select roles</p>
                  <v-text-field
                    label="Role Search"
                    prepend-icon="mdi-magnify"
                    v-model="roleSearch"
                  >
                  </v-text-field>
                  <v-expansion-panels flat hover multiple>
                    <template v-for="(type, i) in roleTypes">
                      <v-expansion-panel :key="i">
                        <v-expansion-panel-header ripple class="px-1 py-1">
                            <p class="body-1 mb-0">
                                <v-icon color="purple">mdi-check</v-icon>
                                <span class="ml-3">{{type + ' (' + getRolesCountByType(type) + ' selected )'}}</span>
                            </p>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content class="pt-5">
                          <v-row>
                            <v-col 
                              cols="12"
                              md="4"
                              sm="6"
                              class="py-0 my-0 px-1"
                              v-for="(item, j) in getRolesByType(type)"
                              :key="j">
                                <v-checkbox
                                  class="mt-0"
                                  v-model="item.selected"
                                >
                                  <template v-slot:label>
                                    <span style="color: #555">{{item.name}}</span>
                                  </template>
                                </v-checkbox>
                            </v-col>
                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </template>
                  </v-expansion-panels>
                </div>
              </v-form>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
            <v-btn :disabled="!valid" color="blue darken-1" text @click="save">
              Save as draft
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Treeview -->
      <v-treeview
        v-model="tree"
        :search="search"
        :open="initiallyOpen"
        :items="items"
        item-key="ikey"
        activatable
      >
        <template v-slot:prepend="{ item }">
          <v-icon v-if="item.level < 4" color="green" @click="addTask(item)" :disabled="!proles.add">
            mdi-playlist-plus
          </v-icon>
        </template>
        <template v-slot:label="{ item }">
          <v-row>
            <v-col cols="12" md="4" class="d-flex align-center">
              <span class="mr-1">{{ item.sortorder }}. </span>
              <span>{{ item.name }}</span>
            </v-col>
            <template v-if="item.roles">
              <v-col cols="12" md="8">
                  <v-chip
                    color="purple darken-1"
                    class="white--text mr-1"
                  v-for="(v, i) in item.roles" :key="i">
                  {{ getRoleName(v) }}</v-chip>
              </v-col>
            </template>
          </v-row>
        </template>
        <template v-slot:append="{ item }">
          <v-icon v-if="item.ikey != 0" color="green" @click="editTask(item)" :disabled="!proles.edit">
            mdi-playlist-edit
          </v-icon>
        </template>
      </v-treeview>
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
import api from "@/apis/task.js";
import roleApi from "@/apis/role.js";
import auth_api from "@/apis/auth.js";

export default {
  data: () => ({
    loading: true,
    uniqueTreeId: 0,
    initiallyOpen: ["public"],
    items: [],
    dialog: false,
    tree: [],
    search: null,
    maxNameLength: 60,
    actionMode: "",
    selectedItem: null,
    editName: "",
    valid: false,
    roles: [],
    roleTypes: [],
    selectedRole: null,
    snack: false,
    snackColor: "success",
    snackText: "",
    saveBtnStatus: true,
    proles: [],
    roleSearch: "",
    order: 1,
    maxOrder: 1
  }),

  computed: {
    filter() {
      return undefined;
    },
    formTitle() {
      let parent
      this.items && this.items.length > 0 && this.selectedItem && (parent = this.findParent(this.items))
      if (this.actionMode === "add_category") return "New Category";
      return this.actionMode === "add_task" ? this.selectedItem && "New Task (Level " + (this.selectedItem.level + 1) + " )" : (this.selectedItem && this.selectedItem.level == 0 ? "Edit Category" : parent && parent.name);
    },
    nameRules() {
      return [
        (v) => !!v || "Name is required",
        (v) => (v && v.trim().length > 0) || "Name is required",
        (v) =>
          (v && v.length <= this.maxNameLength) ||
          `Name must be less than ${this.maxNameLength} characters`,
      ];
    },
    roleRules() {
      return [(v) => !!v || "Role is required"]
    },

    isTask() {
      console.log("selected ", this.selectedItem)
      if (this.selectedItem && this.actionMode === "add_task" || this.selectedItem && this.actionMode === "edit_task" && this.selectedItem.level >= 1)
        return true
      return false
    },

    orderRules() {
      return [
        (v) => !!v || "Order is required",
        (v) => v > 0 || "> 0",
        (v) => v % 1 == 0 || "Order is not valid",
      ]
    }
  },

  watch: {
  },

  created: async function () {
    localStorage.removeItem("dataChange")

    this.items = await api.findAll()
    this.proles = auth_api.getRole()

    this.uniqueTreeId = this.setUniqueId(this.items)
    console.log("uniqueTreeId:", this.uniqueTreeId, this.items)

    this.roleTypes = await roleApi.findAllRoles()
    this.roles = await roleApi.findAll();
    this.roles.sort( (a, b) => {
      let comp = 0
      if (a.roleType > b.roleType)
        comp = 1
      else if (a.roleType < b.roleType)
        comp = -1
      return comp
    })
    // console.log("role types:", this.roleTypes)
    this.initilizeRoleSelect()
    // console.log("roles:", this.roles)

    this.loading = false;
  },

  methods: {
    initilizeRoleSelect() {
      this.roles.forEach( e => {
        e.selected = false
      })
    },

    getMaxOrder(item) {
      let arr = [0]
      if (!item) {
        this.items && this.items.length > 0 && this.items.forEach( e => {
          arr.push(e.sortorder)
        })
        return Math.max(...arr)
      } else {
        item.children && item.children.length > 0 && item.children.forEach( e => {
          arr.push(e.sortorder)
        })
        return Math.max(...arr)
      }
    },

    addCategory() {
      this.actionMode = "add_category";
      this.editName = "";
      this.order = this.getMaxOrder() + 1
      console.log("max order ", this.maxOrder)
      this.openDialog();
    },

    addTask(item) {
      console.log("addTask", item);
      this.actionMode = "add_task";
      this.editName = "";
      this.selectedItem = item;
      // this.order = 1
      this.order = this.getMaxOrder(item) + 1
      console.log("max order ", this.maxOrder)
      // this.selectedRole = null
      this.initilizeRoleSelect()
      this.openDialog();
    },

    editTask(item) {
      this.actionMode = "edit_task";
      this.editName = item.name;
      this.order = item.sortorder
      this.selectedItem = item;

      if(item.level >= 1) {
        this.initilizeRoleSelect()
        // this.selectedRole = item.roleid
        if (item.roles && item.roles.length > 0) {
          // this.selectedRole = item.roles
          this.roles.forEach( e => {
            const found = item.roles.find(v => v == e.id)
            if (found) e.selected = true
          })
        }
      }
      
      this.openDialog();
    },

    getSelectedRoles() {
      return this.roles.reduce((acc, cur) => {
        if (cur.selected)
          acc.push(cur.id)
        return acc
      }, [])
    },

    openDialog() {
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
      this.valid = true;
      this.dialog = true;
      this.roleSearch = ''
    },

    setUniqueId(_items) {
      let iMaxKey = 0
      for (const i in _items) {
        const data = _items[i]
        iMaxKey = Math.max(data.ikey, iMaxKey)
        if (data.hasOwnProperty("children")) {
          const iChildKey = this.setUniqueId(data.children)
          iMaxKey = Math.max(iMaxKey, iChildKey)
        }
      }
      return iMaxKey
    },

    nextId(_items) {
      return 1 + _items.reduce((accumulator, item) => Math.max(accumulator, item.id), 0)
    },

    uniqueId() {
      this.uniqueTreeId++;
      return this.uniqueTreeId;
    },

    setItemUserActionState(_items, _userAction) {
      for (const i in _items) {
        const data = _items[i]
        data.userAction = _userAction
        if (data.hasOwnProperty("children")) {
          this.setItemUserActionState(data.children, _userAction)
        }
      }
    },

    getChangeState(_items) {
      for (const i in _items) {
        const data = _items[i]
        if (data.userAction != "nochange") {
          return true
        }
        if (data.hasOwnProperty("children")) {
          if (this.getChangeState(data.children)) {
            return true;
          }
        }
      }
      return false
    },

    createCategory() {
      return {
        id: this.nextId(this.items),
        ikey: this.uniqueId(),
        name: this.editName,
        level: 0,
        dataClass: 'Category',
        userAction: 'newData',
        children: [],
        sortorder: this.order
      };
    },

    createTask() {
      //this.selectedItem.userAction = "modified"
      const level = this.selectedItem.level + 1
      let tazk = {
        // id: this.nextId(this.selectedItem.children),
        id: 0,
        ikey: this.uniqueId(),
        name: this.editName,
        level: level,
        activeFlag: 1,
        dataClass: 'Task-Level-' + level,
        userAction: 'newData',
        children: [],
        sortorder: this.order
      };
      if (level >= 1) {
        // tazk["roleid"] = this.selectedRole
        // tazk["roles"] = this.selectedRole
        tazk["roles"] = this.getSelectedRoles()
      }
      return tazk
    },

    async saveAll() {
      if (this.getChangeState(this.items) == false) {
        return
      }
      console.log("before save", this.items)
      this.loading = true     
      const saved = await api.update(this.items);
      this.show_snack(saved)
      if (saved) {
        this.setItemUserActionState(this.items, "nochange")
        this.saveBtnStatus = true
        localStorage.removeItem("dataChange");
      }
      console.log("saveAll", saved);
      this.loading = false
    },

    async save() {
      if (!this.$refs.form.validate()) {
        return;
      }

      if (this.actionMode === "add_category") {
        const category = this.createCategory()
        console.log("save.category", category)
        this.items.push(category);
      } 
      else if (this.actionMode === "add_task") {
        const tazk = this.createTask()
        console.log("save.tazk", tazk)
        this.selectedItem.children = [...this.selectedItem.children, tazk];
      } 
      else {
        this.selectedItem.userAction = "modified"
        this.selectedItem.name = this.editName;
        this.selectedItem.sortorder = this.order
        this.selectedItem.roles = this.getSelectedRoles()
        // console.log("save.edit.tazk", this.selectedItem)
      }
      this.saveBtnStatus = false
      localStorage.setItem('dataChange', true) 
      this.wait = true
      await api.sortTask(this.items)
      this.wait = false
      this.close();
    },

    close() {
      this.dialog = false
      this.selectedItem = null
      // this.selectedRole = null
      this.initilizeRoleSelect()
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

    findParent(items) {
      if (this.selectedItem && items && items.length > 0) {
        for (const i in items) {
          const result = this.searchChildren(items[i])
          if (result) {
            return result
          } else {
            const ret = this.findParent(items[i].children)
            if (ret) {
              return ret
            }
          }
        }
      }
      return null
    },

    searchChildren(item) {
      let result = null
      item.children && item.children.length > 0 && (result = item.children.find( e => e.ikey == this.selectedItem.ikey))
      if (result)
        return item
      return result
    },

    getRoleName(roleId) {
      const found = this.roles.find( e => e.id == roleId)
      if (found)
        return found.name
      return ''
    },

    getRolesByType(type) {
      return this.roles.reduce((acc, cur) => {
        if (cur.roleType == type) {
          if (cur.name.toUpperCase().includes(this.roleSearch.toUpperCase()))
            acc.push(cur)
        }
        return acc
      }, [])
    },

    getRolesCountByType(type) {
      let count = 0
      this.roles.forEach( e => {
        if (e.roleType == type && e.selected) {
          count++
        }
      })
      return count
    }
  },
};
</script>
