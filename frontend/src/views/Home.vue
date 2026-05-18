<template>
  <div class="min-h-screen bg-dark-bg">
    <!-- Header -->
    <header class="border-b border-dark-border bg-dark-card">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-white">{{ appName }}</h1>
          </div>
          <router-link to="/crear" class="btn-primary flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Mochila
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero -->
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold text-white mb-4">
          Gestiona tu equipaje
        </h2>
        <p class="text-gray-400 text-lg max-w-2xl mx-auto">
          Crea mochilas, organiza objetos por grupos y calcula pesos automáticamente. 
          Comparte tus configuraciones con códigos cortos.
        </p>
      </div>

      <!-- Search -->
      <div class="max-w-md mx-auto mb-12">
        <div class="relative">
          <input 
            v-model="searchCodigo"
            type="text" 
            placeholder="Introduce código de mochila (ej: ABC123)"
            class="input pl-12 pr-4 py-3 text-lg text-center uppercase"
            maxlength="6"
            @keyup.enter="buscarMochila"
          >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button 
          @click="buscarMochila"
          class="btn-primary w-full mt-3"
          :disabled="!searchCodigo"
        >
          Buscar Mochila
        </button>
      </div>

      <!-- Mochilas Recientes -->
      <div v-if="mochilas.length > 0">
        <h3 class="text-xl font-semibold text-white mb-6">Mochilas Públicas</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="mochila in mochilas" 
            :key="mochila.id"
            class="card hover:border-accent cursor-pointer transition-all group"
            @click="$router.push(`/m/${mochila.codigo}`)"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 bg-dark-bg rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span class="px-3 py-1 bg-dark-bg rounded-full text-sm font-mono text-accent">
                {{ mochila.codigo }}
              </span>
            </div>
            <h4 class="text-lg font-semibold text-white mb-2">{{ mochila.nombre }}</h4>
            <p class="text-gray-400 text-sm line-clamp-2">{{ mochila.descripcion || 'Sin descripción' }}</p>
            <div class="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                <span v-if="mochila.peso_total === 0 || mochila.peso_total === null">Vacía</span>
                <span v-else>
                  {{ mochila.peso_total }}g
                  <span v-if="mochila.peso_total >= 1000" class="text-gray-500">
                    ({{ (mochila.peso_total / 1000).toFixed(2) }}kg)
                  </span>
                </span>
              </span>
              <span v-if="mochila.tiene_password" class="flex items-center gap-1 text-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Privada
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        <p class="mt-4 text-gray-400">Cargando mochilas...</p>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '../composables/useApi.js'
import { useSEO } from '../composables/useSEO.js'
import { generateWebSiteSchema, generateOrganizationSchema } from '../utils/schemas.js'

// SEO para página de inicio
const appName = ref(import.meta.env.VITE_APP_NAME || 'LeafPack')

useSEO({
  title: 'Organiza tu Mochila de Viaje',
  description: `Gestiona tu equipaje ultraligero con ${appName.value}. Calcula peso, precio y organiza objetos por categorías. Comparte tu configuración con códigos cortos.`,
  image: 'https://leafpack.mntr.es/og-default.jpg',
  schema: [generateWebSiteSchema(), generateOrganizationSchema()]
})

const router = useRouter()
const { fetchData, loading } = useApi()

const mochilas = ref([])
const searchCodigo = ref('')

const cargarMochilas = async () => {
  try {
    const data = await fetchData('/mochilas')
    mochilas.value = data
  } catch (err) {
    console.error('Error cargando mochilas:', err)
  }
}

const buscarMochila = () => {
  if (searchCodigo.value.trim()) {
    router.push(`/m/${searchCodigo.value.trim().toUpperCase()}`)
  }
}

onMounted(() => {
  cargarMochilas()
  
  // Intentar obtener nombre de la app del backend
  fetch('/api/health')
    .then(r => r.json())
    .then(data => {
      if (data.message) appName.value = data.message
    })
    .catch(() => {})
})
</script>
