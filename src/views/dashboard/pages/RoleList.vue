<template>
  <v-container>
    
    <base-material-card
      color="green"
    >
      <template v-slot:heading>
        <div class="display-1 font-weight-light">
          Role List
        </div>
      </template>
      <v-row>
        <v-col class="px-0 ">
          <v-container>
            <v-progress-linear
                indeterminate
                color="primary"
                v-if="loading">
            </v-progress-linear>
          </v-container>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
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
        </v-col>
      </v-row>
      <v-row>
        <v-col v-for="(item, i) in roleTypes" :key="i">
          <p class="text-center mb-0 py-2 body-1 font-weight-bold" style="background-color: #7B1FA2; color:white">{{ item }}</p>
          <v-data-table
            :headers="headers"
            :items="filteredItems(clients, item)"
            :search="search"
            :hide-default-header="true"
            sort-by="id"
          >
                <!--
            <template v-slot:top>
              <v-container>
                <div flat tile>
                  <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                  ></v-text-field>
                </div>
              </v-container>
            </template>
                -->

            <template v-slot:item.actions="{ item }">
              <v-icon small class="mr-2" @click="editItem(item)" color="primary" title="Edit" :disabled="!roles.edit">
                mdi-pencil
              </v-icon>
              <v-icon v-if="!(clickMenuLoading == item)" small @click="setMenu(item)" color="cyan" title="Menu" :disabled="!roles.edit"> mdi-menu-open </v-icon>
              <v-progress-circular
                  v-if="clickMenuLoading == item"
                  indeterminate
                  color="cyan"
                  :width="2"
                  :size="16"
              ></v-progress-circular>
              <!--
              <v-icon small @click="deleteItem(item)" color="warning" disabled title="Delete"> mdi-delete </v-icon>
              -->
            </template>
            <template v-slot:item.name="props">
              <v-edit-dialog large @save="updateItemName(props.item)" @open="inlineEditedName = props.item.name">
                <div>{{ props.item.name }}</div>
                <template v-slot:input>
                  <div class="mt-4 title">Update Name</div>
                  <v-text-field
                    v-model="inlineEditedName"
                    :rules="nameRules"
                    :counter="maxNameLength"
                    label="Edit"
                    single-line
                    autofocus
                  ></v-text-field>
                </template>
              </v-edit-dialog>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </base-material-card>

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
                <v-text-field
                  v-model="editedItem.name"
                  :counter="maxNameLength"
                  :rules="nameRules"
                  label="Name"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <v-select
                  v-model="editedItem.roleType"
                  :items="roleTypes"
                  :rules="roleRules"
                  label="Role Type"
                  required
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <v-text-field
                  v-model="editedItem.code"
                  :counter="20"
                  :rules="codeRules"
                  label="Code"
                  required
                  class="input-uppercase"
                ></v-text-field>
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
    
    <v-dialog v-model="menuDialog" max-width="600px" scrollable>
      <v-card :loading="menuLoading">
        <v-card-title>
          <span class="headline">Menu Previlage</span><br>
          <span class="title">{{ selectedItem && selectedItem.name + '(' + selectedItem.roleType + ')' }}</span>
        </v-card-title>
        <v-card-text>
          <template v-for="(item, i) in menus">
            <v-row :key="i">
              <v-col class="py-0" style="display: flex; align-items:center;">
                <span>{{item.menuname}}</span>
              </v-col>
              <v-col class="d-flex py-0">
                <template v-for="(e, j) in item.privileges">
                  <template v-if="item.selected && item.selected.length > 0">
                    <v-checkbox 
                      :key="j"
                      :label="e"
                      v-model="item.selected[j]"
                      class="mr-2"
                      @change="checkBoxChanged(item, j, item.selected[j])"
                    >
                    </v-checkbox>
                  </template>
                </template>
              </v-col>
            </v-row>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="menuDialog = false"> Cancel </v-btn>
          <v-btn color="blue darken-1" text @click="saveMenu"> Save </v-btn>
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
import auth_api from "@/apis/auth.js";
import api from "@/apis/role.js";

