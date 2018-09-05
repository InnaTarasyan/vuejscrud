// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

import App from './App'
import router from './router'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'


import TableComponent from 'vue-table-component';

Vue.use(TableComponent);

Vue.use(BootstrapVue)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: { App }

});

// new Vue({
//     el: '#app',
//     template: '<App/>',
//     data: {
//         columns: [
//             'name',
//             // 'nickname',
//             'email',
//             // 'birthdate',
//             // 'gender',
//             '__actions'
//         ],
//         itemActions: [
//             { name: 'view-item', label: '', icon: 'zoom icon', class: 'ui teal button' },
//             { name: 'edit-item', label: '', icon: 'edit icon', class: 'ui orange button'},
//             { name: 'delete-item', label: '', icon: 'delete icon', class: 'ui red button' }
//         ]
//     },
//     methods: {
//         viewProfile: function(id) {
//             console.log('view profile with id:', id)
//         }
//     },
//     events: {
//         'vuetable:action': function(action, data) {
//             console.log('vuetable:action', action, data)
//             if (action == 'view-item') {
//                 this.viewProfile(data.id)
//             }
//         },
//         'vuetable:load-error': function(response) {
//             console.log('Load Error: ', response)
//         }
//     }
// })