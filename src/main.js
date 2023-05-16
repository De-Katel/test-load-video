import { createApp } from 'vue'
import PrimeVue from 'primevue/config';
import ProgressBar from 'primevue/progressbar'

import Button from 'primevue/button';

import App from './App.vue'

const app = createApp(App);
app.use(PrimeVue);

app.component("ProgressBar", ProgressBar);
app.component("ButtonW", Button);
app.mount('#app');
