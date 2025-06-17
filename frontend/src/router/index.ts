import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Workout from '../views/Workout.vue'
import History from '../views/History.vue'
import Exercises from '../views/Exercises.vue'
import Stats from '../views/Stats.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/workout',
      name: 'workout',
      component: Workout
    },
    {
      path: '/history',
      name: 'history',
      component: History
    },
    {
      path: '/exercises',
      name: 'exercises',
      component: Exercises
    },
    {
      path: '/stats',
      name: 'stats',
      component: Stats
    }
  ]
})

export default router 