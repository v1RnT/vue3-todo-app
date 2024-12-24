import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'bulma/css/bulma.css'
import '@fortawesome/fontawesome-free/css/all.css'
import './assets/styles/index.scss'

import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
