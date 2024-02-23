<template>
  <base-material-card
    :icon="icon"
    class="v-card--material-stats"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-slot:after-heading>
      <div class="ml-auto text-right">
        <div
          class="body-3 grey--text font-weight-light"
          v-text="title"
        />

        <h3 class="display-2 font-weight-light text--primary">
          {{ value }} <small>{{ smallValue }}</small>
        </h3>
      </div>
    </template>
    <!--
    <v-col
      cols="12"
      class="px-0"
    >
      <v-divider />
    </v-col>

    <v-icon
      :color="subIconColor"
      size="16"
      class="ml-2 mr-1"
    >
      {{ subIcon }}
    </v-icon>

    <span
      :class="subTextColor"
      class="caption grey--text font-weight-light"
      v-text="subText"
    />
    -->
    <v-col
      cols="12"
      class="px-0"
    >
      <v-divider />
    </v-col>

    <div class="text-right" style="width: 100%" v-if="!this.detailDisable">
      <v-menu
        offset-x
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="primary"
            dark
            text
            v-bind="attrs"
            v-on="on"
            style="padding: 10px 5px !important"
          >
            Show Details <v-icon class="ml-2">mdi-arrow-right-bold</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            v-for="(item, index) in items"
            :key="index"
          >
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <template v-if="item.date">
                <v-list-item-subtitle>{{ item.date }}</v-list-item-subtitle>
              </template>
              <template v-if="item.name">
                <v-list-item-subtitle>{{ item.name }}</v-list-item-subtitle>
              </template>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <div class="text-center" style="width:100%" v-if="this.detailDisable">
      <v-btn
        color="primary"
        dark
        text
        style="padding: 10px 5px !important"
      >
        <v-icon class="ml-2">mdi-arrow-down-bold</v-icon>
      </v-btn>
    </div>
  </base-material-card>
</template>

<script>
  import Card from './Card'

  export default {
    name: 'MaterialStatsCard',

    inheritAttrs: false,

    props: {
      ...Card.props,
      icon: {
        type: String,
        required: true,
      },
      subIcon: {
        type: String,
        default: undefined,
      },
      subIconColor: {
        type: String,
        default: undefined,
      },
      subTextColor: {
        type: String,
        default: undefined,
      },
      subText: {
        type: String,
        default: undefined,
      },
      title: {
        type: String,
        default: undefined,
      },
      value: {
        type: String,
        default: undefined,
      },
      smallValue: {
        type: String,
        default: undefined,
      },
      detailDisable: Boolean,
      items: Array
    },

  }
</script>

<style lang="sass">
.v-card--material-stats
  display: flex
  flex-wrap: wrap
  position: relative

  > div:first-child
    justify-content: space-between

  .v-card
    border-radius: 4px
    flex: 0 1 auto

  .v-card__text
    display: inline-block
    flex: 1 0 calc(100% - 120px)
    position: absolute
    top: 0
    right: 0
    width: 100%

  .v-card__actions
    flex: 1 0 100%
</style>
