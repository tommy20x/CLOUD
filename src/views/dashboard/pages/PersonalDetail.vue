<template>
    <v-row>
        <v-col>
            <v-tabs
            v-model="tabs"
            fixed-tabs
            color="purple"
            >
                <v-tabs-slider></v-tabs-slider>
                <v-tab
                    href="#tab1"
                >
                    Personal Detail
                </v-tab>

                <v-tab
                    href="#tab2"
                >
                    Contacts
                </v-tab>

                <v-tab
                    href="#tab3"
                >
                    Academic Information
                </v-tab>
                
                <v-tab
                    href="#tab4"
                >
                    Previous Job History
                </v-tab>
                
                <v-tab
                    href="#tab5"
                >
                    Government Docs
                </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tabs">
                <v-tab-item
                    :value="`tab1`"
                >
                    <v-card flat>
                        <v-card-text style="min-height: 400px">
                            <v-simple-table>
                                <template v-slot:default>
                                    <tbody>
                                        <tr>
                                            <td width="30%">First Name</td>
                                            <td width="70%">{{ item && item[0].personalInfo[0].firstname }}</td>
                                        </tr>
                                        <tr>
                                            <td>Last Name</td>
                                            <td>{{ item && item[0].personalInfo[0].lastname }}</td>
                                        </tr>
                                        <tr>
                                            <td>Gender Name</td>
                                            <td>{{ gender }}</td>
                                        </tr>
                                        <tr>
                                            <td>Country of Origin</td>
                                            <td>{{ country }}</td>
                                        </tr>
                                        <tr>
                                            <td>Date of Birth</td>
                                            <td>{{ item && item[0].personalInfo[0].DOB }}</td>
                                        </tr>
                                        <tr>
                                            <td>Father Name</td>
                                            <td>{{ item && item[0].personalInfo[0].fullNameOfFather }}</td>
                                        </tr>
                                        <tr>
                                            <td>Mother Name</td>
                                            <td>{{ item && item[0].personalInfo[0].fullNameOfMother }}</td>
                                        </tr>
                                        <tr>
                                            <td>Code</td>
                                            <td>{{ item && item[0].code }}</td>
                                        </tr>
                                        <tr>
                                            <td>Password</td>
                                            <td>{{ item && item[0].personalInfo[0].pwd }}</td>
                                        </tr>
                                    </tbody>
                                </template>
                            </v-simple-table>
                        </v-card-text>
                    </v-card>
                </v-tab-item>

                <v-tab-item
                    :value="`tab2`"
                >
                    <v-card flat>
                        <v-card-text style="min-height: 400px">
                            <v-simple-table>
                                <template v-slot:default>
                                    <tbody>
                                        <tr>
                                            <td width="30%">Work Email</td>
                                            <td width="70%"></td>
                                        </tr>
                                        <tr>
                                            <td>Personal Email</td>
                                            <td>{{ item && item[0].personalInfo[0].email }}</td>
                                        </tr>
                                        <tr>
                                            <td>Contact Number</td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </template>
                            </v-simple-table>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
                
                <v-tab-item
                    :value="`tab3`"
                >
                    <v-card flat>
                        <v-card-text style="min-height: 400px"></v-card-text>
                    </v-card>
                </v-tab-item>
                
                <v-tab-item
                    :value="`tab4`"
                >
                    <v-card flat>
                        <v-card-text style="min-height: 400px"></v-card-text>
                    </v-card>
                </v-tab-item>
                
                <v-tab-item
                    :value="`tab5`"
                >
                    <v-card flat>
                        <v-card-text style="min-height: 400px"></v-card-text>
                    </v-card>
                </v-tab-item>
            </v-tabs-items>
        </v-col>
    </v-row>
</template>

<script>
export default {
    name: "PersonalDetail",
    props: ["item", "countries"],

    data: () => ({
        tabs: [],
        firstName: "",
        lastName: "",
    }),

    computed: {
        gender() {
            if (this.item && this.item[0].personalInfo[0].gender == "m")
                return "Male"
            return "Female"
        },
        country() {
            if (this.item) {
                const id = this.item[0].personalInfo[0].COO
                const found = this.countries.find(e => e.id == id)
                return found.name
            }
            return ""
        }
    },

    created() {
        console.log("personal item", this.item)
    },

    methods: {
    }
}
</script>