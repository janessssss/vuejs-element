/**
 * Created by 1 on 2016/11/28.
 */
import Vue from 'vue'
import VueMoment from 'vue-moment'
import VueResource from 'vue-resource'
import $ from 'jquery'
window.$=$
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import App from './App.vue'

Vue.use(VueMoment)
Vue.use(VueResource)
Vue.use(ElementUI)

new Vue({
    el: '#app',
    render: h => h(App)
})

