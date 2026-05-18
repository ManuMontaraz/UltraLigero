import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import MochilaView from '../views/MochilaView.vue'
import CrearMochila from '../views/CrearMochila.vue'
import AdminPanel from '../views/AdminPanel.vue'
import Privacidad from '../views/Privacidad.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/m/:codigo',
    name: 'Mochila',
    component: MochilaView
  },
  {
    path: '/crear',
    name: 'CrearMochila',
    component: CrearMochila
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPanel
  },
  {
    path: '/privacidad',
    name: 'Privacidad',
    component: Privacidad
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
