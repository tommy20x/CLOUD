<template>
    <v-text-field v-model="color" class="ma-0 pa-0"  readonly :label="label" prepend-icon="mdi-format-color-fill">
        <template v-slot:append>
            <v-menu v-model="menu" top nudge-bottom="105" nudge-left="16" :close-on-content-click="false">
                <template v-slot:activator="{ on }">
                    <div :style="swatchStyle" v-on="on" />
                </template>
                <v-card class="my-0">
                    <v-card-text class="pa-0">
                        <v-color-picker v-model="color" flat />
                    </v-card-text>
                </v-card>
            </v-menu>
        </template>
    </v-text-field>
</template>

<script>
export default {
    name: 'ColorPicker',
    props: ["label", "submit", "initial" ,"task"],

    data: () => ({
		color: '#000000FF',
		menu: false,
	}),

    watch: {
        menu: function(n, o) {
            if (!n) {
                this.submit(this.color)
            }
        },

        initial: function(n, o) {
            if (n[0]) {
                this.color = n[0]
            } else {
                this.color = '#000000FF'
            }
        },

    },

    created() {
        if (this.initial[0])
            this.color = this.initial[0]
    },

    computed: {
        swatchStyle() {
        const { color, menu } = this
            return {
                backgroundColor: color,
                cursor: 'pointer',
                height: '30px',
                width: '30px',
                borderRadius: menu ? '50%' : '4px',
                transition: 'border-radius 200ms ease-in-out'
            }
        }
    }
}
</script>