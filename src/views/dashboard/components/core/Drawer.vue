<template>
  <v-navigation-drawer
    id="core-navigation-drawer"
    v-model="drawer"
    :dark="barColor !== 'rgba(228, 226, 226, 1), rgba(255, 255, 255, 0.7)'"
    :expand-on-hover="expandOnHover"
    :right="$vuetify.rtl"
    :src="barImage"
    mobile-breakpoint="960"
    app
    width="240"
    v-bind="$attrs"
  >
    <template v-slot:img="props">
      <v-img
        :gradient="`to bottom, ${barColor}`"
        v-bind="props"
      />
    </template>

    <v-divider class="mb-1" />

    <v-list
      dense
      nav
    >
      <v-list-item>
        <v-list-item-avatar
          class="align-self-center"
          color="dark"
        >
          <v-img
            src="/favicon.png"
          />
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title
            class="display-1"
            v-text="profile.title"
          />
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-divider class="mb-2" />

    <v-list
      expand
      nav
    >

    <template v-for="(item, i) in computedItems">
      <base-item-group
        v-if="item.children"
        :key="`group-${i}`"
        :item="item"
      >
      </base-item-group>

      <base-item
        v-else
        :key="`item-${i}`"
        :item="item"
      />
    </template>

    </v-list>

<!--
    <template v-slot:append>
      <base-item
        :item="{
          title: $t('upgrade'),
          icon: 'mdi-package-up',
          to: '/upgrade',
        }"
      />
    </template> -->
  </v-navigation-drawer>
</template>

<script>
  // Utilities
  import {
    mapState,
  } from 'vuex'

  import api from "@/apis/auth.js";
  
  export default {
    name: 'DashboardCoreDrawer',

    props: {
      expandOnHover: {
        type: Boolean,
        default: false,
      },
    },

    async created() {
      let previlage = api.getLocalprevilage()
      if (!previlage) {
        let result = await api.getPrevilage()
        previlage = result
        localStorage.setItem('previlage', JSON.stringify(result))
      }

      this.items.forEach( e => {
        if (e.children && e.children.length > 0) {
          for(let i = e.children.length - 1; i >= 0; i--) {
            let c = e.children[i]
            const found = previlage.find(p => {
              if (p.menuid == c.id) {
                const allowYes = p.privileges.find(a => a.allowed == 'yes')
                if (!allowYes)
                  return true
              }
              return false
            })
            if (found)
              e.children.splice(i, 1)
          }
        }
      })
    },

    data: () => ({
      items: [
        {
          icon: 'mdi-view-dashboard',
          title: 'dashboard',
          to: '/',
        },
        {
          title: 'common',
          children: [
          {
            icon: 'mdi-account',
            title: 'client',
            to: '/pages/client',
            id: 1
          },
          {
            icon: 'mdi-map-marker',
            title: 'country',
            to: '/pages/country',
            id: 3
          },
          {
            icon: 'mdi-calendar-month',
            title: 'holiday_calendar',
            to: '/pages/holiday',
            id: 2
          }]
        },
        {
          title: 'people_practice',
          children: [
          {
            icon: 'mdi-order-bool-ascending',
            title: 'designation',
            to: '/pages/designation',
            id: 4
          },
          {
            icon: 'mdi-orbit',
            title: 'role',
            to: '/pages/role',
            id: 5
          },
          {
            icon: 'mdi-account-supervisor-circle',
            title: 'people',
            to: '/pages/people',
            id: 6
          },
          {
            icon: 'mdi-account-tie',
            title: 'associate_person',
            to: '/pages/associate_person',
            id: 7
          },
          {
            icon: 'mdi-account-clock',
            title: 'leavem',
            to: '/pages/leave_m',
            id: 8
          },
          {
            icon: 'mdi-alarm-panel',
            title: 'leaveb',
            to: '/pages/leave_b',
            id: 9
          }]
        },
        {
          title: 'project',
          children: [
            {
              icon: 'mdi-file-tree',
              title: 'task',
              to: '/pages/task',
              id: 10
            },
            {
              icon: 'mdi-semantic-web',
              title: 'project',
              to: '/pages/project_summary',
              id: 11
            },
          ]
        },
        {
          title: 'update',
          children: [
            {
              icon: 'mdi-calendar-edit',
              title: 'daily_update',
              to: '/pages/daily',
              id: 12
            }
          ]
        },
        {
          title: 'report',
          children: [
            {
              icon: 'mdi-chart-line',
              title: 'progress',
              to: '/pages/progress',
              id: 13
            },
            {
              icon: 'mdi-text-account',
              title: 'manpower',
              to: '/pages/manpower',
              id: 14
            },
          ]
        },
        {
          title: 'leave',
          children: [
            {
              icon: 'mdi-account-clock-outline',
              title: 'leavea',
              to: '/pages/leave_i',
              id: 15
            }
          ]
        },
      ],

    }),

      computed: {
        ...mapState(['barColor', 'barImage']),
        drawer: {
          get () {
            return this.$store.state.drawer
          },
          set (val) {
            this.$store.commit('SET_DRAWER', val)
          },
        },
        computedItems () {
          return this.items.map(this.mapItem)
        },
        profile () {
          return {
            avatar: true,
            title: this.$t('avatar'),
          }
        },
      },

      methods: {
        mapItem (item) {
          return {
            ...item,
            children: item.children ? item.children.map(this.mapItem) : undefined,
            title: this.$t(item.title),
          }
        },
      },
  }
</script>

<style lang="sass">
  @import '~vuetify/src/styles/tools/_rtl.sass'

  #core-navigation-drawer
    .v-list-group__header.v-list-item--active:before
      opacity: .24

    .v-list-item
      &__icon--text,
      &__icon:first-child
        justify-content: center
        text-align: center
        width: 20px

        +ltr()
          margin-right: 24px
          margin-left: 12px !important

        +rtl()
          margin-left: 24px
          margin-right: 12px !important

    .v-list--dense
      .v-list-item
        &__icon--text,
        &__icon:first-child
          margin-top: 10px

    .v-list-group--sub-group
      .v-list-item
        +ltr()
          padding-left: 8px

        +rtl()
          padding-right: 8px

      .v-list-group__header
        +ltr()
          padding-right: 0

        +rtl()
          padding-right: 0

        .v-list-item__icon--text
          margin-top: 19px
          order: 0

        .v-list-group__header__prepend-icon
          order: 2

          +ltr()
            margin-right: 8px

          +rtl()
            margin-left: 8px
</style>