export default {
  data: () => ({
    loading: true,
    snack: false,
    snackColor: "success",
	  snackText: "",
	  valid: true,
    maxNameLength: 100,
    inlineEditedName: "",
    search: "",
    dialog: false,
    dialogDelete: false,
    headers: [
      {
        text: "Name",
        align: "start",
        value: "name",
        class: "body-1",
        cellClass: "px-1" 
      },
      { text: "Actions", align: "right", value: "actions", sortable: false, cellClass: "px-1" },
    ],
    clients: [],
    editedIndex: -1,
    editedItem: {
      name: "",
      roleType: ""
    },
    defaultItem: {
      name: "",
      roleType: ""
    },
    roleTypes: [],

    snackbar: true,

    selectedItem: null,
    menuDialog: false,
    menus: [],
    menuLoading: false,
    clickMenuLoading: false,
    roles: {}
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Add Role" : "Edit Role";
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
      return [
        (v) => !!v || "Role is required",
      ];
    },
    codeRules() {
      return [
        (v) => !!v || "Code is required",
        (v) => /^[a-zA-Z0-9]+$/.test(v) || 'Code must only contain letters',
        (v) =>
          (v && v.length <= 20) ||
          `Code must be less than 20 characters`,
      ];
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

  created: async function () {
    await this.initialize()
    this.roles = auth_api.getRole()
  },

  methods: {
    async initialize() {
      this.loading = true
      this.clients = await api.findAll()
      this.roleTypes = await api.findAllRoles()
      this.menus = await api.findAllMenus()
      this.initializeMenu()
      console.log("role data", this.clients)
      this.loading = false;
    },

    addItem() {
      this.openAddDialog()
    },

    editItem(item) {
      this.editedIndex = this.clients.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.openAddDialog()
    },
    
    openAddDialog() {
      if (this.$refs.form) {
          this.$refs.form.resetValidation();
      }
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.clients.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.clients.splice(this.editedIndex, 1);
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

    async updateItemName(item) {
      this.inlineEditedName = this.inlineEditedName.trim()
      console.log("updateItemName", this.inlineEditedName)
      if (this.inlineEditedName.length > 0 && this.inlineEditedName.length <= this.maxNameLength) {
        this.loading = true
        {
          const updatedItem = Object.assign({}, item, {name: this.inlineEditedName})
          console.log(updatedItem)
          const success = await api.update(updatedItem) 
          if (success) {
            Object.assign(item, updatedItem);
          }
          this.show_snack(success)
        }
        this.loading = false
      }
    },

    async save() {
      if (!this.$refs.form.validate()) {
          return;
      }	

      this.editedItem.name = this.editedItem.name.trim()
      
      const selectedIndex = this.editedIndex
      const item = Object.assign({}, this.editedItem)
      this.close();

      this.loading = true
      {
        let success = 0
        if (selectedIndex > -1) {
          success = await api.update(item) 
          if (success == 1) {
            Object.assign(this.clients[selectedIndex], item);
          }
        } 
        else {
          const addedItem = await api.add(item)
          if (addedItem) {
            success = 1
            this.clients.push(addedItem);
          }
        }
        if (success == 1)
          this.show_snack(true)
        else if (success == -1)
          this.snack_message('error', 'Code is already exist')
        else
          this.snack_message('error', 'Failed')
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

    snack_message(color, text) {
      this.snack = true;
      this.snackColor = color
      this.snackText = text
    },

    filteredItems(clients, item) {
      const filtered = clients.filter(e=> e.roleType == item)
      return filtered
    },

    initializeMenu() {
      this.menus.forEach( e => {
        e.selected = []
        e.privileges.forEach(v => {
          e.selected.push(false)
        })
      })
    },

    async setMenu(item) {
      this.loading = true
      this.clickMenuLoading = item
      const detail = await api.findOne(item.id)
      // this.selectedItem = detail
      this.selectedItem = detail[0]
      console.log(detail)
      this.initializeMenu()
      const selected = detail[0].privilegesAssigned
      selected.length > 0 && selected.forEach( e => {
        this.menus.forEach(v => {
          if(v.menuid == e.menuid) {
            v.selected = []
            v.privileges.forEach(p => {
              const found = e.privileges.find(p1 => p1 == p)
              if (found)
                v.selected.push(true)
              else
                v.selected.push(false)
            })
          }
        })
      })
      console.log("menus", this.menus)
      this.menuDialog = true
      this.clickMenuLoading = null 
      this.loading = false
    },

    async saveMenu() {
      this.menuLoading = true
      let data = []
      this.menus.forEach(e => {
        // const found = e.selected.find( v => v == true)
        // if (found) {
          let temp = Object.assign({}, e)
          data.push(temp)
        // }
      })
      console.log("save menus", data)

      const result = await api.saveMenu(this.selectedItem.id, data)

      this.show_snack(result)
      this.menuLoading = false
    },

    checkBoxChanged(item, i, selected) {
      let temp = this.menus
      this.menus = []
      console.log("selected changed", item, i, selected)
      if (item.privileges[i] != 'view' && selected) {
        item.privileges.forEach((e, j) => {
          if (e == 'view')
            item.selected[j] = selected
        })
      } else if (item.privileges[i] == 'view' && !selected) {
        item.privileges.forEach((e, j) => {
          if (e != 'view')
            item.selected[j] = selected
        })
      }

      this.menus = temp
    }
  },
};
</script>
