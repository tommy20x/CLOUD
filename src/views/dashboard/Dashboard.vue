<template>
  <v-container> 
    <v-progress-linear
        class="mb-1"
        indeterminate
        color="green"
        v-if="wait">
    </v-progress-linear>

    <v-card
      id="settings"
      class="py-2 px-4"
      color="rgba(0, 0, 0, .3)"
      dark
      flat
      link
      min-width="100"
      style="position: fixed; top: 245px; right: -35px; border-radius: 8px;"
      @click="dateClick()"
    >
      <v-icon large>
        mdi-clock-time-five-outline
      </v-icon>
    </v-card>

    <v-row>
      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <base-material-stats-card
          color="info"
          icon="mdi-excavator"
          title="Projects"
          :value="projectCount"
          :items="getProjectItems"
        />
      </v-col>

      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <base-material-stats-card
          color="primary"
          icon="mdi-shield-check"
          title="Roles"
          :value="roleCount"
          :items="getRoleItems"
        />
      </v-col>

      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <base-material-stats-card
          color="success"
          icon="mdi-rowing"
          title="Planned Leaves"
          :value="myLeaveCount"
          :items="getMyLeaveItems"
        />
      </v-col>

      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <base-material-stats-card
          color="orange"
          icon="mdi-sail-boat "
          title="Collegue Leaves"
          :value="collegueLeaveCount"
          :items="getCollegueLeaveItems"
        />
      </v-col>
    </v-row>

    <v-row>     
      <v-col
        cols="12"
        sm="6"
        lg="4"
      >
        <base-material-stats-card
          color="pink"
          icon="mdi-bell"
          title="Notification"
          :value="messageCount"
          :items="messages"
        />
      </v-col>
      
      <v-col
        cols="12"
        sm="6"
        lg="4"
      >
        <base-material-stats-card
          color="purple"
          icon="mdi-text-account"
          title="Task"
          :value="taskCount"
          :detailDisable="true"
        />
      </v-col>

      <v-col
        cols="12"
        sm="6"
        lg="4"
      >
        <base-material-stats-card
          color="primary"
          icon="mdi-account-star"
          title="Grade Points"
          :value="gradePoints"
          :items="getPersonalItems"
        />
      </v-col>
    </v-row>
    
    <v-row>      
      <v-col
        cols="12"
        md="6"
      >
        <base-material-card
          color="warning"
          class="px-5 py-3"
        >
          <template v-slot:heading>
            <div class="display-2 font-weight-light">
              Active Tasks and Allocated Tasks
            </div>
          </template>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="activeTask"
            />
          </v-card-text>
        </base-material-card>
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <base-material-card
          color="pink"
          class="px-5 py-3"
        >
          <template v-slot:heading>
            <div class="display-2 font-weight-light">
              Overdue Tasks
            </div>
          </template>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="dueTask"
            />
          </v-card-text>
        </base-material-card>

        <base-material-card
          color="primary"
          class="px-5 py-3"
        >
          <template v-slot:heading>
            <div class="display-2 font-weight-light">
              New Tasks for next Week
            </div>
          </template>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="futureTask"
            />
          </v-card-text>
        </base-material-card>
      </v-col>
    </v-row>

    
    <v-dialog v-model="dateDialog" max-width="500px">
        <v-card>
            <v-card-title>
                <span class="headline">Change Date</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <div>
                        <DatePicker
                            textName="Date From"
                            :date="fromDate"
                            :submit="(date) => fromDate = date"
                            :endDate="toDate"
                        ></DatePicker>
                    </div>
                    <div>
                        <DatePicker
                            textName="Date To"
                            :date="toDate"
                            :submit="(date) => toDate = date"
                            :startDate="fromDate"
                        ></DatePicker>
                    </div>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dateDialog = false"> Cancel </v-btn>
                <v-btn color="blue darken-1" text @click="changeDate">
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import DatePicker from './pages/DatePicker'
import auth_api from "@/apis/auth.js";
import daily_api from "@/apis/daily.js";

