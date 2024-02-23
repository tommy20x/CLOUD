<template>
    <!--Add project dialog-->
    <v-card>
      <v-card-title>
        <span class="headline">{{formTitle}}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form ref="projectForm" lazy-validation>
            <div>
              <v-text-field
                :counter="maxNameLength"
                v-model="project.prj_name"
                :rules="projectNameRules"
                label="Name"
                required
                dense
              ></v-text-field>
            </div>
            <v-row>
              <v-col cols="12" sm="12" md="6">
                <span class="title">{{lastProjectCode}}</span>
                <v-text-field
                  :counter="maxCodeLength"
                  v-model="project.prj_code"
                  :rules="projectCodeRules"
                  label="Code"
                  class="input-uppercase pt-0"
                  required
                  persistent-hint
                  @keydown.space.prevent
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="12" md="6">
                <span class="title">{{lastProjectEnqNumber}}</span>
                <v-text-field
                  :counter="maxCodeLength"
                  v-model="project.prj_refEnqNumber"
                  :rules="enqRules"
                  class="pt-0"
                  label="Enquiry Number"
                  persistent-hint 
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  v-model="project.prj_projectmanagerhrid"
                  :items="sortedAssociates"
                  :rules="projectManagerRules"
                  item-value="id"
                  item-text="name"
                  label="Project Manager"
                  attach
                  required
                  dense
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <v-select
                  v-model="project.cl_id"
                  :items="clientList"
                  :rules="clientSelectRules"
                  label="Client"
                  attach
                  required
                  dense
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="py-0">
                <DatePicker
                  textName="Pre sale date from"
                  :date="this.project.prj_presalesopendate"
                  :submit="(date) => this.project.prj_presalesopendate = date"
                  :endDate="this.project.prj_presalesclosedate"
                  :type="`optional`"
                ></DatePicker>
              </v-col>
              <v-col class="py-0">
                <DatePicker
                  textName="Pre sale date to"
                  :date="this.project.prj_presalesclosedate"
                  :submit="(date) => this.project.prj_presalesclosedate = date"
                  :startDate="this.project.prj_presalesopendate"
                  :type="`optional`"
                ></DatePicker>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="py-0">
                <DatePicker
                  textName="Billing date from"
                  :date="this.project.prj_executionopendate"
                  :submit="(date) => this.project.prj_executionopendate = date"
                  :endDate="this.project.prj_executionclosedate"
                ></DatePicker>
              </v-col>
              <v-col class="py-0">
                <DatePicker
                  textName="Billing date to"
                  :date="this.project.prj_executionclosedate"
                  :submit="(date) => this.project.prj_executionclosedate = date"
                  :startDate="this.project.prj_executionopendate"
                ></DatePicker>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="py-0">
                <DatePicker
                  textName="Warranty date from"
                  :date="this.project.prj_warrantyopendate"
                  :submit="(date) => this.project.prj_warrantyopendate = date"
                  :endDate="this.project.prj_warrantyclosedate"
                  :type="`optional`"
                ></DatePicker>
              </v-col>
              <v-col class="py-0">
                <DatePicker
                  textName="Warranty date to"
                  :date="this.project.prj_warrantyclosedate"
                  :submit="(date) => this.project.prj_warrantyclosedate = date"
                  :startDate="this.project.prj_warrantyopendate"
                  :type="`optional`"
                ></DatePicker>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
        <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
      </v-card-actions>
    </v-card>
</template>

<script>
import DatePicker from './DatePicker'

export default {
  name: 'AddProjectDialog',
  props: {
    clients: Array,
    project: Object,
    edit: Boolean,
    associates: Array,
    dialogStatus: Boolean,
    lastProject: Array
  },
  components: {
    DatePicker,
  },

  data: () => ({
    clientList: [],
    maxNameLength: 200,
    maxCodeLength: 20,
    preSaleFromMenu: false,
    preSaleToMenu: false,
    billingFromMenu: false,
    billingToMenu: false,
    warrantyFromMenu: false,
    warrantyToMenu: false,
    sortedAssociates: []
  }),

  watch: {
    dialogStatus: function(n, o)  {
      if (n) this.reset()
    }
  },

  mounted: function() {
    this.clientList = this.clients.map((it) => {
      return {
        text: it.code + " - " + it.name,
        value: it.id,
        disabled: false,
      }
    })
  },

  created() {
    this.sortedAssociates = this.associates.reduce((acc, v) => {
      v.name = v.firstname + " " + v.lastname
      acc.push(v)
      return acc
    }, [])
    
    this.sortedAssociates.sort((a, b) => {
      const nameA = a.firstname.toUpperCase(); // ignore upper and lowercase
      const nameB = b.firstname.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      // names must be equal
      return 0;
    })
    this.reset()
  },

  computed: {
    formTitle() {
      return (this.edit) ? 'Edit Project' : 'Add Project'
    },
    projectNameRules() {
      return [
        (v) => !!v || "Name is required",
        (v) => (v && v.trim().length > 0) || "Name is required",
        (v) =>
          (v && v.length <= this.maxNameLength) ||
          `Name must be less than ${this.Length} characters`,
      ]
    },

    projectCodeRules() {
      return [
        (v) => !!v || "Code is required",
        (v) => /^[a-zA-Z0-9]+$/.test(v) || 'Code must only contain letters',
        (v) =>
          (v && v.length <= this.maxCodeLength) ||
          `Code must be less than ${this.Length} characters`,
      ];
    },

    enqRules() {
      return [
        // (v) => !!v || "Enquiry Number is required",
        // (v) =>
        //   (v && v.length <= this.maxCodeLength) ||
        //   `Enquiry Number must be less than ${this.Length} characters`,
        (v) => {
          if (!v) return "Enquiry Number is required"
          if (v.length > this.maxCodeLength)
            return `Enquiry Number must be less than ${this.Length} characters`
          if (!this.edit && this.lastProject && this.lastProject.length > 0 && v < this.lastProject[0].refEnqNumber)
            return ' > ' + this.lastProject[0].refEnqNumber
          return true
        }
      ];
    },
    clientSelectRules() {
      return [
        (v) => !!v || "Client is required"
      ];
    },
    projectManagerRules() {
      return [
        (v) => !!v || "Projetc manager is required"
      ];
    },

    lastProjectCode() {
      if (!this.edit) {
        if (this.lastProject && this.lastProject.length > 0) {
          return 'Last code: ' + this.lastProject[0].code
        }
      }
      return ''
    },

    lastProjectEnqNumber() {
      if (!this.edit) {
        if (this.lastProject && this.lastProject.length > 0) {
          return 'Last number: ' + this.lastProject[0].refEnqNumber
        }
      }
      return ''
    },
  },

  methods: {
    reset: function() {
      if(this.$refs.projectForm) this.$refs.projectForm.resetValidation();
    },

    save: function() {
      if (this.$refs.projectForm.validate()) {
        this.project.prj_code = this.project.prj_code.trim().toUpperCase();

        this.$emit('save', {
          project: Object.assign({}, this.project),
          edit: this.edit,
        })

        this.reset()
      }
    },

    close: function() {
      this.$emit('close')
      this.reset()
    },
  }
};
</script>
