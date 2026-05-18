<template>
  <footer class="mt-auto py-6 text-center">
    <div class="text-gray-400 text-xs space-y-1">
      <p>
        Licenciado bajo
        <a
          href="https://www.gnu.org/licenses/agpl-3.0.html"
          target="_blank"
          class="text-gray-400 hover:text-accent transition-colors"
        >
          AGPL-3.0
        </a>
        ·
        <a
          :href="githubUrl"
          target="_blank"
          class="text-gray-400 hover:text-accent transition-colors"
        >
          Código fuente en GitHub
        </a>
        ·
        <router-link
          to="/privacidad"
          class="text-gray-400 hover:text-accent transition-colors"
        >
          Privacidad
        </router-link>
      </p>
      <p class="text-gray-500">
        Hecho con ❤️ por
        <a
          :href="authorWeb"
          target="_blank"
          class="text-gray-400 hover:text-accent transition-colors"
        >
          {{ authorName }}
        </a>
      </p>
    </div>
  </footer>
</template>

<script setup>
const authorName = import.meta.env.VITE_AUTHOR_NAME || 'Manuel Arjona Blanco'
const authorWeb = import.meta.env.VITE_AUTHOR_WEB || 'https://manumontaraz.es'
const githubUrl = import.meta.env.VITE_GITHUB_URL || 'https://github.com/ManuMontaraz/ultraligero'
</script>
