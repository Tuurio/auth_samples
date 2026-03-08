import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import AuthCallback from '../views/AuthCallback.vue'
import LogoutCallback from '../views/LogoutCallback.vue'
import NotFound from '../views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: AuthCallback
    },
    {
      path: '/logout/callback',
      name: 'logout-callback',
      component: LogoutCallback
    },
    {
      path: '/callback',
      name: 'callback',
      component: AuthCallback
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    }
  ]
})

export default router
