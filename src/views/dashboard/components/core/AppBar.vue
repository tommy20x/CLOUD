<template>
  <v-app-bar
    id="app-bar"
    absolute
    app
    color="transparent"
    flat
    height="75"
  >
    <v-btn
      class="mr-3"
      elevation="1"
      fab
      small
      @click="setDrawer(!drawer)"
    >
      <v-icon v-if="value">
        mdi-view-quilt
      </v-icon>

      <v-icon v-else>
        mdi-dots-vertical
      </v-icon>
    </v-btn>

    <v-toolbar-title
      class="hidden-sm-and-down font-weight-light"
      v-text="$route.name"
    />

    <v-spacer />

    <div class="mx-3" />

    <v-btn
      class="ml-2"
      min-width="0"
      text
      to="/"
    >
      <v-icon>mdi-view-dashboard</v-icon>
    </v-btn>

    <v-menu
      bottom
      left
      offset-y
      origin="top left"
      transition="scale-transition"
    >
      <template v-slot:activator="{ attrs, on }">
        <v-btn
          class="ml-2"
          min-width="0"
          text
          v-bind="attrs"
          v-on="on"
        >
          <v-icon>mdi-information-outline</v-icon>
        </v-btn>
      </template>

      <v-list
        nav
      >
        <div>
          <app-bar-item v-for="(e, i) in info" :key="i">
            <v-list-item-title>
              {{e}}
            </v-list-item-title>
          </app-bar-item>
        </div>
      </v-list>
    </v-menu>

    <v-menu
      bottom
      left
      offset-y
      origin="top right"
      transition="scale-transition"
    >
      <template v-slot:activator="{ attrs, on }">
        <v-btn
          class="ml-2"
          min-width="0"
          text
          v-bind="attrs"
          v-on="on"
        >
          <v-icon>mdi-account</v-icon>
        </v-btn>
      </template>

      <v-list
        :tile="false"
        nav
      >
        <div>
          <app-bar-item>
            <v-list-item-title>
              <div @click="logout">
                ({{ getCode }})&nbsp;&nbsp;&nbsp;Log Out <v-icon>mdi-logout</v-icon>
              </div>
            </v-list-item-title>
          </app-bar-item>
          <app-bar-item>
            <v-list-item-title>
              <div @click="changePassword">
                Change Password<v-icon>mdi-pen-lock</v-icon>
              </div>
            </v-list-item-title>
          </app-bar-item>
        </div>
      </v-list>
    </v-menu>

    <template>
      <v-dialog v-model="passwordDialog" max-width="500px">
        <v-card :loading="wait">
          <v-card-title>
            <span class="headline"> Change Password</span><br>
            <span class="title">{{getCode}}</span>
          </v-card-title>

          <v-card-text>
            <v-form  ref="form" lazy-validation>
              <v-text-field
                  label="Current Password"
                  :append-icon="currentShow ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="currentShow ? 'text' : 'password'"
                  @click:append="currentShow = !currentShow"
                  prepend-icon="mdi-account-lock"
                  v-model="currentPassword"
                  :rules="currentRules"
                  counter
              ></v-text-field>

              <v-text-field
                  label="Password"
                  :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="show ? 'text' : 'password'"
                  @click:append="show = !show"
                  prepend-icon="mdi-pen-lock"
                  v-model="password"
                  :rules="passwordRules"
                  counter
              ></v-text-field>
              <v-text-field
                  label="Confirm"
                  :append-icon="confirmShow ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="confirmShow ? 'text' : 'password'"
                  @click:append="confirmShow = !confirmShow"
                  prepend-icon="mdi-pen-lock"
                  v-model="confirmPassword"
                  :rules="confirmRules"
                  counter
              ></v-text-field>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small color="blue darken-1" text @click="passwordDialog = false"> Cancel </v-btn>
            <v-btn small color="ml-5 blue darken-1" @click="savePassword">
                Change Password
            </v-btn>
          </v-card-actions>
        </v-card>      
        <base-material-snackbar
          v-model="snack"
          :type="snackColor"
          v-bind="{
              bottom: true,
              center: true,
              color: snackColor
          }"
          style="bottom: -50px"
          >
          {{ snackText }}
        </base-material-snackbar>
      </v-dialog>

      <base-material-snackbar
          v-model="snack1"
          :type="snackColor1"
          v-bind="{
              bottom: true,
              center: true,
              color: snackColor1
          }"
          style="bottom: -50px"
          >
          {{ snackText1 }}
      </base-material-snackbar>
    </template>
  </v-app-bar>
