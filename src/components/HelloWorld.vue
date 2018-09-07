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


        <b-btn class="mt-3" variant="outline-danger" block @click="addData($event.target)" style="width:20%">Add</b-btn>
        <br/>

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
                <b-button size="sm" @click.stop="del(row.item, row.index, $event.target)" class="mr-1">
                    Delete
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
        <b-modal id="modalInfo" @hide="resetModal" :title="modalInfo.title" ok-only ref="myModalRef">
            <pre>{{ modalInfo.content }}</pre>
            <div v-if="deletingData">
                Are you sure you want to delete this data?
                <b-btn class="mt-3" variant="outline-danger" block @click="deleteData">Delete</b-btn>
            </div>
            <div v-if="updatingData || addingData">
                <div class="d-block text-center">
                    <b-form-group
                                   breakpoint="md"
                            id="fieldset1">
                        <b-form-input v-model="modalInfo.name"
                                      type="text"
                                      placeholder="Enter  name"></b-form-input>
                        <input type="hidden" name="id" :value="modalInfo.id">
                        <br/>
                        <b-form-input v-model="modalInfo.email"
                                      type="text"
                                      placeholder="Enter  email"></b-form-input>
                        <br/>
                        <!--<div>-->
                            <!--<b-form-select v-model="modalInfo.selected" :options="modalInfo.options" class="mb-3" />-->
                            <!--<div>Selected: <strong>{{ modalInfo.selected }}</strong></div>-->
                        <!--</div>-->
                        <b-form-input v-model="modalInfo.faculty"
                                      type="text"
                                      placeholder="Enter faculty"></b-form-input>
                        <br/>
                        <b-form-input v-model="modalInfo.major"
                                      type="text"
                                      placeholder="Enter  major"></b-form-input>
                        <br/>
                        <b-form-input v-model="modalInfo.country"
                                      type="text"
                                      placeholder="Enter  Country"></b-form-input>
                        <br/>
                        <!--<datepicker :value="state.date" ></datepicker>-->
                    </b-form-group>
                </div>
                <div v-if="updatingData">
                   <b-btn class="mt-3" variant="outline-danger" block @click="updateData">Update</b-btn>
                </div>
                <div v-if="addingData">
                    <b-btn class="mt-3" variant="outline-danger" block @click="appendData">Add</b-btn>
                </div>
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
                uri: 'http://laravel-angular-4-app/api/v1/students',
                state: {
                    date: new Date(2018, 9,  16)
                },
                items: [],
                fields: [
                    { key: 'id', label: 'ID', sortable: true, sortDirection: 'desc' },
                    { key: 'name', label: 'Person Name', sortable: true, sortDirection: 'desc' },
                    { key: 'email', label: 'Person Email', sortable: true, sortDirection: 'desc' },
                    { key: 'admission_date', label: 'Admission Date', sortable: true, sortDirection: 'desc' },
                    { key: 'faculty', label: 'Faculty', sortable: true, sortDirection: 'desc' },
                    { key: 'major', label: 'Major', sortable: true, sortDirection: 'desc' },
                    { key: 'country', label: 'Country', sortable: true, sortDirection: 'desc' },
//                    { key: 'updated_at', label: 'Updated At', sortable: true, sortDirection: 'desc' },
                    { key: 'actions', label: 'Actions' }

                ],
                updatingData: false,
                deletingData: false,
                addingData: false,
                currentPage: 1,
                perPage: 2,
                totalRows: items.length,
                pageOptions: [ 2, 5, 10, 15 ],
                sortBy: null,
                sortDesc: false,
                sortDirection: 'asc',
                filter: null,
                modalInfo: { id:'', title: '', content: '', name: '', email: '', major: '', faculty: '',
//                    selected: null,
//                    options: [
//                        { value: null, text: 'Please select a Faculty' },
//                        { value: 'cis', text: 'CIS' },
//                        { value: 'iesm', text: 'IESM' },
//                        { value: 'math', text: 'MATH' }
//                    ]
                }
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
                this.modalInfo.content = '';
                this.modalInfo.id = item.id;
                this.modalInfo.name = item.name;
                this.modalInfo.email = item.email;
                this.modalInfo.major = item.major;
                this.modalInfo.country = item.country;
                this.modalInfo.faculty = item.faculty;

                this.$root.$emit('bv::show::modal', 'modalInfo', button)
            },
            del(item, index, button) {
                this.modalInfo.content = '';
                this.modalInfo.delete_item = true;
                this.modalInfo.id = item.id;
                this.deletingData = true;
                this.$root.$emit('bv::show::modal', 'modalInfo', button)
            },
            appendData(){
              let student = {
                 'name': this.modalInfo.name,
                 'email' : this.modalInfo.email,
                 'major' : this.modalInfo.major,
                 'country' : this.modalInfo.country,
                 'faculty' :  this.modalInfo.faculty
              };

            axios.post(this.uri, student)
                .then(() => {
                    this.$refs.myModalRef.hide();
                    this.fetchINitData();
                });
            },
            addData(button){
                this.modalInfo.title = `Add:`;
                this.addingData = true;
                this.modalInfo.content = '';
                this.modalInfo.id = '';
                this.modalInfo.name = '';
                this.modalInfo.email = '';
                this.modalInfo.major = '';
                this.modalInfo.country = '';
                this.modalInfo.faculty = '';

                this.$root.$emit('bv::show::modal', 'modalInfo', button)
            },
            deleteData() {
                if(this.modalInfo.delete_item){
                    axios
                        .delete(this.uri + '/' + this.modalInfo.id )
                        .then(() => {
                            this.$refs.myModalRef.hide();
                            this.fetchINitData();
                        });

                }
            },
            resetModal () {
                this.modalInfo.title = '';
                this.modalInfo.content = '';
                this.updatingData = false;
                this.addingData = false;
                this.deletingData = false;

            },
            onFiltered (filteredItems) {
                // Trigger pagination to update the number of buttons/pages due to filtering
                this.totalRows = filteredItems.length
                this.currentPage = 1
            },
            fetchINitData(){
               axios.get(this.uri).then(response => this.items = response['data']);
            },
            updateData() {
                let student = {
                    'id': this.modalInfo.id,
                    'name' : this.modalInfo.name,
                    'email': this.modalInfo.email,
                    'major': this.modalInfo.major,
                    'country': this.modalInfo.country,
//                    'date': this.modalInfo.date,
                    'faculty': this.modalInfo.faculty
                };

                let uri = this.uri + '/' + student.id;

                axios.post(uri, student )
                    .then(() => {
                        this.$refs.myModalRef.hide();
                        this.fetchINitData();
                    });
            }
        },
        mounted() {
           this.fetchINitData();
        },
    }
</script>

<!-- table-complete-1.vue -->
