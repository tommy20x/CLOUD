<template>
  <v-container id="regular-tables" tag="section">
    
    <base-material-card
        color="green"
    >
      <template v-slot:heading>
          <div class="display-1 font-weight-light">
              Client List
          </div>
      </template>
      <v-data-table
        :headers="headers"
        :items="clients"
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
                dark
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
            <v-dialog v-model="dialog" max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-form ref="form" v-model="valid" lazy-validation>
                    <v-row>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          v-model="editedItem.code"
                          :counter="maxCodeLength"
                          :rules="codeRules"
                          label="Code"
                          class="input-uppercase"
                          required
                          @keydown.space.prevent
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          v-model="editedItem.name"
                          :counter="maxNameLength"
                          :rules="nameRules"
                          label="Name"
						              required
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
          </v-container>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)" color="primary" :disabled="!roles.edit">
            mdi-pencil
          </v-icon>
          <v-icon small disabled @click="deleteItem(item)"> mdi-delete </v-icon>
        </template>

        <template v-slot:item.code="props">
          <v-edit-dialog large @save="updateItemCode(props.item)" @open="inlineEditedCode = props.item.code">
            {{ props.item.code.toUpperCase() }}
            <template v-slot:input>
              <div class="mt-4 title">Update Code</div>
              <v-text-field
                v-model="inlineEditedCode"
                :rules="codeRules"
                :counter="maxCodeLength"
                label="Edit"
                class="input-uppercase"
                single-line
                autofocus
                @keydown.space.prevent
              ></v-text-field>
            </template>
          </v-edit-dialog>
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
import api from "@/apis/client.js";
import auth_api from "@/apis/auth.js";

export default {
  data: () => ({
    loading: true,
    snack: false,
    snackColor: "success",
	  snackText: "",
	  valid: true,
    maxCodeLength: 20,
    maxNameLength: 200,
    inlineEditedCode: "",
    inlineEditedName: "",
    search: "",
    dialog: false,
    dialogDelete: false,
    headers: [
      {
        text: "Code",
        align: "start",
        value: "code",
        width: "30%",
        class: "primary--text"
      },
      { text: "Name", value: "name", class: "primary--text" },
      { text: "Actions", align: "right", value: "actions", sortable: false, class: "primary--text" },
    ],
    clients: [],
    editedIndex: -1,
    editedItem: {
      code: "",
      name: "",
    },
    defaultItem: {
      code: "",
      name: "",
    },
    roles: {}
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Add Client" : "Edit Client";
    },
    codeRules() {
      return [
        (v) => !!v || "Code is required",
        (v) => /^[a-zA-Z0-9]+$/.test(v) || 'Code must only contain letters',
        (v) =>
          (v && v.length <= this.maxCodeLength) ||
          `Code must be less than ${this.maxCodeLength} characters`,
      ];
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
    console.log("roles", this.roles)
  },

  methods: {
    async initialize() {
      this.loading = true
      this.clients = await api.findAll()
      console.log("client", this.clients)
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

    async updateItemCode(item) {
      this.inlineEditedCode = this.inlineEditedCode.trim().toUpperCase()
      console.log("updateItemCode", this.inlineEditedCode)
      if (this.inlineEditedCode.length > 0 && this.inlineEditedCode.length <= this.maxCodeLength) {
        this.loading = true
        {
          const updatedItem = Object.assign({}, item, {code: this.inlineEditedCode})
          const success = await api.update(updatedItem) 
          if (success) {
            Object.assign(item, updatedItem);
          }
          this.show_snack(success)
        }
        this.loading = false
      }
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

      this.editedItem.code = this.editedItem.code.trim().toUpperCase()
      this.editedItem.name = this.editedItem.name.trim()
      
      const selectedIndex = this.editedIndex
      const item = Object.assign({}, this.editedItem)
      this.close();

      this.loading = true
      {
        let success = false
        if (selectedIndex > -1) {
          success = await api.update(item) 
          if (success) {
            Object.assign(this.clients[selectedIndex], item);
          }
        } 
        else {
          const addedItem = await api.add(item)
          if (addedItem) {
            success = true
            this.clients.push(addedItem);
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
  },
};
</script>
