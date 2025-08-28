import { createRouter, createWebHistory } from 'vue-router'
import IncomesPage from '../pages/IncomesPage.vue'
import OrdersPage from '../pages/OrdersPage.vue'
import SalesPage from '../pages/SalesPage.vue'
import StocksPage from '../pages/StocksPage.vue'

const routes = [
  { path: '/', redirect: '/incomes' },
  { path: '/incomes', component: IncomesPage },
  { path: '/orders', component: OrdersPage },
  { path: '/sales', component: SalesPage },
  { path: '/stocks', component: StocksPage },
]

export default createRouter({
  history: createWebHistory(),
  routes
})
