<template>
    <b-container fluid>
        <!-- User Interface controls -->
        <b-row style="padding-bottom: 2%">
            <b-col md="6" class="my-1">
                <b-form-group horizontal label="Filter" class="mb-0">
                    <b-input-group>
                        <b-form-input v-model="filter" placeholder="Type to Search" />
                        <b-input-group-append>
                            <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
            </b-col>
            <b-col md="6" class="my-1">
                <b-form-group horizontal label="Sort" class="mb-0">
                    <b-input-group>
                        <b-form-select v-model="sortBy" :options="sortOptions">
                            <option slot="first" :value="null">-- none --</option>
                        </b-form-select>
                        <b-form-select :disabled="!sortBy" v-model="sortDesc" slot="append">
                            <option :value="false">Asc</option>
                            <option :value="true">Desc</option>
                        </b-form-select>
                    </b-input-group>
                </b-form-group>
            </b-col>
            <b-col md="6" class="my-1">
                <b-form-group horizontal label="Sort direction" class="mb-0">
                    <b-input-group>
                        <b-form-select v-model="sortDirection" slot="append">
                            <option value="asc">Asc</option>
                            <option value="desc">Desc</option>
                            <option value="last">Last</option>
                        </b-form-select>
                    </b-input-group>
                </b-form-group>
            </b-col>
            <b-col md="6" class="my-1">
                <b-form-group horizontal label="Per page" class="mb-0">
                    <b-form-select :options="pageOptions" v-model="perPage" />
                </b-form-group>
            </b-col>
        </b-row>

        <!-- Main table element -->
        <b-table show-empty
                 stacked="md"
                 :items="items"
                 :fields="fields"
                 :current-page="currentPage"
                 :per-page="perPage"
                 :filter="filter"
                 :sort-by.sync="sortBy"
                 :sort-desc.sync="sortDesc"
                 :sort-direction="sortDirection"
                 @filtered="onFiltered"
        >
            <template slot="name" slot-scope="row">{{row.value}} </template>
            <template slot="isActive" slot-scope="row">{{row.value?'Yes :)':'No :('}}</template>
            <template slot="actions" slot-scope="row">
                <!-- We use @click.stop here to prevent a 'row-clicked' event from also happening -->
                <b-button size="sm" @click.stop="info(row.item, row.index, $event.target)" class="mr-1">
                    Info modal
                </b-button>
                <b-button size="sm" @click.stop="row.toggleDetails">
                    {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
                </b-button>
                <b-button size="sm" @click.stop="update(row.item, row.index, $event.target)" class="mr-1">
                    Update
                </b-button>
            </template>
            <template slot="row-details" slot-scope="row">
                <b-card>
                    <ul>
                        <li v-for="(value, key) in row.item" :key="key">{{ key }}: {{ value}}</li>
                    </ul>
                </b-card>
            </template>
        </b-table>

        <b-row>
            <b-col md="6" class="my-1">
                <b-pagination align="center" :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
            </b-col>
        </b-row>

        <!-- Info modal -->
        <b-modal id="modalInfo" @hide="resetModal" :title="modalInfo.title" ok-only>
            <pre>{{ modalInfo.content }}</pre>
            <div v-if="updatingData">
                <div class="d-block text-center">
                    <b-form-group
                                   breakpoint="md"
                            id="fieldset1">
                        <b-form-input v-model="modalInfo.name"
                                      type="text"
                                      placeholder="Enter  name"></b-form-input>
                        <br/>
                        <b-form-input v-model="modalInfo.email"
                                      type="text"
                                      placeholder="Enter  email"></b-form-input>
                        <br/>
                        <div>
                            <b-form-select v-model="modalInfo.selected" :options="modalInfo.options" class="mb-3" />
                            <div>Selected: <strong>{{ modalInfo.selected }}</strong></div>
                        </div>
                        <br/>
                        <b-form-input v-model="modalInfo.major"
                                      type="text"
                                      placeholder="Enter  major"></b-form-input>
                        <br/>
                        <datepicker :value="state.date" ></datepicker>
                    </b-form-group>
                </div>
                <b-btn class="mt-3" variant="outline-danger" block @click="updateData">Update</b-btn>
            </div>
        </b-modal>

    </b-container>
</template>

<script>
    import axios from 'axios'
    import Datepicker from 'vuejs-datepicker';


    const items = [

    ];


    export default {
        components: {
            Datepicker
        },
        data () {
            return {
                state: {
                    date: new Date(2018, 9,  16)
                },
                items: [],
                fields: [
                    { key: 'name', label: 'Person Name', sortable: true, sortDirection: 'desc' },
                    { key: 'email', label: 'Person Email', sortable: true, sortDirection: 'desc' },
                    { key: 'admission_date', label: 'Admission Date', sortable: true, sortDirection: 'desc' },
                    { key: 'faculty', label: 'Faculty', sortable: true, sortDirection: 'desc' },
                    { key: 'major', label: 'Major', sortable: true, sortDirection: 'desc' },
                    { key: 'country', label: 'Country', sortable: true, sortDirection: 'desc' },
                    { key: 'updated_at', label: 'Updated At', sortable: true, sortDirection: 'desc' },
                    { key: 'actions', label: 'Actions' }

                ],
                updatingData: false,
                currentPage: 1,
                perPage: 2,
                totalRows: items.length,
                pageOptions: [ 2, 5, 10, 15 ],
                sortBy: null,
                sortDesc: false,
                sortDirection: 'asc',
                filter: null,
                modalInfo: { title: '', content: '', name: '', email: '', major: '',
                    selected: null,
                    options: [
                        { value: null, text: 'Please select a Faculty' },
                        { value: 'cis', text: 'CIS' },
                        { value: 'iesm', text: 'IESM' },
                        { value: 'math', text: 'MATH' }
                    ]}
            }
        },
        computed: {
            sortOptions () {
                // Create an options list from our fields
                return this.fields
                    .filter(f => f.sortable)
                    .map(f => { return { text: f.label, value: f.key } })
            }
        },
        methods: {
            info (item, index, button) {
                this.modalInfo.title = `Row index: ${index}`
                this.modalInfo.content = JSON.stringify(item, null, 2)
                this.$root.$emit('bv::show::modal', 'modalInfo', button)
            },
            update (item, index, button) {
                this.modalInfo.title = `Update: ${index}`;
                this.updatingData = true;
                this.modalInfo.content = 'Updating...';
                this.$root.$emit('bv::show::modal', 'modalInfo', button)
            },
            resetModal () {
                this.modalInfo.title = '';
                this.modalInfo.content = '';
                this.updatingData = false;
            },
            onFiltered (filteredItems) {
                // Trigger pagination to update the number of buttons/pages due to filtering
                this.totalRows = filteredItems.length
                this.currentPage = 1
            },
            fetchINitData(){
               axios.get('http://laravel-angular-4-app/api/v1/students').then(response => this.items = response['data']);
               this.childDataLoaded = true;
            },
            updateData() {
                debugger;
            }
        },
        mounted() {
           this.fetchINitData();
        },
    }
</script>

<!-- table-complete-1.vue -->
