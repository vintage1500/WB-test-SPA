<template>
  <nav class="navbar">
    <div class="brand">WB Test SPA</div>
    <router-link class="navlink" active-class="active" to="/incomes">Incomes</router-link>
    <router-link class="navlink" active-class="active" to="/orders">Orders</router-link>
    <router-link class="navlink" active-class="active" to="/sales">Sales</router-link>
    <router-link class="navlink" active-class="active" to="/stocks">Stocks</router-link>
    <div class="spacer"></div>
    <a class="muted" href="https://github.com/cy322666/wb-api" target="_blank" rel="noreferrer">API</a>
  </nav>
  <router-view />
  <footer class="footer muted">Demo app · Vue 3 + Vite</footer>
</template>
<script setup>
</script>
