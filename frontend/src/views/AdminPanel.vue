<template>
  <div class="min-h-screen bg-bg">
    <!-- Header -->
    <header class="border-b border-border bg-card">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <router-link to="/" class="p-2 hover:bg-bg rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </router-link>
            <h1 class="text-xl font-bold text-text-primary">Panel de Administración</h1>
          </div>
          <button 
            v-if="isAdmin"
            @click="logout"
            class="text-text-secondary hover:text-text-primary text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>

    <!-- Login -->
    <div v-if="!isAdmin" class="max-w-md mx-auto px-4 py-16">
      <div class="card">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-text-primary">Acceso Administrador</h2>
        </div>

        <form @submit.prevent="login" class="space-y-4">
          <input 
            v-model="adminPassword"
            type="password"
            placeholder="Contraseña de administrador"
            class="input"
            required
          >
          <button 
            type="submit" 
            class="btn-primary w-full"
            :disabled="loading"
          >
            {{ loading ? 'Verificando...' : 'Acceder' }}
          </button>
        </form>

        <div v-if="error" class="mt-4 text-danger text-sm text-center">
          {{ error }}
        </div>
      </div>
    </div>

    <!-- Admin Dashboard -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Tabs -->
      <div class="flex gap-4 mb-8 border-b border-border">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-3 font-medium transition-colors border-b-2"
          :class="activeTab === tab.id ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-text-primary'"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- MOCHILAS -->
      <div v-if="activeTab === 'mochilas'" class="space-y-6">
        <!-- Crear Mochila -->
        <div class="card">
          <h3 class="text-lg font-semibold text-text-primary mb-4">Crear Nueva Mochila</h3>
          <form @submit.prevent="crearMochilaAdmin" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <input v-model="nuevaMochila.nombre" type="text" placeholder="Nombre *" class="input" required>
            </div>
            <div class="md:col-span-2">
              <textarea v-model="nuevaMochila.descripcion" placeholder="Descripción" class="input resize-none" rows="2"></textarea>
            </div>
            <div>
              <input v-model.number="nuevaMochila.capacidad_kg" type="number" step="0.1" placeholder="Capacidad (kg)" class="input">
            </div>
            <div>
              <input v-model="nuevaMochila.editPassword" type="password" placeholder="Contraseña de edición (opcional)" class="input">
            </div>
            <div>
              <input v-model="nuevaMochila.viewPassword" type="password" placeholder="Contraseña de visualización (opcional)" class="input">
            </div>
            <div class="md:col-span-2">
              <button type="submit" class="btn-primary" :disabled="loadingMochila">
                {{ loadingMochila ? 'Creando...' : 'Crear Mochila' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Lista Mochilas -->
        <div>
          <h3 class="text-lg font-semibold text-text-primary mb-4">Todas las Mochilas ({{ mochilas.length }})</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-card">
                <tr>
                  <th class="text-left p-4 text-text-secondary font-medium">Código</th>
                  <th class="text-left p-4 text-text-secondary font-medium">Nombre</th>
                  <th class="text-left p-4 text-text-secondary font-medium">Capacidad</th>
                  <th class="text-left p-4 text-text-secondary font-medium">Seguridad</th>
                  <th class="text-left p-4 text-text-secondary font-medium">Creada</th>
                  <th class="text-right p-4 text-text-secondary font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr v-for="mochila in mochilas" :key="mochila.id" class="hover:bg-card/50">
                  <td class="p-4">
                    <router-link :to="`/m/${mochila.codigo}`" class="font-mono text-primary hover:underline">
                      {{ mochila.codigo }}
                    </router-link>
                  </td>
                  <td class="p-4 text-text-primary">{{ mochila.nombre }}</td>
                  <td class="p-4 text-text-secondary">{{ mochila.capacidad_kg }} kg</td>
                  <td class="p-4">
                    <div class="flex gap-2">
                      <span v-if="mochila.tiene_edit_password" class="text-xs px-2 py-1 bg-warning/20 text-warning rounded">Edit</span>
                      <span v-if="mochila.tiene_password" class="text-xs px-2 py-1 bg-danger/20 text-danger rounded">View</span>
                      <span v-if="!mochila.tiene_password && !mochila.tiene_edit_password" class="text-xs px-2 py-1 bg-success/20 text-success rounded">Pública</span>
                    </div>
                  </td>
                  <td class="p-4 text-text-secondary text-sm">{{ formatDate(mochila.created_at) }}</td>
                  <td class="p-4 text-right">
                    <button 
                      @click="abrirEditarMochila(mochila)"
                      class="text-primary hover:text-primary-light p-2 mr-2"
                      title="Editar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      @click="eliminarMochila(mochila)"
                      class="text-danger hover:text-red-400 p-2"
                      title="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- OBJETOS -->
      <div v-if="activeTab === 'objetos'" class="space-y-6">
        <!-- Crear Objeto -->
        <div class="card">
          <h3 class="text-lg font-semibold text-text-primary mb-4">Crear Nuevo Objeto</h3>
          <form @submit.prevent="crearObjeto" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <input v-model="nuevoObjeto.nombre" type="text" placeholder="Nombre *" class="input" required>
            </div>
            <div class="md:col-span-2">
              <textarea v-model="nuevoObjeto.descripcion" placeholder="Descripción" class="input resize-none" rows="2"></textarea>
            </div>
            <div>
              <input v-model.number="nuevoObjeto.peso_gr" type="number" placeholder="Peso (g)" class="input">
            </div>
            <div>
              <input v-model.number="nuevoObjeto.precio" type="number" step="0.01" placeholder="Precio (€)" class="input">
            </div>
            <div class="md:col-span-2">
              <input v-model="nuevoObjeto.url_compra" type="url" placeholder="URL de compra" class="input">
            </div>
            <div>
              <select v-model="nuevoObjeto.grupo_id" class="input">
                <option value="">Sin grupo</option>
                <option v-for="grupo in grupos" :key="grupo.id" :value="grupo.id">
                  {{ grupo.nombre }}
                </option>
              </select>
            </div>
            <div>
              <input v-model="nuevoObjeto.editPassword" type="password" placeholder="Contraseña de edición (opcional)" class="input">
            </div>
            <div>
              <input type="file" @change="handleFileUpload" accept="image/*" class="input-file">
            </div>
            <div class="md:col-span-2">
              <button type="submit" class="btn-primary" :disabled="loadingObjeto">
                {{ loadingObjeto ? 'Creando...' : 'Crear Objeto' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Lista Objetos -->
        <div>
          <h3 class="text-lg font-semibold text-text-primary mb-4">Objetos Existentes ({{ objetos.length }})</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="obj in objetos" :key="obj.id" class="card group">
              <div class="flex items-start gap-3">
                <div class="w-16 h-16 bg-bg rounded-lg flex-shrink-0 overflow-hidden">
                  <img v-if="obj.imagen_url" :src="obj.imagen_url" class="w-full h-full object-cover">
                  <div v-else class="w-full h-full flex items-center justify-center text-text-secondary">Sin img</div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h4 class="font-medium text-text-primary truncate">{{ obj.nombre }}</h4>
                    <span v-if="obj.tiene_password" class="text-warning text-xs">🔒</span>
                  </div>
                  <p class="text-sm text-text-secondary">{{ obj.peso_gr }}g • {{ obj.precio }}€</p>
                  <span v-if="obj.grupo_nombre" class="text-xs px-2 py-0.5 bg-bg rounded text-text-secondary">
                    {{ obj.grupo_nombre }}
                  </span>
                </div>
                <div class="flex gap-1">
                  <button 
                    @click="abrirEditarObjeto(obj)"
                    class="text-primary hover:text-primary-light opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Editar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    @click="eliminarObjeto(obj)"
                    class="text-danger hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Eliminar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Modal Editar Mochila -->
    <div v-if="showEditMochilaModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-text-primary">Editar Mochila</h3>
          <button @click="showEditMochilaModal = false" class="text-text-secondary hover:text-text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="guardarMochila" class="space-y-4">
          <div>
            <label class="block text-sm text-text-secondary mb-1">Nombre</label>
            <input v-model="editMochilaForm.nombre" type="text" class="input" required>
          </div>
          <div>
            <label class="block text-sm text-text-secondary mb-1">Descripción</label>
            <textarea v-model="editMochilaForm.descripcion" class="input resize-none" rows="2"></textarea>
          </div>
          <div>
            <label class="block text-sm text-text-secondary mb-1">Capacidad (kg)</label>
            <input v-model.number="editMochilaForm.capacidad_kg" type="number" step="0.1" class="input">
          </div>
          <div class="border-t border-border pt-4 mt-4">
            <h4 class="text-sm font-medium text-text-primary mb-3">Contraseñas (dejar vacío para mantener actual)</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="relative">
                <label class="block text-sm text-text-secondary mb-1">Contraseña de edición</label>
                <input 
                  v-model="editMochilaForm.newEditPassword" 
                  type="password" 
                  placeholder="Nueva contraseña (vacío = mantener)" 
                  class="input pr-20"
                  :class="{ 'border-danger': editMochilaForm.deleteEditPassword }"
                >
                <button 
                  v-if="editMochilaForm.tiene_edit_password && !editMochilaForm.deleteEditPassword"
                  @click="marcarEliminarPassword('mochila', 'edit')"
                  type="button"
                  class="absolute right-2 top-[26px] text-xs text-danger hover:text-red-600 px-2 py-1 rounded hover:bg-danger/10"
                >
                  Eliminar
                </button>
                <span 
                  v-if="editMochilaForm.deleteEditPassword"
                  class="absolute right-2 top-[26px] text-xs text-danger font-medium"
                >
                  Se eliminará
                </span>
              </div>
              <div class="relative">
                <label class="block text-sm text-text-secondary mb-1">Contraseña de visualización</label>
                <input 
                  v-model="editMochilaForm.newViewPassword" 
                  type="password" 
                  placeholder="Nueva contraseña (vacío = mantener)" 
                  class="input pr-20"
                  :class="{ 'border-danger': editMochilaForm.deleteViewPassword }"
                >
                <button 
                  v-if="editMochilaForm.tiene_password && !editMochilaForm.deleteViewPassword"
                  @click="marcarEliminarPassword('mochila', 'view')"
                  type="button"
                  class="absolute right-2 top-[26px] text-xs text-danger hover:text-red-600 px-2 py-1 rounded hover:bg-danger/10"
                >
                  Eliminar
                </button>
                <span 
                  v-if="editMochilaForm.deleteViewPassword"
                  class="absolute right-2 top-[26px] text-xs text-danger font-medium"
                >
                  Se eliminará
                </span>
              </div>
            </div>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showEditMochilaModal = false" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" class="btn-primary flex-1" :disabled="loadingEdit">
              {{ loadingEdit ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Editar Objeto -->
    <div v-if="showEditObjetoModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-text-primary">Editar Objeto</h3>
          <button @click="showEditObjetoModal = false" class="text-text-secondary hover:text-text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="guardarObjeto" class="space-y-4">
          <div>
            <label class="block text-sm text-text-secondary mb-1">Nombre</label>
            <input v-model="editObjetoForm.nombre" type="text" class="input" required>
          </div>
          <div>
            <label class="block text-sm text-text-secondary mb-1">Descripción</label>
            <textarea v-model="editObjetoForm.descripcion" class="input resize-none" rows="2"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-text-secondary mb-1">Peso (g)</label>
              <input v-model.number="editObjetoForm.peso_gr" type="number" class="input">
            </div>
            <div>
              <label class="block text-sm text-text-secondary mb-1">Precio (€)</label>
              <input v-model.number="editObjetoForm.precio" type="number" step="0.01" class="input">
            </div>
          </div>
          <div>
            <label class="block text-sm text-text-secondary mb-1">URL de compra</label>
            <input v-model="editObjetoForm.url_compra" type="url" class="input">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-text-secondary mb-1">Grupo</label>
              <select v-model="editObjetoForm.grupo_id" class="input">
                <option value="">Sin grupo</option>
                <option v-for="grupo in grupos" :key="grupo.id" :value="grupo.id">
                  {{ grupo.nombre }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-text-secondary mb-1">Imagen</label>
              <input type="file" @change="handleEditFileUpload" accept="image/*" class="input-file">
            </div>
          </div>
          <div class="border-t border-border pt-4 mt-4">
            <h4 class="text-sm font-medium text-text-primary mb-3">Contraseña (dejar vacío para mantener actual)</h4>
            <div class="relative">
              <input 
                v-model="editObjetoForm.newEditPassword" 
                type="password" 
                placeholder="Nueva contraseña (vacío = mantener)" 
                class="input pr-28"
                :class="{ 'border-danger': editObjetoForm.deleteEditPassword }"
              >
              <button 
                v-if="editObjetoForm.tiene_password && !editObjetoForm.deleteEditPassword"
                @click="marcarEliminarPassword('objeto', 'edit')"
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-danger hover:text-red-600 px-2 py-1 rounded hover:bg-danger/10"
              >
                Eliminar
              </button>
              <span 
                v-if="editObjetoForm.deleteEditPassword"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-danger font-medium"
              >
                Se eliminará
              </span>
            </div>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showEditObjetoModal = false" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" class="btn-primary flex-1" :disabled="loadingEdit">
              {{ loadingEdit ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '../composables/useApi.js'

const { fetchData, uploadFile, loading, error } = useApi()

const isAdmin = ref(false)
const adminPassword = ref('')
const activeTab = ref('mochilas')
const tabs = [
  { id: 'mochilas', name: 'Mochilas' },
  { id: 'objetos', name: 'Objetos' }
]

// Datos
const mochilas = ref([])
const objetos = ref([])
const grupos = ref([])

// Forms crear
const nuevaMochila = ref({
  nombre: '',
  descripcion: '',
  capacidad_kg: null,
  editPassword: '',
  viewPassword: ''
})
const loadingMochila = ref(false)

const nuevoObjeto = ref({
  nombre: '',
  descripcion: '',
  peso_gr: null,
  precio: null,
  url_compra: '',
  grupo_id: '',
  editPassword: ''
})
const imagenFile = ref(null)
const loadingObjeto = ref(false)



// Forms editar
const showEditMochilaModal = ref(false)
const editMochilaForm = ref({
  id: null,
  nombre: '',
  descripcion: '',
  capacidad_kg: null,
  newEditPassword: '',
  newViewPassword: ''
})

const showEditObjetoModal = ref(false)
const editObjetoForm = ref({
  id: null,
  nombre: '',
  descripcion: '',
  peso_gr: null,
  precio: null,
  url_compra: '',
  grupo_id: '',
  newEditPassword: ''
})
const editImagenFile = ref(null)



const loadingEdit = ref(false)

// Iconos
const iconos = {
  sparkles: '✨',
  utensils: '🍳',
  shirt: '👕',
  bolt: '⚡',
  apple: '🍎',
  document: '📄',
  box: '📦'
}

const getIcono = (icono) => iconos[icono] || '📦'

// Methods
const login = async () => {
  try {
    await fetchData('/admin/verify', {
      method: 'POST',
      body: JSON.stringify({ password: adminPassword.value })
    })
    isAdmin.value = true
    localStorage.setItem('adminPassword', adminPassword.value)
    cargarDatos()
  } catch (err) {
    // Error ya manejado
  }
}

const logout = () => {
  isAdmin.value = false
  localStorage.removeItem('adminPassword')
  adminPassword.value = ''
}

const cargarDatos = async () => {
  await Promise.all([
    cargarMochilas(),
    cargarObjetos(),
    cargarGrupos()
  ])
}

const cargarMochilas = async () => {
  try {
    const password = localStorage.getItem('adminPassword')
    const data = await fetchData('/admin/mochilas', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'X-Admin-Password': password 
      }
    })
    mochilas.value = data
  } catch (err) {
    console.error('Error cargando mochilas:', err)
  }
}

const cargarObjetos = async () => {
  try {
    const data = await fetchData('/objetos')
    objetos.value = data
  } catch (err) {
    console.error('Error cargando objetos:', err)
  }
}

const cargarGrupos = async () => {
  try {
    const data = await fetchData('/grupos')
    grupos.value = data
  } catch (err) {
    console.error('Error cargando grupos:', err)
  }
}

const handleFileUpload = (event) => {
  imagenFile.value = event.target.files[0]
}

const handleEditFileUpload = (event) => {
  editImagenFile.value = event.target.files[0]
}

const crearMochilaAdmin = async () => {
  loadingMochila.value = true
  try {
    await fetchData('/mochilas', {
      method: 'POST',
      body: JSON.stringify({
        nombre: nuevaMochila.value.nombre,
        descripcion: nuevaMochila.value.descripcion,
        capacidad_kg: nuevaMochila.value.capacidad_kg,
        editPassword: nuevaMochila.value.editPassword || null,
        viewPassword: nuevaMochila.value.viewPassword || null
      })
    })
    
    nuevaMochila.value = { nombre: '', descripcion: '', capacidad_kg: null, editPassword: '', viewPassword: '' }
    await cargarMochilas()
    alert('Mochila creada exitosamente')
  } catch (err) {
    alert('Error creando mochila: ' + err.message)
  } finally {
    loadingMochila.value = false
  }
}

const crearObjeto = async () => {
  loadingObjeto.value = true
  try {
    // Paso 1: Crear objeto con datos (JSON)
    const nuevoObjetoCreado = await fetchData('/admin/objetos', {
      method: 'POST',
      body: JSON.stringify({
        nombre: nuevoObjeto.value.nombre,
        descripcion: nuevoObjeto.value.descripcion || '',
        peso_gr: nuevoObjeto.value.peso_gr || 0,
        precio: nuevoObjeto.value.precio || 0,
        url_compra: nuevoObjeto.value.url_compra || '',
        grupo_id: nuevoObjeto.value.grupo_id || '',
        editPassword: nuevoObjeto.value.editPassword || null,
        isAdmin: true
      })
    })
    
    // Paso 2: Subir imagen si hay (FormData separado)
    if (imagenFile.value && nuevoObjetoCreado.id) {
      const formData = new FormData()
      formData.append('imagen', imagenFile.value)
      await uploadFile(`/admin/objetos/${nuevoObjetoCreado.id}/imagen`, formData, 'POST', {
        'X-Admin-Password': localStorage.getItem('adminPassword')
      })
    }
    
    nuevoObjeto.value = { nombre: '', descripcion: '', peso_gr: null, precio: null, url_compra: '', grupo_id: '', editPassword: '' }
    imagenFile.value = null
    
    await cargarObjetos()
    alert('Objeto creado exitosamente')
  } catch (err) {
    alert('Error creando objeto: ' + err.message)
  } finally {
    loadingObjeto.value = false
  }
}



// Funciones de edición
const abrirEditarMochila = (mochila) => {
  editMochilaForm.value = {
    id: mochila.id,
    nombre: mochila.nombre,
    descripcion: mochila.descripcion || '',
    capacidad_kg: mochila.capacidad_kg,
    newEditPassword: '',
    newViewPassword: '',
    // Flags para saber si tiene contraseñas actualmente
    tiene_edit_password: mochila.tiene_edit_password,
    tiene_password: mochila.tiene_password, // Backend usa tiene_password para view_password
    // Flags para marcar eliminación
    deleteEditPassword: false,
    deleteViewPassword: false
  }
  showEditMochilaModal.value = true
}

const guardarMochila = async () => {
  loadingEdit.value = true
  try {
    // Construir body solo con campos que deben actualizarse
    const body = {
      nombre: editMochilaForm.value.nombre,
      descripcion: editMochilaForm.value.descripcion,
      capacidad_kg: editMochilaForm.value.capacidad_kg,
      isAdmin: true
    }

    // Manejar contraseña de edición
    if (editMochilaForm.value.deleteEditPassword) {
      // Explicitamente null = eliminar
      body.newEditPassword = null
    } else if (editMochilaForm.value.newEditPassword) {
      // Hay valor = actualizar
      body.newEditPassword = editMochilaForm.value.newEditPassword
    }
    // Si está vacío, no enviamos el campo (mantener actual)

    // Manejar contraseña de visualización
    if (editMochilaForm.value.deleteViewPassword) {
      // Explicitamente null = eliminar
      body.newViewPassword = null
    } else if (editMochilaForm.value.newViewPassword) {
      // Hay valor = actualizar
      body.newViewPassword = editMochilaForm.value.newViewPassword
    }
    // Si está vacío, no enviamos el campo (mantener actual)

    await fetchData(`/admin/mochilas/${editMochilaForm.value.id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    })

    showEditMochilaModal.value = false
    await cargarMochilas()
    alert('Mochila actualizada')
  } catch (err) {
    alert('Error: ' + err.message)
  } finally {
    loadingEdit.value = false
  }
}

const abrirEditarObjeto = (objeto) => {
  editObjetoForm.value = {
    id: objeto.id,
    nombre: objeto.nombre,
    descripcion: objeto.descripcion || '',
    peso_gr: objeto.peso_gr,
    precio: objeto.precio,
    url_compra: objeto.url_compra || '',
    grupo_id: objeto.grupo_id || '',
    newEditPassword: '',
    // Flag para saber si tiene contraseña actualmente
    tiene_password: objeto.tiene_password,
    // Flag para marcar eliminación
    deleteEditPassword: false
  }
  editImagenFile.value = null
  showEditObjetoModal.value = true
}

const guardarObjeto = async () => {
  loadingEdit.value = true
  try {
    // Construir body solo con campos que deben actualizarse
    const body = {
      nombre: editObjetoForm.value.nombre,
      descripcion: editObjetoForm.value.descripcion || '',
      peso_gr: editObjetoForm.value.peso_gr || 0,
      precio: editObjetoForm.value.precio || 0,
      url_compra: editObjetoForm.value.url_compra || '',
      grupo_id: editObjetoForm.value.grupo_id || '',
      isAdmin: true
    }

    // Manejar contraseña de edición
    if (editObjetoForm.value.deleteEditPassword) {
      // Explicitamente null = eliminar
      body.newEditPassword = null
    } else if (editObjetoForm.value.newEditPassword) {
      // Hay valor = actualizar
      body.newEditPassword = editObjetoForm.value.newEditPassword
    }
    // Si está vacío, no enviamos el campo (mantener actual)

    // Paso 1: Guardar datos (JSON)
    await fetchData(`/admin/objetos/${editObjetoForm.value.id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    })

    // Paso 2: Subir imagen si hay (FormData separado)
    if (editImagenFile.value) {
      const formData = new FormData()
      formData.append('imagen', editImagenFile.value)
      await uploadFile(`/admin/objetos/${editObjetoForm.value.id}/imagen`, formData, 'POST', {
        'X-Admin-Password': localStorage.getItem('adminPassword')
      })
    }

    showEditObjetoModal.value = false
    editImagenFile.value = null
    await cargarObjetos()
    alert('Objeto actualizado')
  } catch (err) {
    alert('Error: ' + err.message)
  } finally {
    loadingEdit.value = false
  }
}

// Marcar contraseña para eliminación
const marcarEliminarPassword = (tipo, passwordType) => {
  if (tipo === 'mochila') {
    if (passwordType === 'edit') {
      editMochilaForm.value.deleteEditPassword = true
      editMochilaForm.value.newEditPassword = ''
    } else if (passwordType === 'view') {
      editMochilaForm.value.deleteViewPassword = true
      editMochilaForm.value.newViewPassword = ''
    }
  } else if (tipo === 'objeto') {
    editObjetoForm.value.deleteEditPassword = true
    editObjetoForm.value.newEditPassword = ''
  }
}



// Eliminar
const eliminarMochila = async (mochila) => {
  if (!confirm(`¿Eliminar la mochila "${mochila.nombre}"?`)) return
  
  try {
    await fetchData(`/admin/mochilas/${mochila.id}`, {
      method: 'DELETE',
      body: JSON.stringify({ isAdmin: true })
    })
    await cargarMochilas()
  } catch (err) {
    alert('Error eliminando mochila')
  }
}

const eliminarObjeto = async (objeto) => {
  if (!confirm(`¿Eliminar el objeto "${objeto.nombre}"?`)) return
  
  try {
    await fetchData(`/admin/objetos/${objeto.id}`, {
      method: 'DELETE',
      body: JSON.stringify({ isAdmin: true })
    })
    await cargarObjetos()
  } catch (err) {
    alert('Error eliminando objeto')
  }
}



const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}

// Init
onMounted(() => {
  const savedPassword = localStorage.getItem('adminPassword')
  if (savedPassword) {
    adminPassword.value = savedPassword
    login()
  }
})
</script>