export default {
  components: {
      DatePicker
  },

  data: () => ({
    wait: false,

    hrId: 0,
    data: {},
    activeTask: [],
    dueTask: [],
    futureTask: [],

    headers: [
      {
        sortable: false,
        text: 'No',
        value: 'no',
      },
      {
        sortable: false,
        text: 'Project',
        value: 'projectname',
      },
      {
        sortable: false,
        text: 'Task',
        value: 'TaskName',
      },
      {
        sortable: false,
        text: 'Date',
        value: 'date',
        align: 'center',
      }
    ],

    toDate: null,
    fromDate: null,
    dateDialog: false
  }),

  created() {
    this.initialize()
  },

  computed: {
    projectCount() {
      console.log('projects', this.data.my_projects)
      if (this.data && this.data.my_projects)
        return this.data.my_projects.length.toString()
      return '0'
    },

    myLeaveCount() {
      if (this.data && this.data.leaves_of_me)
        return this.data.leaves_of_me.length.toString()
      return '0'
    },

    collegueLeaveCount() {
      if (this.data && this.data.leaves_of_mycolleagues)
        return this.data.leaves_of_mycolleagues.length.toString()
      return '0'
    },

    roleCount() {
      if (this.data && this.data._my_roles)
        return this.data._my_roles.length.toString()
      return '0'
    },
    
    taskCount() {
      if (this.data && this.data.my_tasks)
        return this.data.my_tasks.length.toString()
      return '0'
    },

    messages() {
      let result = []
      if (this.data && this.data.notifications) {
        this.data.notifications.forEach(e => {
          console.log('eee', e)
          result.push({title: e.shortDesc, date: e.publishedDate.toString().substring(0, 10)})
        })
        return result
      }
      return []
    },

    messageCount() {
      if (this.data && this.data.notifications)
        return this.data.notifications.length.toString()
      return '0'
    },

    gradePoints() {
      if (this.data && this.data.PersonDetails && this.data.PersonDetails[0] && this.data.PersonDetails[0].gradePoints)
        return this.data.PersonDetails[0].gradePoints.toString()
      return ''
    },

    getProjectItems() {
      if (this.data && this.data.my_projects && this.data.my_projects.length > 0) {
        return this.data.my_projects.reduce((acc, cur) => {
          acc.push({ title: cur.projectname })
          return acc
        }, [])
      }
      return [{title: "no data"}]
    },

    getRoleItems() {
      if (this.data && this.data._my_roles && this.data._my_roles.length > 0) {
        return this.data._my_roles.reduce((acc, cur) => {
          acc.push({ title: cur.rolename })
          return acc
        }, [])
      }
      return [{title: "no data"}]
    },

    getMyLeaveItems() {
      if (this.data && this.data.leaves_of_me && this.data.leaves_of_me.length > 0) {
        return this.data.leaves_of_me.reduce((acc, cur) => {
          acc.push({ title: cur.leaveReason, date: cur.dtFrom + ' ~ ' + cur.dtTo })
          return acc
        }, [])
      }
      return [{title: "no data"}]
    },

    getCollegueLeaveItems() {
      if (this.data && this.data.leaves_of_mycolleagues && this.data.leaves_of_mycolleagues.length > 0) {
        return this.data.leaves_of_mycolleagues.reduce((acc, cur) => {
          acc.push({ title: cur.leaveReason, date: cur.dtFrom + ' ~ ' + cur.dtTo, name: cur.firstname + ' ' + cur.lastname })
          return acc
        }, [])
      }
      return [{title: "no data"}]
    },

    getPersonalItems() {
      if (this.data && this.data.PersonDetails) {
        return this.data.PersonDetails.reduce((acc, cur) => {
          acc.push({ title: cur.designationName})
          acc.push({ title: cur.designationCode})
          acc.push({ title: cur.designationScalecode})
          return acc
        }, [])
      }
      return [{title: "no data"}]
    }
  },

  methods: {
    async initialize() {
      this.wait = true
      if (!this.toDate) {
        this.toDate = daily_api.getToday()
        this.fromDate = daily_api.getDayByDiff(this.toDate, -30)
      }
      this.data = await auth_api.getDashBoardData(this.fromDate, this.toDate)

      this.activeTask = []
      this.dueTask = []
      this.futureTask = []

      if (this.data.my_tasks && this.data.my_tasks.length > 0) {

        this.activeTask = this.data.my_tasks.reduce((acc, cur)=> {
          if (cur.showThisLine_Category == "Active-and-allocated-task") {
            cur.date = cur.estimatedStartDate + ' ~ ' + cur.estimatedEndDate
            cur.no = acc.length + 1
            acc.push(cur)
          }
          return acc
        }, [])
      
        this.dueTask = this.data.my_tasks.reduce((acc, cur)=> {
          if (cur.showThisLine_Category == "Task.Due") {
            cur.date = cur.estimatedStartDate + ' ~ ' + cur.estimatedEndDate
            cur.no = acc.length + 1
            acc.push(cur)
          }
          return acc
        }, [])
      
        this.futureTask = this.data.my_tasks.reduce((acc, cur)=> {
          if (cur.showThisLine_Category == "My.futureTasks") {
            cur.date = cur.estimatedStartDate + ' ~ ' + cur.estimatedEndDate
            cur.no = acc.length + 1
            acc.push(cur)
          }
          return acc
        }, [])
      }
      console.log('data: ', this.data)
      this.wait = false
    },

    getStyle(red) {
      if (red == 1) {
        return 'color: #E91E63'
      }
      return ''
    },

    dateClick() {
      this.dateDialog = true
    },

    changeDate() {
      this.dateDialog = false
      this.initialize()
    }
  }
}
</script>