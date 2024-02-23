<template>
    <v-app style="background-image:url('/login.jpg')">
        <base-material-card
            color="success"
            class="px-5 py-3 mx-auto"
            style="width: 400px; margin-top: 200px"
            elevation="15"
        >
            <template v-slot:heading>
                <div class="display-2 font-weight-bold text-center">
                   Login    <br><br>
                    <v-icon>mdi-login</v-icon>
                </div>
            </template>
            <v-card-text>
                <v-form ref="form" lazy-validation>
                    <v-row>
                        <v-col>
                            <!-- <v-text-field
                                label="Email"
                                prepend-icon="mdi-email"
                                :rules="emailRules"
                                v-model="email"
                                :error-messages="errorMessageEmail"
                                @keydown="errorMessageEmail = ''"
                            ></v-text-field> -->     
                            <v-text-field
                                label="Code"
                                prepend-icon="mdi-language-c"
                                :rules="codeRules"
                                v-model="code"
                                :error-messages="errorMessageCode"
                                @keydown="errorMessageCode = ''"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field
                                label="Password"
                                :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                                :type="show1 ? 'text' : 'password'"
                                @click:append="show1 = !show1"
                                prepend-icon="mdi-account-lock"
                                :rules="passwordRules"
                                v-model="password"
                                :error-messages="errorMessagePassword"
                                @keydown="errorMessagePassword = ''"
                                counter
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <div class="text-center" style="width:100%">
                    <v-btn color="primary" text @click="onLogin">
                        LOGIN
                    </v-btn>
                </div>
            </v-card-actions>
            <v-progress-linear
                class="my-0 py-0"
                indeterminate
                color="green"
                v-show="wait">
            </v-progress-linear>
        </base-material-card>
        <!--
        <v-card
            class="mx-auto"
            style="width: 500px; margin-top: 100px"
            elevation="15"
            max-width="500">
            <v-card-title class="py-5 px-5">
                <h2>Log In</h2>
            </v-card-title>
            <v-container>
                <v-form ref="form" lazy-validation>
                    <v-row>
                        <v-col>
                            <v-text-field
                                label="Email"
                                prepend-icon="mdi-email"
                                :rules="emailRules"
                                v-model="email"
                                :error-messages="errorMessageEmail"
                                @keydown="errorMessageEmail = ''"
                            ></v-text-field>
                            <v-text-field
                                label="Code"
                                prepend-icon="mdi-language-c"
                                :rules="codeRules"
                                v-model="code"
                                :error-messages="errorMessageCode"
                                @keydown="errorMessageCode = ''"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field
                                label="Password"
                                :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                                :type="show1 ? 'text' : 'password'"
                                @click:append="show1 = !show1"
                                prepend-icon="mdi-account-lock"
                                :rules="passwordRules"
                                v-model="password"
                                :error-messages="errorMessagePassword"
                                @keydown="errorMessagePassword = ''"
                                counter
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-form>
            </v-container>
            <v-card-actions>
                <div class="text-center" style="width:100%">
                    <v-btn color="teal" @click="onLogin">
                        Log In
                    </v-btn>
                </div>
            </v-card-actions>
        </v-card>
        -->
    </v-app>
</template>

<script>

import auth_api from "@/apis/auth.js";

export default {
    data: () => ({
        email: "",
        password: "",
        errorMessageEmail: "",
        errorMessagePassword: "",
        code: "",
        errorMessageCode: "",
        show1: false,
        wait: false
    }),

    created: function() {
    },

    computed: {
        emailRules() {
            return [
                v => !!v || 'E-mail is required',
                v => /.+@.+/.test(v) || 'E-mail must be valid',
            ]
        },
        codeRules() {
            return [
                (v) => !!v || "Code is required",
                (v) => (v && v.trim().length > 0) || "Code is required",
            ];
        },
        passwordRules() {
            return [
                (v) => !!v || "Password is required",
                (v) => (v && v.trim().length > 0) || "Password is required",
                (v) =>
                    (v && v.length >= 6) ||
                    `This field must be greater than 6 characters`,
            ];
        },

    },

    methods: {
        async onLogin() {
            if (!this.$refs.form.validate()) return
            this.wait = true
            let status = await auth_api.login(this.code, this.password)
            if (status) {
                localStorage.setItem('code', this.code)
                localStorage.setItem('pmFE001', status)
                
                const now = new Date()
                localStorage.setItem('time', now.getTime() + 24 * 60 * 60 * 3 * 1000)

                if (localStorage.getItem('pmFE001') != null){
                    // this.$router.push('/')
                    window.location.href = "/"
                }
            } else {
                this.errorMessageCode = "Not registered code"
                this.errorMessagePassword = "Not registered password"
            }
            this.wait =false
        }
    }
}
</script>