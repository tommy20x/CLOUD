<template>
  <v-menu
    ref="menu"
    v-model="showMenu"
    :close-on-content-click="false"
    :return-value.sync="project.prj_presalesopendate"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="project.prj_presalesopendate"
        label="Pre sale date from"
        prepend-icon="mdi-calendar"
        readonly
        v-bind="attrs"
        v-on="on"
      ></v-text-field>
    </template>
    <v-date-picker
      v-model="project.prj_presalesopendate"
      no-title
      scrollable
    >
      <v-spacer></v-spacer>
      <v-btn
        text
        color="primary"
        @click="showMenu = false"
      >
        Cancel
      </v-btn>
      <v-btn
        text
        color="primary"
        @click="$refs.menu.save(date)"
      >
        OK
      </v-btn>
    </v-date-picker>
  </v-menu>
</template>

<script>
export default {
  name: 'DateSelector',
  props: {},

  data: () => ({
    date: '2021-01-01',
    showMenu: false,
  }),

  mounted: function() {
  },

  computed: {
  },

  methods: {
    save: function() {
      this.$emit('close')
    },

    close: function() {
      this.$emit('close')
    },
  }
};
</script>
