<template>
  <base-material-card
  icon="mdi-notebook-edit"
  title="Project Detail"
  color="purple"
  class="px-5 py-3"
  >
    <v-card-title class="px-0 mx-4"> 
      <v-row>
        <v-col class="text-right">
          <v-btn @click="addPhase" color="pink" text>Add Phase</v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <v-btn>back</v-btn>
    <v-form ref="details_form" @submit.prevent="submit">
      <v-container>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-text-field readonly label="Name" style="font-size:14px"  v-model="projectName"/>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field readonly label="Code" style="font-size:14px"  v-model="projectCode"/>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field readonly label="Client" style="font-size:14px"  v-model="projectClient"/>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-text-field readonly label="Pre sales Date" style="font-size:14px" v-model="preSalesDateRange"/>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field readonly label="Billing Date" style="font-size:14px" v-model="billingDateRange"/>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field readonly label="Warranty Date" style="font-size:14px"  v-model="warrantyDateRange"/>
          </v-col>
        </v-row>
      </v-container>
    </v-form>

  </base-material-card>
</template>

<script>
  export default {
    name: 'ProjectDetails',
    props: ['project', 'clients'],

    data: () => ({

    }),

    computed: {
      projectName: function() {
        return (this.project) ? this.project.prj_name : ''
      },
      projectCode: function() {
        return (this.project) ? this.project.prj_code : ''
      },
      projectClient: function() {
        // return (this.project) ? this.project.cl_id : ''
        console.log("clients", this.clients)
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
    },

    methods: {
      addPhase: function() {
        if (this.project != null) {
          this.$emit('addPhase', this.project)
        }
      },
    }
  }
</script>
