<template>
  <div class="min-h-screen bg-dark-bg">
    <!-- Header -->
    <header class="border-b border-dark-border bg-dark-card">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center gap-4">
          <router-link to="/" class="p-2 hover:bg-dark-bg rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </router-link>
          <h1 class="text-xl font-bold text-white">Crear Nueva Mochila</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="card">
        <form @submit.prevent="crearMochila" class="space-y-6">
          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Nombre <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.nombre"
              type="text"
              placeholder="Ej: Mochila Viaje Asia"
              class="input"
              required
            >
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea 
              v-model="form.descripcion"
              rows="3"
              placeholder="Describe el propósito de esta mochila..."
              class="input resize-none"
            ></textarea>
          </div>

          <!-- Capacidad -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Capacidad máxima (kg)
            </label>
            <input 
              v-model.number="form.capacidad_kg"
              type="number"
              step="0.1"
              min="0"
              placeholder="Ej: 10"
              class="input"
            >
            <p class="text-gray-500 text-sm mt-1">Deja en 0 o vacío para sin límite</p>
          </div>

          <!-- Contraseñas -->
          <div class="border-t border-dark-border pt-6">
            <h3 class="text-lg font-medium text-white mb-4">Seguridad (opcional)</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña de edición
                </label>
                <input 
                  v-model="form.editPassword"
                  type="password"
                  placeholder="Permite modificar la mochila"
                  class="input"
                >
                <p class="text-gray-500 text-sm mt-1">Requerida para añadir/eliminar objetos</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña de visualización
                </label>
                <input 
                  v-model="form.viewPassword"
                  type="password"
                  placeholder="Oculta la mochila al público"
                  class="input"
                >
                <p class="text-gray-500 text-sm mt-1">Requerida para ver el contenido</p>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div class="bg-dark-bg rounded-lg p-4 border border-dark-border">
            <h4 class="text-sm font-medium text-gray-300 mb-3">Vista previa</h4>
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 bg-dark-card rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <div class="font-medium text-white">{{ form.nombre || 'Sin nombre' }}</div>
                <div class="text-sm text-gray-500">{{ form.descripcion || 'Sin descripción' }}</div>
                <div class="flex gap-3 mt-2 text-xs">
                  <span v-if="form.capacidad_kg" class="text-gray-400">
                    {{ form.capacidad_kg }} kg
                  </span>
                  <span v-if="form.editPassword" class="text-yellow-500">🔒 Edición protegida</span>
                  <span v-if="form.viewPassword" class="text-red-500">🔒 Privada</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
            {{ error }}
          </div>

          <!-- Submit -->
          <div class="flex gap-4">
            <router-link to="/" class="btn-secondary flex-1 text-center">
              Cancelar
            </router-link>
            <button 
              type="submit" 
              class="btn-primary flex-1"
              :disabled="loading || !form.nombre"
            >
              <span v-if="loading">Creando...</span>
              <span v-else>Crear Mochila</span>
            </button>
          </div>
        </form>

        <!-- Success -->
        <div v-if="mochilaCreada" class="mt-6 bg-green-500/10 border border-green-500/50 rounded-lg p-6 text-center">
          <div class="text-green-400 text-5xl mb-4">🎉</div>
          <h3 class="text-lg font-medium text-white mb-2">¡Mochila creada!</h3>
          <p class="text-gray-400 mb-4">Código: <span class="font-mono text-accent font-bold">{{ mochilaCreada.codigo }}</span></p>
          <div class="flex gap-3 justify-center">
            <button 
              @click="copiarCodigo"
              class="btn-secondary"
            >
              Copiar código
            </button>
            <router-link 
              :to="`/m/${mochilaCreada.codigo}`" 
              class="btn-primary"
            >
              Ver mochila →
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useApi } from '../composables/useApi.js'
import { useSEO } from '../composables/useSEO.js'

// SEO para página de crear mochila
useSEO({
  title: 'Crear Mochila Nueva',
  description: 'Crea tu mochila de viaje ultraligera con LeafPack. Organiza objetos, calcula peso y precio total. Comparte con códigos cortos.',
  image: 'https://leafpack.mntr.es/og-default.jpg'
})

const { fetchData, loading, error } = useApi()

const form = ref({
  nombre: '',
  descripcion: '',
  capacidad_kg: null,
  editPassword: '',
  viewPassword: ''
})

const mochilaCreada = ref(null)

const crearMochila = async () => {
  try {
    const data = await fetchData('/mochilas', {
      method: 'POST',
      body: JSON.stringify({
        nombre: form.value.nombre,
        descripcion: form.value.descripcion,
        capacidad_kg: form.value.capacidad_kg,
        editPassword: form.value.editPassword || null,
        viewPassword: form.value.viewPassword || null
      })
    })
    
    mochilaCreada.value = data
  } catch (err) {
    // Error ya manejado en useApi
  }
}

const copiarCodigo = () => {
  navigator.clipboard.writeText(mochilaCreada.value.codigo)
  alert('Código copiado al portapapeles')
}
</script>
