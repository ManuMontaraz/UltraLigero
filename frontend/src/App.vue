<template>
  <div id="app" class="min-h-screen flex flex-col">
    <router-view />
    <Footer />
  </div>
</template>

<script setup>
import Footer from './components/Footer.vue'
</script>
