import Vue from 'vue';
import MuseUI from '../src';
import App from './App';
Vue.use(MuseUI);

const app = new Vue({
  render: h => h(App)
});

app.$mount('#app');