</template>

<script>
  import auth_api from "@/apis/auth.js";
  // Components
  import { VHover, VListItem } from 'vuetify/lib'

  // Utilities
  import { mapState, mapMutations } from 'vuex'

  export default {
    name: 'DashboardCoreAppBar',

    components: {
      AppBarItem: {
        render (h) {
          return h(VHover, {
            scopedSlots: {
              default: ({ hover }) => {
                return h(VListItem, {
                  attrs: this.$attrs,
                  class: {
                    'black--text': !hover,
                    'white--text secondary elevation-12': hover,
                  },
                  props: {
                    activeClass: '',
                    dark: hover,
                    link: true,
                    ...this.$attrs,
                  },
                }, this.$slots.default)
              },
            },
          })
        },
      },
    },

    props: {
      value: {
        type: Boolean,
        default: false,
      },
    },

    data: () => ({
      info: [],
      passwordDialog: false,

      currentShow: false,
      currentPassword: '',

      show: false,
      password: '',

      confirmShow: false,
      confirmPassword: '',

      wait:false,

      snack: false,
      snackColor: "success",
	    snackText: "",

      snack1: false,
      snackColor1: "success",
	    snackText1: "",
    }),

    async created() {
      const temp = await auth_api.getInfo()
      for (const [key, value] of Object.entries(temp)) {
        this.info.push(key + ' : ' + value)
      }
    },

    computed: {
      ...mapState(['drawer']),
      getCode() {
        return localStorage.getItem('code')
      },
      
      passwordRules() {
          return [
              (v) => !!v || "Password is required",
              (v) => (v && v.trim().length > 0) || "Password is required",
              (v) =>
                  (v && v.length >= 6) ||
                  `Password must be greater than 8 characters`,
          ];
      },
      
      confirmRules() {
          return [
              (v) => !!v || "Confrim Password is required",
              (v) => (v && v.trim().length > 0) || "Confirm Password is required",
              (v) =>
                  (v == this.password) ||
                  `Confirm password is not same`,
          ];
      },
      
      currentRules() {
          return [
              (v) => !!v || "Current Password is required",
              (v) => (v && v.trim().length > 0) || "Current Password is required"
          ];
      },
    },

    methods: {
      ...mapMutations({
        setDrawer: 'SET_DRAWER',
      }),

      logout: () => {
        localStorage.clear()
        window.location.href = "/"
      },

      changePassword() {
        this.$refs.form && this.$refs.form.resetValidation()
        this.passwordDialog = true
        this.password = ''
        this.confirmPassword = ''
        this.currentPassword = ''
      },

      async savePassword() {
        if (!this.$refs.form.validate()) return
        this.wait = true
        const result = await auth_api.changePassword(this.currentPassword, this.password)
        if (result == 1) {
          this.passwordDialog = false 
          this.snack1 = true
          this.snackColor1 = "success"
          this.snackText1 = "Success! Password is changed"
        } else if (result == 0) {
          this.snack = true
          this.snackColor = "error"
          this.snackText = "Failed"
        } else if (result == -1) {
          this.snack = true
          this.snackColor = "warning"
          this.snackText = "Please input correct information"
        }
        this.wait = false
      }
    },
  }
</script>
