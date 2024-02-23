<template>
    <v-container class="px-0 py-0">
        <v-row>
            <v-col class="py-0 my-0 px-1">
                <v-text-field
                    label="Total"
                    disabled
                    v-model="total"
                ></v-text-field>
            </v-col>
            <v-col class="py-0 my-0 px-1">
                <v-text-field
                    label="Hr"
                    disabled
                    v-model="hr"
                ></v-text-field>
            </v-col>
            <v-col class="py-0 my-0 px-1">
                <v-text-field
                    label="Min"
                    disabled
                    v-model="min"
                ></v-text-field>
            </v-col>
            <!-- <v-col class="py-0 my-0" style="display:flex; align-items: center;">
                <v-btn color='secondary' rounded small @click="btnClicked">
                    <v-icon dark>
                        mdi-pencil
                    </v-icon>
                </v-btn>
            </v-col> -->
        </v-row>

    </v-container>
</template>

<script>
import daily_api from "@/apis/daily.js";

export default {
    name: "InputGroup",
    props: ["item", "supervisors", "performers", "task"],

    data: () => ({
        dialog: false,
        valid: false,
        selectedSupervisor: null,
        selectedPerformer: null,
        saveData: [],
        itemId: null,
        loading: false,
        snack: false,
        snackColor: "",
        snackText: "",
        
        total: "",
        hr: "",
        min: "",
    }),

    created() {
        console.log("----------item", this.item)
        console.log("----task", this.task)
        this.supervisors.forEach(e => {
            e.fullName = e.firstname + " " + e.lastname
        })

        if (this.item.level == 1) {
            this.task && (this.hr = this.task.L1AdditionalTotHrsToday)
            this.task && (this.min = this.task.L1AdditionalTotMinsToday)
            this.task && this.task.L1TotPctMarkToday && (this.total = this.task.L1TotPctMarkToday * 1)
        } else if (this.item.level == 2) {
            this.task && (this.hr = this.task.L2AdditionalTotHrsToday)
            this.task && (this.min = this.task.L2AdditionalTotMinsToday)
            this.task && this.task.L2TotPctMarkToday && (this.total = this.task.L2TotPctMarkToday * 1)
        } else if (this.item.level == 3) {
            this.task && (this.hr = this.task.L3AdditionalTotHrsToday)
            this.task && (this.min = this.task.L3AdditionalTotMinsToday)
            this.task && this.task.L3TotPctMarkToday && (this.total = this.task.L3TotPctMarkToday * 1)
        } else if (this.item.level == 4) {
            this.task && (this.hr = this.task.L4AdditionalTotHrsToday)
            this.task && (this.min = this.task.L4AdditionalTotMinsToday)
            this.task && this.task.L4TotPctMarkToday && (this.total = this.task.L4TotPctMarkToday * 1)
        }
    },

    computed: {
    },
    
    methods: {

    }
}
</script>