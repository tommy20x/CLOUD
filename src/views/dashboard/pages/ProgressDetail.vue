<template>
    <div>
        <div v-for="(e, i) in items" :key="i" class="pl-5">
            <div class="body-1 py-2 my-1 font-weight-bold">
                <span :style="setBackgroundColor(e)" v-if="e.backgroundColor">I</span>
                <span class="ml-2" :style="setFontColor(e)">{{e.TLx_name}}</span>
            </div>
            <center v-if="e.efforts && e.efforts.length > 0">
                <v-simple-table style="max-width: 400px" dense>
                    <template v-slot:default>
                    <thead>
                        <tr>
                            <th class="text-center px-0">
                                
                            </th>
                            <th class="text-center">
                                <v-icon color="blue" title="Peoples">mdi-account-group</v-icon>
                            </th>
                            <th class="text-center">
                                <v-icon color="blue" title="Estimated Time">mdi-clock-fast</v-icon>
                            </th>
                            <th class="text-center">
                                <v-icon color="blue" title="Days">mdi-calendar-month-outline</v-icon>
                            </th>
                            <th class="text-center px-0">
                                <v-icon color="blue" title="Chart">mdi-chart-arc</v-icon>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                        v-for="(v, j) in e.efforts" :key="`c` + j"
                        >
                            <td class="px-0 text-center">{{ v.rolename }}</td>
                            <td class="text-center">{{ v.people_count }}</td>
                            <td class="text-center">{{ getMin(v) }}</td>
                            <td class="text-center">{{ getDay(v) }} </td>
                            <td class="px-0" width="100px">
                                <Chart
                                    v-bind:data="v"
                                >
                                </Chart>
                            </td>
                        </tr>
                    </tbody>
                    </template>
                </v-simple-table>
            </center>
            <v-divider></v-divider>
        </div>
    </div>
</template>

<script>
import Chart from './Chart'

export default {
    components: {
        Chart
    },

    name: "ProgressDetail",
    props: ["items"],

    methods: {
        getDay(v) {
            if (v.total_minutes_to_be_spent)
                return parseInt(v.total_minutes_to_be_spent / 60 / 24)
            return ''
        },

        getMin(v) {
            if (v.estimatedTimeInMinutes)
                return parseInt(v.estimatedTimeInMinutes / 60)
            return ''
        },

        setFontColor(item) {
            if (item.fontColor)
                return 'color: ' + item.fontColor + ';'
            return ''
        },

        setBackgroundColor(item) {
            if (item.backgroundColor)
                return 'background-color: ' + item.backgroundColor + '; width: 4px; color: ' + item.backgroundColor
            return ''
        },
    }
}
</script>