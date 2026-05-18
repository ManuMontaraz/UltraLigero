<template>
  <div class="min-h-screen bg-dark-bg">
    <!-- Header -->
    <header class="border-b border-dark-border bg-dark-card sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <router-link to="/" class="p-2 hover:bg-dark-bg rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </router-link>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-xl font-bold text-white">{{ mochila.nombre }}</h1>
                <span class="px-2 py-1 bg-accent/20 text-accent rounded text-sm font-mono">
                  {{ mochila.codigo }}
                </span>
                <span v-if="mochila.is_private" class="text-red-500 text-sm" title="Mochila privada">🔒</span>
                <span v-else-if="mochila.tiene_edit_password" class="text-yellow-500 text-sm" title="Protegida con contraseña">🔒</span>
              </div>
              <p class="text-gray-400 text-sm">{{ mochila.descripcion || 'Sin descripción' }}</p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <!-- Contraseña de edición (si la mochila tiene protección) -->
            <div v-if="mochila.tiene_edit_password" class="flex items-center gap-2">
              <input
                v-model="editPasswordMochila"
                type="password"
                placeholder="Contraseña de edición"
                class="input w-32 sm:w-40 text-sm"
                :class="{ 'border-yellow-500': camposBloqueados }"
              >
              <span v-if="editPasswordMochila" class="text-green-500 text-xs">✓</span>
            </div>

            <!-- Mensaje cuando campos están bloqueados -->
            <div v-if="camposBloqueados" class="text-yellow-500 text-xs">
              ⚠️ Introduce la contraseña para editar
            </div>

            <button
              v-if="hasLocalChanges"
              @click="clearAllChangesHandler"
              class="btn-secondary text-sm"
              :disabled="camposBloqueados"
              :class="{ 'opacity-50 cursor-not-allowed': camposBloqueados }"
              :title="camposBloqueados ? 'Introduce la contraseña de edición primero' : ''"
            >
              Limpiar cambios
            </button>
            <button
              @click="showAddModal = true"
              class="btn-primary flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Añadir Objeto
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Migas de pan (clonada desde) -->
    <div v-if="mochila.parent_id" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0">
      <div class="flex items-center gap-2 text-sm text-gray-400">
        <span>clon de:</span>
        <router-link 
          v-if="mochila.parent_codigo" 
          :to="`/m/${mochila.parent_codigo}`" 
          class="text-accent hover:underline"
        >
          {{ mochila.parent_nombre }}
        </router-link>
        <span v-else class="text-gray-500">Mochila eliminada</span>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="card">
          <div class="text-gray-400 text-sm mb-1">Peso Total</div>
          <div class="text-3xl font-bold text-white">
            {{ pesoTotal.toFixed(0) }}g
            <span v-if="pesoTotal >= 1000" class="text-lg text-gray-400">
              ({{ (pesoTotal / 1000).toFixed(2) }}kg)
            </span>
          </div>
        </div>
        <div class="card">
          <div class="text-gray-400 text-sm mb-1">Precio Total</div>
          <div class="text-3xl font-bold text-white">
            {{ precioTotal.toFixed(2) }}€
          </div>
        </div>
        <div class="card">
          <div class="text-gray-400 text-sm mb-1">Objetos</div>
          <div class="text-3xl font-bold text-white">
            {{ totalObjetos }}
          </div>
          <div class="text-gray-500 text-sm">
            {{ objetos.length }} diferentes
          </div>
        </div>
      </div>

    <!-- Password Modal (Mochila privada) -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="card max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-white mb-4">Mochila privada</h3>
        <p class="text-gray-400 mb-4">Esta mochila es privada. Introduce la contraseña de edición para acceder.</p>
        <input 
          v-model="editPasswordMochila"
          type="password"
          placeholder="Contraseña de edición"
          class="input mb-4"
        >
        <div class="flex gap-3">
          <button @click="$router.push('/')" class="btn-secondary flex-1">Cancelar</button>
          <button @click="cargarMochilaConPassword" class="btn-primary flex-1">Acceder</button>
        </div>
      </div>
    </div>

      <!-- Password Modal (Editar objeto) -->
      <div v-if="showObjetoPasswordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="card max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-white mb-2">Contraseña requerida</h3>
          <p class="text-gray-400 mb-4">Este objeto está protegido. Introduce la contraseña de edición.</p>
          <div v-if="objetoEditando && objetoEditando.tiene_password && mochilaPassword" class="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 mb-4">
            <p class="text-yellow-400 text-sm">💡 Este objeto tiene la misma contraseña que la mochila</p>
          </div>
          <input 
            v-model="objetoPasswordInput"
            type="password"
            placeholder="Contraseña de edición"
            class="input mb-4"
          >
          <div class="flex gap-3">
            <button @click="cancelarPasswordObjeto" class="btn-secondary flex-1">Cancelar</button>
            <button @click="confirmarPasswordObjeto" class="btn-primary flex-1">Continuar</button>
          </div>
        </div>
      </div>

      <!-- Objetos por Grupo -->
      <div v-if="objetos.length > 0" class="space-y-6">
        <div v-for="grupo in gruposConObjetos" :key="grupo.id" class="card">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="`bg-${grupo.color}-500/20`">
              <span class="text-2xl">{{ getIcono(grupo.icono) }}</span>
            </div>
            <h3 class="text-lg font-semibold text-white">{{ grupo.nombre }}</h3>
            <span class="text-gray-500 text-sm">({{ grupo.objetos.length }} objetos)</span>
          </div>

          <div class="space-y-3">
            <div 
              v-for="obj in grupo.objetos" 
              :key="obj.id"
              class="relative flex flex-col md:flex-row gap-4 p-4 pr-16 bg-dark-bg rounded-lg group hover:border hover:border-dark-border transition-all"
            >
              <!-- Botones arriba a la derecha -->
              <div class="absolute top-2 right-2 flex items-center gap-1">
                <button 
                  @click="solicitarEditarObjeto(obj)"
                  class="p-1.5 text-gray-500 hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Editar objeto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  @click="solicitarEliminarObjeto(obj)"
                  class="p-1.5 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar de mochila"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <!-- Imagen -->
              <div class="w-16 h-16 bg-dark-card rounded-lg flex-shrink-0 overflow-hidden">
                <img 
                  v-if="obj.imagen_url" 
                  :src="obj.imagen_url" 
                  class="w-full h-full object-cover"
                  :alt="obj.nombre"
                >
                <div v-else class="w-full h-full flex items-center justify-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h4 class="font-medium text-white">{{ obj.nombre }}</h4>
                  <span v-if="obj.tiene_password" class="text-yellow-500 text-xs" title="Protegido">🔒</span>
                </div>
                <p v-if="obj.descripcion" class="text-gray-500 text-sm mt-1 whitespace-pre-wrap">{{ obj.descripcion }}</p>
                <div v-if="obj.url_compra" class="mt-2 text-sm">
                  <a 
                    :href="obj.url_compra" 
                    target="_blank"
                    class="text-accent hover:underline"
                  >
                    Ver producto →
                  </a>
                </div>
              </div>

              <!-- Valores editables -->
              <div class="flex flex-wrap items-center gap-4 md:justify-end">
                <div class="text-right">
                  <div class="text-gray-400 text-xs">Cantidad</div>
                  <div class="flex items-center gap-2">
                    <input
                      v-model.number="cantidadesLocales[obj.id]"
                      type="number"
                      min="1"
                      class="input w-16 text-right text-sm py-1"
                      :class="{ 'opacity-50 cursor-not-allowed': camposBloqueados }"
                      placeholder="1"
                      @change="updateCantidad(obj.id)"
                      :disabled="camposBloqueados"
                      :title="camposBloqueados ? 'Introduce la contraseña de edición primero' : ''"
                    >
                    <span class="text-gray-500 text-sm">u</span>
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-gray-400 text-xs">Peso</div>
                  <div class="flex items-center gap-2">
                    <input
                      v-model.number="pesosLocales[obj.id]"
                      type="number"
                      class="input w-20 text-right text-sm py-1"
                      :class="{ 'opacity-50 cursor-not-allowed': camposBloqueados }"
                      placeholder="g"
                      @change="updatePeso(obj.id)"
                      :disabled="camposBloqueados"
                      :title="camposBloqueados ? 'Introduce la contraseña de edición primero' : ''"
                    >
                    <span class="text-gray-500 text-sm">g</span>
                  </div>
                  <div v-if="hasLocalChange(obj.id, 'peso')" class="text-accent text-xs">
                    Original: {{ obj.peso_gr }}g
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-gray-400 text-xs">Precio</div>
                  <div class="flex items-center gap-2">
                    <input
                      v-model.number="preciosLocales[obj.id]"
                      type="number"
                      step="0.01"
                      class="input w-24 text-right text-sm py-1"
                      :class="{ 'opacity-50 cursor-not-allowed': camposBloqueados }"
                      placeholder="€"
                      @change="updatePrecio(obj.id)"
                      :disabled="camposBloqueados"
                      :title="camposBloqueados ? 'Introduce la contraseña de edición primero' : ''"
                    >
                    <span class="text-gray-500 text-sm">€</span>
                  </div>
                  <div v-if="hasLocalChange(obj.id, 'precio')" class="text-accent text-xs">
                    Original: {{ obj.precio }}€
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Totales del grupo -->
          <div class="mt-4 pt-4 border-t border-dark-border flex justify-end gap-8 text-sm">
            <span class="text-gray-400">
              Peso: <span class="text-white font-medium">{{ calcularPesoGrupo(grupo).toFixed(0) }}g</span>
            </span>
            <span class="text-gray-400">
              Precio: <span class="text-white font-medium">{{ calcularPrecioGrupo(grupo).toFixed(2) }}€</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="card text-center py-16">
        <div class="w-20 h-20 bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-white mb-2">Mochila vacía</h3>
        <p class="text-gray-400 mb-6">Añade objetos para comenzar a organizar tu equipaje</p>
        <button @click="showAddModal = true" class="btn-primary">
          Añadir Primer Objeto
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>

    </main>

    <!-- Modal Añadir Objeto -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-white">Añadir Objeto</h3>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Crear Nuevo Objeto -->
        <div class="mb-6 p-4 bg-dark-bg rounded-lg border border-dark-border">
          <h4 class="text-sm font-medium text-gray-300 mb-3">Crear nuevo objeto</h4>
          <form @submit.prevent="crearNuevoObjeto" class="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <option v-for="grupo in gruposDisponibles" :key="grupo.id" :value="grupo.id">
                  {{ grupo.nombre }}
                </option>
              </select>
            </div>
            <div>
              <input type="file" @change="handleFileUpload" accept="image/*" class="input-file">
            </div>
            
            <!-- Checkbox herencia contraseña (si la mochila tiene contraseña de edición) -->
            <div v-if="mochila.tiene_edit_password" class="md:col-span-2 flex items-center gap-2 p-3 bg-dark-card rounded-lg">
              <input 
                id="heredarPassword" 
                v-model="nuevoObjeto.heredarPassword" 
                type="checkbox"
                class="w-4 h-4 rounded border-gray-600 text-accent focus:ring-accent"
              >
              <label for="heredarPassword" class="text-sm text-gray-300 cursor-pointer">
                Usar misma contraseña que la mochila (no se pedirá al editar)
              </label>
            </div>
            
            <!-- Campo de contraseña propia del objeto (si no se hereda) -->
            <div v-if="!mochila.tiene_edit_password || !nuevoObjeto.heredarPassword" class="md:col-span-2">
              <input 
                v-model="nuevoObjeto.editPassword" 
                type="password" 
                placeholder="Contraseña de edición del objeto (opcional)" 
                class="input"
              >
              <p v-if="!mochila.tiene_edit_password" class="text-gray-500 text-xs mt-1">
                La mochila no tiene contraseña. Puedes proteger solo este objeto si lo deseas.
              </p>
            </div>
            
            <div class="md:col-span-2">
              <button type="submit" class="btn-primary" :disabled="loadingCrear">
                {{ loadingCrear ? 'Creando...' : 'Crear y Añadir' }}
              </button>
            </div>
          </form>
        </div>

        <div class="text-center text-gray-500 my-4">— o selecciona existente —</div>

        <!-- Buscador objetos existentes -->
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Buscar objetos existentes..."
          class="input mb-4"
        >

        <!-- Lista de objetos existentes -->
        <div v-if="objetosFiltrados.length > 0" class="space-y-2 max-h-64 overflow-y-auto">
          <div 
            v-for="obj in objetosFiltrados" 
            :key="obj.id"
            class="flex items-center gap-4 p-3 bg-dark-bg rounded-lg hover:bg-dark-border cursor-pointer transition-colors"
            @click="seleccionarObjetoExistente(obj)"
          >
            <div class="w-12 h-12 bg-dark-card rounded flex-shrink-0 overflow-hidden">
              <img v-if="obj.imagen_url" :src="obj.imagen_url" class="w-full h-full object-cover">
              <div v-else class="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin img</div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <div class="font-medium text-white">{{ obj.nombre }}</div>
                <span v-if="obj.tiene_password" class="text-yellow-500 text-xs">🔒</span>
              </div>
              <div class="text-sm text-gray-500">{{ obj.peso_gr }}g • {{ obj.precio }}€</div>
            </div>
            <div class="px-2 py-1 bg-dark-card rounded text-xs" :class="`text-${obj.grupo_color}-400`">
              {{ obj.grupo_nombre }}
            </div>
          </div>
        </div>

        <div v-else class="text-center py-4 text-gray-500">
          No hay objetos disponibles
        </div>

      </div>
    </div>

    <!-- Modal Editar Objeto -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-white">Editar Objeto</h3>
          <button @click="showEditModal = false" class="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="guardarCambiosObjeto" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm text-gray-400 mb-1">Nombre</label>
            <input v-model="editForm.nombre" type="text" placeholder="Nombre *" class="input" required>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm text-gray-400 mb-1">Descripción</label>
            <textarea v-model="editForm.descripcion" placeholder="Descripción" class="input resize-none" rows="2"></textarea>
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Peso (g)</label>
            <input v-model.number="editForm.peso_gr" type="number" placeholder="Peso (g)" class="input">
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Precio (€)</label>
            <input v-model.number="editForm.precio" type="number" step="0.01" placeholder="Precio (€)" class="input">
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm text-gray-400 mb-1">URL de compra</label>
            <input v-model="editForm.url_compra" type="url" placeholder="URL de compra" class="input">
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Grupo</label>
            <select v-model="editForm.grupo_id" class="input">
              <option value="">Sin grupo</option>
              <option v-for="grupo in gruposDisponibles" :key="grupo.id" :value="grupo.id">
                {{ grupo.nombre }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Imagen</label>
            <input type="file" @change="handleEditFileUpload" accept="image/*" class="input-file">
            <p v-if="editImagenFile" class="text-accent text-xs mt-1">Nueva imagen seleccionada</p>
          </div>
          
          <div class="md:col-span-2">
            <button type="submit" class="btn-primary w-full" :disabled="loadingEdit">
              {{ loadingEdit ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>

        <!-- Zona de peligro - Eliminar objeto permanentemente -->
        <div class="mt-6 pt-6 border-t border-red-900/50">
          <div class="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <h4 class="text-sm font-medium text-red-400 mb-2">Zona de peligro</h4>
            <p class="text-gray-400 text-sm mb-3">Eliminar este objeto permanentemente de la base de datos</p>
            
            <div v-if="!showDeleteObjetoConfirm">
              <button 
                @click="showDeleteObjetoConfirm = true"
                class="text-red-500 hover:text-red-400 text-sm font-medium px-3 py-2 rounded border border-red-800 hover:bg-red-900/30 transition-colors"
              >
                Eliminar objeto permanentemente
              </button>
            </div>
            <div v-else class="space-y-3">
              <p class="text-red-400 text-sm">¿Eliminar de todas las mochilas? Esta acción no se puede deshacer.</p>
              <div class="flex gap-3">
                <button 
                  @click="showDeleteObjetoConfirm = false"
                  class="btn-secondary flex-1 text-sm"
                >
                  Cancelar
                </button>
                <button 
                  @click="executeDeleteObjeto"
                  class="flex-1 text-sm bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                  :disabled="loadingDeleteObjeto"
                >
                  {{ loadingDeleteObjeto ? 'Eliminando...' : 'Sí, eliminar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAB Editar Mochila -->
    <button
      @click="openEditMochilaModal"
      class="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-dark-card border border-dark-border text-accent hover:bg-dark-bg shadow-lg flex items-center justify-center z-50 transition-colors"
      title="Editar mochila"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Modal Editar Mochila -->
    <div v-if="showEditMochilaModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-white">Editar Mochila</h3>
          <button @click="showEditMochilaModal = false" class="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveMochilaChanges" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1">Nombre</label>
            <input v-model="editMochilaForm.nombre" type="text" class="input" required>
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Descripción</label>
            <textarea v-model="editMochilaForm.descripcion" class="input resize-none" rows="2"></textarea>
          </div>
          <div v-if="mochila.tiene_edit_password" class="flex items-center gap-2 pt-2">
            <input 
              v-model="editMochilaForm.isPrivate" 
              type="checkbox" 
              id="editIsPrivate"
              class="w-4 h-4 rounded border-gray-600 bg-dark-card text-accent focus:ring-accent"
            >
            <label for="editIsPrivate" class="text-sm text-gray-300">
              Mochila privada (requiere contraseña para ver)
            </label>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showEditMochilaModal = false" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" class="btn-primary flex-1" :disabled="loadingEditMochila">
              {{ loadingEditMochila ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>

        <!-- Clonar mochila -->
        <div class="mt-4 pt-4 border-t border-dark-border">
          <!-- Botón para mostrar formulario de clonación -->
          <button 
            v-if="!showCloneForm"
            @click="showCloneForm = true; clonePassword = ''"
            class="w-full btn-secondary flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Clonar como nueva mochila
          </button>
          
          <!-- Formulario de clonación -->
          <div v-else class="p-3 bg-dark-bg rounded-lg border border-dark-border">
            <p class="text-gray-400 text-sm mb-2">Configurar nueva mochila</p>
            <input 
              v-model="clonePassword" 
              type="password" 
              placeholder="Nueva contraseña (opcional)"
              class="input text-sm w-full mb-2"
            >
            <p class="text-gray-500 text-xs mb-3">
              Deja vacío para crear sin contraseña (será pública)
            </p>
            <div class="flex gap-2">
              <button 
                @click="showCloneForm = false; clonePassword = ''"
                class="btn-secondary text-sm flex-1"
              >
                Cancelar
              </button>
              <button 
                @click="executeClone"
                class="btn-primary text-sm flex-1"
                :disabled="loadingClone"
              >
                {{ loadingClone ? 'Clonando...' : 'Clonar ahora' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Zona de peligro -->
        <div class="mt-6 pt-6 border-t border-red-900/50">
          <div class="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <h4 class="text-sm font-medium text-red-400 mb-2">Zona de peligro</h4>
            <p class="text-gray-400 text-sm mb-3">Eliminar permanentemente esta mochila y todos sus objetos</p>
            
            <div v-if="!showDeleteConfirm">
              <button 
                @click="showDeleteConfirm = true"
                class="text-red-500 hover:text-red-400 text-sm font-medium px-3 py-2 rounded border border-red-800 hover:bg-red-900/30 transition-colors"
              >
                Eliminar mochila
              </button>
            </div>
            <div v-else class="space-y-3">
              <p class="text-red-400 text-sm">¿Eliminar permanentemente esta mochila?</p>
              <div class="flex gap-3">
                <button 
                  @click="showDeleteConfirm = false"
                  class="btn-secondary flex-1 text-sm"
                >
                  Cancelar
                </button>
                <button 
                  @click="executeDelete"
                  class="flex-1 text-sm bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                  :disabled="loadingDelete"
                >
                  {{ loadingDelete ? 'Eliminando...' : 'Sí, eliminar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div 
      v-if="toast.message" 
      class="fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-all z-[100]"
      :class="toast.type === 'error' ? 'bg-red-500' : 'bg-accent'"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '../composables/useApi.js'
import { useLocalChanges } from '../composables/useLocalChanges.js'
import { useSEO } from '../composables/useSEO.js'
import { generateBackpackSchema } from '../utils/schemas.js'

const route = useRoute()
const router = useRouter()
const { fetchData, uploadFile, loading } = useApi()
const { localChanges, updateLocalChange, getEffectiveValue, hasLocalChange, clearAllChanges, initializeFromLoadedData } = useLocalChanges(fetchData)

const mochila = ref({})
const objetos = ref([])
const objetosDisponibles = ref([])
const gruposDisponibles = ref([])
const showAddModal = ref(false)
const showPasswordModal = ref(false)
const showObjetoPasswordModal = ref(false)
const mochilaPassword = ref('') // Guardamos la contraseña de la mochila para herencia
const editPasswordMochila = ref('')
const searchQuery = ref('')
const toast = ref({ message: '', type: 'success' })

const pesosLocales = ref({})
const preciosLocales = ref({})
const cantidadesLocales = ref({})

// Estado para modales de contraseña de objetos
const objetoEditando = ref(null)
const objetoPasswordInput = ref('')
const accionPendiente = ref(null) // 'eliminar' o null

// Form nuevo objeto
const nuevoObjeto = ref({
  nombre: '',
  descripcion: '',
  peso_gr: null,
  precio: null,
  url_compra: '',
  grupo_id: '',
  editPassword: '',
  heredarPassword: true
})
const imagenFile = ref(null)
const loadingCrear = ref(false)

// Variables para edición
const showEditModal = ref(false)
const editForm = ref({
  id: null,
  nombre: '',
  descripcion: '',
  peso_gr: null,
  precio: null,
  url_compra: '',
  grupo_id: ''
})
const editImagenFile = ref(null)
const loadingEdit = ref(false)
const showDeleteObjetoConfirm = ref(false)
const loadingDeleteObjeto = ref(false)

// Estado para edición de mochila
const showEditMochilaModal = ref(false)
const editMochilaForm = ref({
  nombre: '',
  descripcion: '',
  isPrivate: false
})
const showDeleteConfirm = ref(false)
const loadingEditMochila = ref(false)
const loadingDelete = ref(false)
const loadingClone = ref(false)
const showCloneForm = ref(false)
const clonePassword = ref('')

// Iconos
const iconos = {
  sparkles: '✨',
  utensils: '🍳',
  shirt: '👕',
  bolt: '⚡',
  apple: '🍎',
  document: '📄',
  moon: '🌙',
  box: '📦'
}

const getIcono = (icono) => iconos[icono] || '📦'

// Computed
const gruposConObjetos = computed(() => {
  const grupos = {}
  
  objetos.value.forEach(obj => {
    const grupoId = obj.grupo_id || 0
    if (!grupos[grupoId]) {
      grupos[grupoId] = {
        id: grupoId,
        nombre: obj.grupo_nombre || 'Sin grupo',
        icono: obj.grupo_icono || 'box',
        color: obj.grupo_color || 'gray',
        objetos: []
      }
    }
    grupos[grupoId].objetos.push(obj)
  })
  
  return Object.values(grupos)
})

const pesoTotal = computed(() => {
  return objetos.value.reduce((total, obj) => {
    // Usar valor local si existe, sino el del backend
    const peso = pesosLocales.value[obj.id] !== undefined ? pesosLocales.value[obj.id] : obj.peso_gr
    const cantidad = cantidadesLocales.value[obj.id] !== undefined ? cantidadesLocales.value[obj.id] : obj.cantidad
    return total + (peso * cantidad)
  }, 0)
})

const precioTotal = computed(() => {
  return objetos.value.reduce((total, obj) => {
    // Usar valor local si existe, sino el del backend
    const precio = preciosLocales.value[obj.id] !== undefined ? preciosLocales.value[obj.id] : obj.precio
    const cantidad = cantidadesLocales.value[obj.id] !== undefined ? cantidadesLocales.value[obj.id] : obj.cantidad
    return total + (precio * cantidad)
  }, 0)
})

const totalObjetos = computed(() => {
  return objetos.value.reduce((total, obj) => {
    // Usar valor local si existe, sino el del backend
    const cantidad = cantidadesLocales.value[obj.id] !== undefined ? cantidadesLocales.value[obj.id] : obj.cantidad
    return total + cantidad
  }, 0)
})

const hasLocalChanges = computed(() => {
  return Object.keys(localChanges.value).length > 0
})

const objetosFiltrados = computed(() => {
  if (!searchQuery.value) return objetosDisponibles.value
  const query = searchQuery.value.toLowerCase()
  return objetosDisponibles.value.filter(obj => 
    obj.nombre.toLowerCase().includes(query) ||
    (obj.descripcion && obj.descripcion.toLowerCase().includes(query))
  )
})

// Methods
const cargarMochila = async (password = null) => {
  try {
    const body = password ? { editPassword: password } : {}
    const data = await fetchData(`/mochilas/${route.params.codigo}`, {
      method: 'POST',
      body: JSON.stringify(body)
    })
    
    mochila.value = data
    objetos.value = data.objetos || []
    
    // SEO dinámico para la mochila
    const categorias = [...new Set(objetos.value.map(obj => obj.grupo_nombre).filter(Boolean))]
    useSEO({
      title: `Mochila de ${data.nombre} - ${pesoTotal.value.toFixed(0)}g`,
      description: `Equipaje ultraligero: ${totalObjetos.value} objetos, ${pesoTotal.value.toFixed(0)}g, ${precioTotal.value.toFixed(2)}€. Organizado en ${categorias.slice(0, 3).join(', ')}${categorias.length > 3 ? '...' : ''}.`,
      image: data.og_image_url ? `https://leafpack.mntr.es${data.og_image_url}` : 'https://leafpack.mntr.es/og-default.jpg',
      url: `https://leafpack.mntr.es/m/${data.codigo}`,
      schema: generateBackpackSchema(data, objetos.value)
    })
    
    // Guardar contraseña de mochila si se usó
    if (password) {
      mochilaPassword.value = password
    }
    
    // Inicializar valores locales (ya vienen aplicados desde BD)
    objetos.value.forEach(obj => {
      pesosLocales.value[obj.id] = obj.peso_gr
      preciosLocales.value[obj.id] = obj.precio
      cantidadesLocales.value[obj.id] = obj.cantidad
    })
    
    // Inicializar el estado de cambios locales
    initializeFromLoadedData(objetos.value)
    
    // Cargar grupos disponibles
    await cargarGrupos()
    
    showPasswordModal.value = false
  } catch (err) {
    if (err.message.includes('requiere contraseña')) {
      showPasswordModal.value = true
    } else {
      showToast(err.message, 'error')
    }
  }
}

const cargarGrupos = async () => {
  try {
    const data = await fetchData('/grupos')
    gruposDisponibles.value = data
  } catch (err) {
    console.error('Error cargando grupos:', err)
  }
}

const cargarMochilaConPassword = () => {
  cargarMochila(editPasswordMochila.value)
}

const cargarObjetosDisponibles = async () => {
  try {
    const objetosData = await fetchData('/objetos')
    
    // Filtrar objetos que ya están en la mochila
    const objetosEnMochila = new Set(objetos.value.map(o => o.id))
    objetosDisponibles.value = objetosData.filter(o => !objetosEnMochila.has(o.id))
    
    // Los grupos ya se cargan en cargarMochila
  } catch (err) {
    console.error('Error cargando objetos:', err)
  }
}

const crearNuevoObjeto = async () => {
  loadingCrear.value = true
  try {
    // Validación básica
    if (!nuevoObjeto.value.nombre || nuevoObjeto.value.nombre.trim() === '') {
      showToast('El nombre del objeto es requerido', 'error')
      loadingCrear.value = false
      return
    }

    const formData = new FormData()
    
    // Campos de texto primero (multer los procesa antes que el archivo)
    formData.append('nombre', nuevoObjeto.value.nombre.trim())
    formData.append('descripcion', nuevoObjeto.value.descripcion || '')
    formData.append('peso_gr', nuevoObjeto.value.peso_gr ? String(nuevoObjeto.value.peso_gr) : '0')
    formData.append('precio', nuevoObjeto.value.precio ? String(nuevoObjeto.value.precio) : '0')
    formData.append('url_compra', nuevoObjeto.value.url_compra || '')
    formData.append('grupo_id', nuevoObjeto.value.grupo_id ? String(nuevoObjeto.value.grupo_id) : '')
    
    // Lógica de herencia de contraseña
    if (nuevoObjeto.value.heredarPassword && mochilaPassword.value) {
      formData.append('mochilaEditPassword', mochilaPassword.value)
    } else if (nuevoObjeto.value.editPassword && nuevoObjeto.value.editPassword.trim() !== '') {
      formData.append('editPassword', nuevoObjeto.value.editPassword.trim())
    }
    
    // Archivo al final
    if (imagenFile.value) {
      formData.append('imagen', imagenFile.value)
    }

    console.log('Enviando objeto:', {
      nombre: nuevoObjeto.value.nombre,
      heredarPassword: nuevoObjeto.value.heredarPassword,
      tieneMochilaPassword: !!mochilaPassword.value
    })

    const nuevoObjetoCreado = await uploadFile('/objetos', formData)
    
    // Añadir a la mochila
    await fetchData(`/mochilas/${mochila.value.id}/objetos`, {
      method: 'POST',
      body: JSON.stringify({
        objeto_id: nuevoObjetoCreado.id,
        cantidad: 1,
        editPassword: editPasswordMochila.value
      })
    })
    
    showToast('Objeto creado y añadido')
    
    // Reset form
    nuevoObjeto.value = { 
      nombre: '', descripcion: '', peso_gr: null, precio: null, 
      url_compra: '', grupo_id: '', editPassword: '', heredarPassword: true 
    }
    imagenFile.value = null
    
    await cargarMochila(mochilaPassword.value)
    await cargarObjetosDisponibles()
    showAddModal.value = false
  } catch (err) {
    showToast(err.message, 'error')
  } finally {
    loadingCrear.value = false
  }
}

const seleccionarObjetoExistente = async (objeto) => {
  try {
    await fetchData(`/mochilas/${mochila.value.id}/objetos`, {
      method: 'POST',
      body: JSON.stringify({
        objeto_id: objeto.id,
        cantidad: 1,
        editPassword: editPasswordMochila.value
      })
    })
    
    showToast('Objeto añadido')
    await cargarMochila(mochilaPassword.value)
    await cargarObjetosDisponibles()
    showAddModal.value = false
  } catch (err) {
    showToast(err.message, 'error')
  }
}

const solicitarEliminarObjeto = async (objeto) => {
  // Verificar si el objeto tiene contraseña
  if (!objeto.tiene_password) {
    // Sin contraseña, eliminar directamente
    await eliminarObjeto(objeto)
    return
  }
  
  // Si tiene contraseña, verificar si es la misma que la mochila
  if (mochilaPassword.value) {
    try {
      // Verificar si la contraseña de la mochila funciona para este objeto
      const result = await fetchData(`/objetos/${objeto.id}/verify-password`, {
        method: 'POST',
        body: JSON.stringify({ editPassword: mochilaPassword.value })
      })
      
      if (result.valid) {
        // Es la misma contraseña, eliminar directamente
        await eliminarObjeto(objeto, mochilaPassword.value)
        return
      }
    } catch (e) {
      // No es la misma contraseña, pedirla
    }
  }
  
  // Pedir contraseña del objeto
  objetoEditando.value = objeto
  accionPendiente.value = 'eliminar'
  objetoPasswordInput.value = ''
  showObjetoPasswordModal.value = true
}

const confirmarPasswordObjeto = async () => {
  if (!objetoEditando.value || !accionPendiente.value) return
  
  try {
    if (accionPendiente.value === 'eliminar') {
      await eliminarObjeto(objetoEditando.value, objetoPasswordInput.value)
    } else if (accionPendiente.value === 'editar') {
      abrirModalEdicion(objetoEditando.value, objetoPasswordInput.value)
    }
    
    showObjetoPasswordModal.value = false
    // No limpiamos objetoEditando ni accionPendiente aquí porque se usan en la edición
    if (accionPendiente.value === 'eliminar') {
      objetoEditando.value = null
      accionPendiente.value = null
    }
  } catch (err) {
    showToast('Contraseña incorrecta', 'error')
  }
}

const cancelarPasswordObjeto = () => {
  showObjetoPasswordModal.value = false
  objetoEditando.value = null
  accionPendiente.value = null
}

const eliminarObjeto = async (objeto, password = null) => {
  if (!confirm('¿Eliminar este objeto de la mochila?')) return
  
  try {
    await fetchData(`/mochilas/${mochila.value.id}/objetos/${objeto.id}`, {
      method: 'DELETE',
      body: JSON.stringify({ 
        editPassword: password || editPasswordMochila.value 
      })
    })
    
    showToast('Objeto eliminado')
    await cargarMochila(mochilaPassword.value)
    await cargarObjetosDisponibles()
  } catch (err) {
    showToast(err.message, 'error')
  }
}

// Funciones para editar objeto
const solicitarEditarObjeto = async (objeto) => {
  // Verificar si el objeto tiene contraseña
  if (!objeto.tiene_password) {
    // Sin contraseña, abrir modal directamente
    abrirModalEdicion(objeto)
    return
  }
  
  // Si tiene contraseña, verificar si es la misma que la mochila
  if (mochilaPassword.value) {
    try {
      // Verificar si la contraseña de la mochila funciona para este objeto
      const result = await fetchData(`/objetos/${objeto.id}/verify-password`, {
        method: 'POST',
        body: JSON.stringify({ editPassword: mochilaPassword.value })
      })
      
      if (result.valid) {
        // Es la misma contraseña, abrir modal directamente
        abrirModalEdicion(objeto, mochilaPassword.value)
        return
      }
    } catch (e) {
      // No es la misma contraseña, pedirla
    }
  }
  
  // Pedir contraseña del objeto
  objetoEditando.value = objeto
  accionPendiente.value = 'editar'
  objetoPasswordInput.value = ''
  showObjetoPasswordModal.value = true
}

const abrirModalEdicion = (objeto, password = null) => {
  // Cargar datos del objeto en el formulario
  editForm.value = {
    id: objeto.id,
    nombre: objeto.nombre,
    descripcion: objeto.descripcion || '',
    peso_gr: objeto.peso_gr,
    precio: objeto.precio,
    url_compra: objeto.url_compra || '',
    grupo_id: objeto.grupo_id || ''
  }
  
  // Guardar la contraseña si se proporcionó (para usar al guardar)
  if (password) {
    objetoPasswordInput.value = password
  }
  
  showEditModal.value = true
}

const handleEditFileUpload = (event) => {
  editImagenFile.value = event.target.files[0]
}

const guardarCambiosObjeto = async () => {
  loadingEdit.value = true
  try {
    // Validación básica
    if (!editForm.value.nombre || editForm.value.nombre.trim() === '') {
      showToast('El nombre del objeto es requerido', 'error')
      loadingEdit.value = false
      return
    }

    const formData = new FormData()
    
    // Campos de texto
    formData.append('nombre', editForm.value.nombre.trim())
    formData.append('descripcion', editForm.value.descripcion || '')
    formData.append('peso_gr', editForm.value.peso_gr ? String(editForm.value.peso_gr) : '0')
    formData.append('precio', editForm.value.precio ? String(editForm.value.precio) : '0')
    formData.append('url_compra', editForm.value.url_compra || '')
    formData.append('grupo_id', editForm.value.grupo_id ? String(editForm.value.grupo_id) : '')
    
    // Contraseña para editar (si el objeto la tiene)
    if (objetoPasswordInput.value) {
      formData.append('editPassword', objetoPasswordInput.value)
    }
    
    // Archivo al final
    if (editImagenFile.value) {
      formData.append('imagen', editImagenFile.value)
    }

    await uploadFile(`/objetos/${editForm.value.id}/update`, formData, 'POST')
    
    showToast('Objeto actualizado')
    
    // Reset form
    editForm.value = { 
      id: null, nombre: '', descripcion: '', peso_gr: null, 
      precio: null, url_compra: '', grupo_id: '' 
    }
    editImagenFile.value = null
    objetoPasswordInput.value = ''
    
    await cargarMochila(mochilaPassword.value)
    await cargarObjetosDisponibles()
    showEditModal.value = false
  } catch (err) {
    showToast(err.message, 'error')
  } finally {
    loadingEdit.value = false
  }
}

const executeDeleteObjeto = async () => {
  loadingDeleteObjeto.value = true
  try {
    const body = {}
    // Usar contraseña del objeto (la que se usó para abrir el modal)
    if (objetoPasswordInput.value) {
      body.editPassword = objetoPasswordInput.value
    }
    
    await fetchData(`/objetos/${editForm.value.id}`, {
      method: 'DELETE',
      body: JSON.stringify(body)
    })
    
    showToast('Objeto eliminado permanentemente')
    showEditModal.value = false
    showDeleteObjetoConfirm.value = false
    objetoPasswordInput.value = ''
    await cargarMochila(mochilaPassword.value)
    await cargarObjetosDisponibles()
  } catch (err) {
    showToast(err.message || 'Error al eliminar objeto', 'error')
  } finally {
    loadingDeleteObjeto.value = false
  }
}

const handleFileUpload = (event) => {
  imagenFile.value = event.target.files[0]
}

// Computed para saber si los campos de edición están bloqueados
const camposBloqueados = computed(() => {
  // Si la mochila tiene contraseña de edición Y no se ha introducido contraseña
  return mochila.value.tiene_edit_password && !editPasswordMochila.value
})

const updatePeso = async (id) => {
  const value = pesosLocales.value[id]
  try {
    await updateLocalChange(mochila.value.id, id, 'peso', value, editPasswordMochila.value)
  } catch (err) {
    if (err.message?.includes('Contraseña') || err.message?.includes('contraseña')) {
      showToast('Contraseña de edición requerida', 'error')
      // Revertir el cambio visual al valor original
      const obj = objetos.value.find(o => o.id === id)
      if (obj) {
        pesosLocales.value[id] = obj.peso_gr
      }
    }
  }
}

const updatePrecio = async (id) => {
  const value = preciosLocales.value[id]
  try {
    await updateLocalChange(mochila.value.id, id, 'precio', value, editPasswordMochila.value)
  } catch (err) {
    if (err.message?.includes('Contraseña') || err.message?.includes('contraseña')) {
      showToast('Contraseña de edición requerida', 'error')
      // Revertir el cambio visual al valor original
      const obj = objetos.value.find(o => o.id === id)
      if (obj) {
        preciosLocales.value[id] = obj.precio
      }
    }
  }
}

const updateCantidad = async (id) => {
  const value = cantidadesLocales.value[id]
  try {
    await updateLocalChange(mochila.value.id, id, 'cantidad', value, editPasswordMochila.value)
  } catch (err) {
    if (err.message?.includes('Contraseña') || err.message?.includes('contraseña')) {
      showToast('Contraseña de edición requerida', 'error')
      // Revertir el cambio visual al valor original
      const obj = objetos.value.find(o => o.id === id)
      if (obj) {
        cantidadesLocales.value[id] = obj.cantidad
      }
    }
  }
}

const calcularPesoGrupo = (grupo) => {
  return grupo.objetos.reduce((total, obj) => {
    // Usar valor local si existe, sino el del backend
    const peso = pesosLocales.value[obj.id] !== undefined ? pesosLocales.value[obj.id] : obj.peso_gr
    const cantidad = cantidadesLocales.value[obj.id] !== undefined ? cantidadesLocales.value[obj.id] : obj.cantidad
    return total + (peso * cantidad)
  }, 0)
}

const calcularPrecioGrupo = (grupo) => {
  return grupo.objetos.reduce((total, obj) => {
    // Usar valor local si existe, sino el del backend
    const precio = preciosLocales.value[obj.id] !== undefined ? preciosLocales.value[obj.id] : obj.precio
    const cantidad = cantidadesLocales.value[obj.id] !== undefined ? cantidadesLocales.value[obj.id] : obj.cantidad
    return total + (precio * cantidad)
  }, 0)
}

const clearAllChangesHandler = async () => {
  try {
    await clearAllChanges(mochila.value.id, editPasswordMochila.value)
    showToast('Cambios eliminados')
    await cargarMochila()
  } catch (err) {
    if (err.message?.includes('Contraseña') || err.message?.includes('contraseña')) {
      showToast('Se requiere contraseña de edición', 'error')
    } else {
      showToast('Error al eliminar cambios', 'error')
    }
  }
}

const showToast = (message, type = 'success') => {
  toast.value = { message, type }
  setTimeout(() => {
    toast.value = { message: '', type: 'success' }
  }, 3000)
}

// Funciones para editar/eliminar mochila
const openEditMochilaModal = () => {
  editMochilaForm.value = {
    nombre: mochila.value.nombre,
    descripcion: mochila.value.descripcion || '',
    isPrivate: mochila.value.is_private || false
  }
  showDeleteConfirm.value = false
  showEditMochilaModal.value = true
}

const saveMochilaChanges = async () => {
  loadingEditMochila.value = true
  try {
    const body = {
      nombre: editMochilaForm.value.nombre,
      descripcion: editMochilaForm.value.descripcion,
      isPrivate: editMochilaForm.value.isPrivate
    }
    
    // Enviar contraseña si la mochila la tiene
    if (mochila.value.tiene_edit_password) {
      body.editPassword = editPasswordMochila.value
    }
    
    await fetchData(`/mochilas/${mochila.value.id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    })
    
    showToast('Mochila actualizada')
    showEditMochilaModal.value = false
    
    // Recargar mochila para reflejar cambios
    await cargarMochila(mochila.value.is_private ? editPasswordMochila.value : null)
  } catch (err) {
    showToast(err.message || 'Error al actualizar mochila', 'error')
  } finally {
    loadingEditMochila.value = false
  }
}

const executeDelete = async () => {
  loadingDelete.value = true
  try {
    const body = {}
    if (mochila.value.tiene_edit_password) {
      body.editPassword = editPasswordMochila.value
    }
    
    await fetchData(`/mochilas/${mochila.value.id}`, {
      method: 'DELETE',
      body: JSON.stringify(body)
    })
    
    showToast('Mochila eliminada')
    showEditMochilaModal.value = false
    
    // Redirigir a home
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } catch (err) {
    showToast(err.message || 'Error al eliminar mochila', 'error')
  } finally {
    loadingDelete.value = false
  }
}

const executeClone = async () => {
  loadingClone.value = true
  try {
    const body = {}
    
    // newEditPassword:
    // - null cuando el campo está vacío → sin contraseña, pública
    // - string con valor → nueva contraseña
    body.newEditPassword = clonePassword.value || null
    
    const nuevaMochila = await fetchData(`/mochilas/${mochila.value.id}/clone`, {
      method: 'POST',
      body: JSON.stringify(body)
    })
    
    showEditMochilaModal.value = false
    showCloneForm.value = false
    clonePassword.value = ''
    
    // Redirigir a la nueva mochila clonada
    router.push(`/m/${nuevaMochila.codigo}`)
  } catch (err) {
    showToast(err.message || 'Error al clonar mochila', 'error')
  } finally {
    loadingClone.value = false
  }
}

// Watch
watch(showAddModal, (val) => {
  if (val) cargarObjetosDisponibles()
})

// Recargar datos cuando cambia el código de la mochila en la URL
watch(() => route.params.codigo, (newCodigo, oldCodigo) => {
  if (newCodigo && newCodigo !== oldCodigo) {
    // Resetear estados
    editPasswordMochila.value = ''
    showPasswordModal.value = false
    showEditMochilaModal.value = false
    showCloneForm.value = false
    clonePassword.value = ''
    // Volver arriba
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Cargar nueva mochila
    cargarMochila()
  }
})

// Init
onMounted(() => {
  cargarMochila()
})
</script>
