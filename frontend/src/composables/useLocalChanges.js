import { ref, computed } from 'vue'

/**
 * Composable para manejar cambios locales persistidos en base de datos
 * Los valores ya vienen aplicados desde el backend (cantidad, peso, precio)
 * Este composable mantiene estado local temporal y sincroniza con BD
 * 
 * Uso: const { updateLocalChange, clearAllChanges } = useLocalChanges(fetchData)
 */
export function useLocalChanges(fetchDataFn) {
  // Estado de cambios locales (temporal hasta guardar en BD)
  const localChanges = ref({})
  const pendingSaves = ref({})

  /**
   * Guarda un cambio local en la base de datos (autoguardado)
   * @param {number} mochilaId - ID de la mochila
   * @param {number} objetoId - ID del objeto
   * @param {string} field - Campo a cambiar ('cantidad', 'peso', 'precio')
   * @param {any} value - Nuevo valor
   * @param {string} editPassword - Contraseña de edición (opcional)
   */
  const updateLocalChange = async (mochilaId, objetoId, field, value, editPassword = null) => {
    // Actualizar estado local inmediatamente
    if (!localChanges.value[objetoId]) {
      localChanges.value[objetoId] = {}
    }

    if (value === null || value === undefined || value === '' || value === 0) {
      delete localChanges.value[objetoId][field]
      if (Object.keys(localChanges.value[objetoId]).length === 0) {
        delete localChanges.value[objetoId]
      }
    } else {
      if (field === 'precio') {
        localChanges.value[objetoId][field] = parseFloat(value)
      } else {
        localChanges.value[objetoId][field] = parseInt(value)
      }
    }

    // Preparar datos para el backend
    const cambioParaBD = field === 'cantidad' ? { cantidad_local: value || null }
                      : field === 'peso' ? { peso_local: value || null }
                      : field === 'precio' ? { precio_local: value || null }
                      : {}

    // Añadir contraseña si se proporcionó
    if (editPassword) {
      cambioParaBD.editPassword = editPassword
    }

    // Debounce: cancelar guardado anterior para este objeto
    if (pendingSaves.value[objetoId]) {
      clearTimeout(pendingSaves.value[objetoId])
    }

    // Guardar en BD después de 500ms de inactividad
    pendingSaves.value[objetoId] = setTimeout(async () => {
      try {
        await fetchDataFn(`/mochilas/${mochilaId}/objetos/${objetoId}/locales`, {
          method: 'PUT',
          body: JSON.stringify(cambioParaBD)
        })
        delete pendingSaves.value[objetoId]
      } catch (err) {
        console.error('Error guardando cambio local:', err)
        // Propagar el error para que el componente lo maneje
        throw err
      }
    }, 500)
  }

  /**
   * Obtiene el valor de un campo
   * Nota: Ahora los valores ya vienen aplicados desde el backend,
   * pero mantenemos esta función por compatibilidad
   */
  const getEffectiveValue = (itemId, field, baseValue) => {
    // Los valores de BD ya incluyen los cambios locales aplicados
    // Esta función es principalmente para compatibilidad
    return baseValue
  }

  /**
   * Verifica si un campo tiene cambio local pendiente
   */
  const hasLocalChange = (itemId, field) => {
    return localChanges.value[itemId] && localChanges.value[itemId][field] !== undefined
  }

  /**
   * Limpia todos los cambios locales de una mochila (tanto en BD como en estado)
   * @param {number} mochilaId - ID de la mochila
   * @param {string} editPassword - Contraseña de edición (opcional)
   */
  const clearAllChanges = async (mochilaId, editPassword = null) => {
    try {
      // Cancelar todos los guardados pendientes
      Object.keys(pendingSaves.value).forEach(key => {
        clearTimeout(pendingSaves.value[key])
      })
      pendingSaves.value = {}
      
      // Preparar body con contraseña si se proporcionó
      const body = {}
      if (editPassword) {
        body.editPassword = editPassword
      }
      
      // Limpiar en base de datos
      await fetchDataFn(`/mochilas/${mochilaId}/locales`, {
        method: 'DELETE',
        body: JSON.stringify(body)
      })
      
      // Limpiar estado local
      localChanges.value = {}
      
      return true
    } catch (err) {
      console.error('Error limpiando cambios locales:', err)
      throw err
    }
  }

  /**
   * Inicializa los cambios locales desde los datos cargados
   * (los objetos ya vienen con valores aplicados desde BD)
   */
  const initializeFromLoadedData = (objetos) => {
    // Los objetos ya vienen con los valores locales aplicados
    // Podemos usar esto para marcar cuáles tienen cambios
    localChanges.value = {}
    objetos.forEach(obj => {
      if (obj.tiene_cambios_locales) {
        localChanges.value[obj.id] = {}
        if (obj.cantidad_local !== null && obj.cantidad_local !== undefined) {
          localChanges.value[obj.id].cantidad = obj.cantidad_local
        }
        if (obj.peso_local !== null && obj.peso_local !== undefined) {
          localChanges.value[obj.id].peso = obj.peso_local
        }
        if (obj.precio_local !== null && obj.precio_local !== undefined) {
          localChanges.value[obj.id].precio = obj.precio_local
        }
      }
    })
  }

  return {
    localChanges: computed(() => localChanges.value),
    updateLocalChange,
    getEffectiveValue,
    hasLocalChange,
    clearAllChanges,
    initializeFromLoadedData
  }
}
