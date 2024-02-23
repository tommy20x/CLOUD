<template>
  <v-container id="regular-tables" tag="section">
    <base-material-card
      color="green"
    >
      <template v-slot:heading>
        <div class="display-1 font-weight-light">
          Designation
        </div>
      </template>
      <v-data-table
        :headers="headers"
        :items="clients"
        :search="search"
        :loading="loading"
        loading-text="Loading... Please wait"
        sort-by="level"
        sort-desc
      >
        <template v-slot:top>
          <v-container>
            <div class="d-flex flex-row-reverse" flat tile>
              <v-btn
                color="blue"
                class="mb-2"
                @click="addItem"
                :disabled="!roles.add"
                fab
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
            <v-dialog v-model="dialog" max-width="550px">
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-form ref="form" v-model="valid" lazy-validation>
                    <v-row>
                      <v-col>
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
                      <v-col cols="12" sm="12" md="4">
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
                      <v-col>
                        <v-text-field
                          v-model="editedItem.level"
                          label="level"
                          type="number"
                          :rules="levelRules"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col class="text-center">
                        <v-btn v-for="i in 9" :key="i" small style="margin-right: 2px; color: black" :color="scaleColor(i)" @click="scaleClick(i)">
                          {{ scaleName(i) }}
                        </v-btn>
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
		      	<!--Delete Dialog End-->
          </v-container>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)" color="primary" :disabled="!roles.edit">
            mdi-pencil
          </v-icon>
          <v-icon small @click="deleteItem(item)" color="warning" disabled> mdi-delete </v-icon>
        </template>
        
        <template v-slot:item.codes="{ item }">
          <template v-if="item.scalecodes && item.scalecodes.length > 0">
            <v-btn v-for="(e, i) in item.scalecodes" :key="i" small color="pink lighten-4" style="margin-left: 2px; color:black">
              {{ e }}
            </v-btn>
          </template>
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
import auth_api from "@/apis/auth.js";
import api from "@/apis/designation.js";

export default {
  data: () => ({
    loading: true,
    snack: false,
    snackColor: "success",
	  snackText: "",
	  valid: true,
    maxCodeLength: 5,
    maxNameLength: 200,
    inlineEditedCode: "",
    inlineEditedName: "",
    search: "",
    dialog: false,
    dialogDelete: false,
    headers: [
      // {
      //   text: "Code",
      //   align: "start",
      //   value: "code",
      //   width: "30%",
      //   class: 'success--text body-1'
      // },
      { text: "Name", value: "name", class: 'success--text' },
      { text: "Level", value: "level", class: 'success--text' },
      { text: "Code", value: "code", class: 'success--text' },
      { text: "", value: "codes", class: 'success--text', width:"50%", sortable: false},
      { text: "Actions", align: "right", value: "actions", sortable: false, class: 'success--text' },
    ],
    clients: [],
    editedIndex: -1,
    editedItem: {
      code: "",
      name: "",
      level: "",
      scalecodes: [1]
    },
    defaultItem: {
      code: "",
      name: "",
      level: "",
      scalecodes: [1]
    },
    roles: {}
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Add Designation" : "Edit Designation";
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
    levelRules() {
      return [
        (v) => !!v || "Level is required",
        (v) => v >= 1 || " >= 1",
        (v) => v <= 999999 || " <= 999999",
        (v) => v % 1 == 0 || "invalid"
      ]
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
      console.log("clients", this.clients)
      this.loading = false;
    },

    addItem() {
      this.openAddDialog()
    },

    editItem(item) {
      console.log("item", item)
      this.editedIndex = this.clients.indexOf(item);
      this.editedItem = Object.assign({}, item);

      let tempScales = []
      this.editedItem.scalecodes && this.editedItem.scalecodes.length > 0 && this.editedItem.scalecodes.forEach((e, i) => {
        tempScales.push(i+1)
      })
      if (tempScales.length == 0) tempScales.push(1)
      this.editedItem.scalecodes = tempScales
      console.log("tempScales", tempScales)

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
      const firstLetter = this.editedItem.name.slice(0, 1)
      let tempScales = []
      for (const i in this.editedItem.scalecodes) {
        const e = this.editedItem.scalecodes[i]
        tempScales.push(firstLetter.toUpperCase() + e)
      }
      this.editedItem.scalecodes = tempScales

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

    scaleName(i) {
      let firstLetter = ""
      if (this.editedItem.name) {
        firstLetter = this.editedItem.name.slice(0, 1)
      }
      return firstLetter.toUpperCase() + i
    },

    scaleColor(i) {
      const found =this.editedItem.scalecodes.find(e => e == i)
      if (found)
        return "pink lighten-4"
      else
        return "white"
    },

    scaleClick(i) {
      if (i == 1) return
      var index = this.editedItem.scalecodes.indexOf(i)
      if (index > -1) {
        this.editedItem.scalecodes.splice(index, 9)
      }
      else {
        this.editedItem.scalecodes = []
        for (let j = 1; j <= i; j++)
          this.editedItem.scalecodes.push(j)
      }
    }
  },
};
</script>
