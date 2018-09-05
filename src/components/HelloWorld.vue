
<template>
    <div>
        <template v-if="childDataLoaded">
          <div>
            <b-table striped hover :items="items" :fields="fields"  :current-page="currentPage" :per-page="perPage"></b-table>
            <b-pagination align="center" size="md" :total-rows="items.length" :per-page="perPage" v-model="currentPage" />
            <div>currentPage: {{currentPage}}</div>
          </div>
        </template>
    </div>
</template>

<script>

import axios from 'axios'

export default {
    methods:{

fetchINitData(){

    axios.get('http://laravel-angular-4-app/api/v1/students').then(response => this.items = response['data']);
            this.childDataLoaded = true;
        }
    },
    data () {

        return {

            childDataLoaded: false,
            currentPage: 1,
            perPage: 2,
            // Note 'isActive' is left out and will not appear in the rendered table
            fields: {
                id: {
                    label: 'ID',
                    sortable: true
                },
                name: {
                    label: 'Person Name',
                    sortable: true
                },
                email: {
                    label: 'Person Email',
                    sortable: false
                },
                admission_date: {
                    label: 'Admission Date',
                    sortable: false
                },
                faculty: {
                    label: 'Faculty',
                    sortable: false
                },
                major: {
                    label: 'Major',
                    sortable: false
                },
                country: {
                    label: 'Country',
                    sortable: false
                },
                created_at: {
                    label: 'Created At',
                    sortable: false
                },
                updated_at: {
                    label: 'Updated At',
                    sortable: false
                }
            },
            items: [],

        }
    },
    mounted() {
        this.fetchINitData();
    }
}
</script>