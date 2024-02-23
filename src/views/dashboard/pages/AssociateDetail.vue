<template>
    <base-material-card
        color="purple"
    >
        <template v-slot:heading>
            <div class="display-1 font-weight-light">
                Associate Detail
            </div>
        </template>
        <v-row>
            <v-col class="px-0 ">
            <v-container>
                <v-progress-linear
                    indeterminate
                    color="purple"
                    v-if="loading">
                </v-progress-linear>
            </v-container>
            </v-col>
        </v-row>
        <v-row v-if="data">
            <v-col>
                <v-expansion-panels flat hover>
                    <v-expansion-panel>
                        <v-expansion-panel-header color="" ripple>
                            <p class="body-1 mb-0">
                                <v-icon color="purple">mdi-information</v-icon>Personal Details
                            </p>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <PersonalDetail
                                v-bind:item="detail"
                                v-bind:countries="countries"
                            >
                            </PersonalDetail>
                        </v-expansion-panel-content>
                    </v-expansion-panel>

                    <v-expansion-panel>
                        <v-expansion-panel-header color="" ripple>
                            <p class="body-1 mb-0">
                                <v-icon color="purple">mdi-information-outline</v-icon>Professional Details
                            </p>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <ProfessionalDetail
                                ref="prof"
                                v-bind:item="detail"
                                v-bind:roleData="roleData"
                                v-bind:roleTypes="roleTypes"
                                v-bind:hrId="item && item.id"
                                v-bind:allDes="designations"
                            >
                            </ProfessionalDetail>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
        </v-row>
        <v-row v-else>
            <v-col>
                <br>
                <p class="text-center purple--text display-2">No associate selected</p>
            </v-col>
        </v-row>
        <br><br>
    </base-material-card>
</template>

<script>
import associate_api from "@/apis/associate.js";
import PersonalDetail from './PersonalDetail'
import ProfessionalDetail from './ProfessionalDetail'
import role_api from "@/apis/role.js";

export default {
    components: {
        PersonalDetail,
        ProfessionalDetail
    },

    name: "AssociateDetail",
    props: ["item", "countries", "roleData", "designations"],
    
    data: () => ({
        loading: false,
        detail: null,
        data: null,
        roleTypes: []
    }),

    async created() {
        this.roleTypes = await role_api.findAllRoles()
    },

    computed: {
    },
    
    methods: {
        async itemChanged(_item) {
            // this.item = _item
            if (_item == null) return
            this.data = Object.assign({}, _item);            
            this.loading = true
            if (_item)
                this.detail = await associate_api.findOne(_item.id)
            this.loading = false
            this.$refs.prof && this.$refs.prof.itemChanged(this.item)

            console.log("item", this.item)
            console.log("detail", this.detail)
        }
    }
}
</script>