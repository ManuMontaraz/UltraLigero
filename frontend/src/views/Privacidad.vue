<template>
  <div class="min-h-screen bg-bg text-white">
    <main class="container-custom py-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-white mb-2">
          Privacidad y Legal
        </h1>
        <p class="text-gray-400">
          Información sobre el tratamiento de datos en {{ appName }}
        </p>
      </div>

      <div class="max-w-2xl mx-auto space-y-8">
        <!-- Responsable -->
        <section class="card">
          <h2 class="text-xl font-semibold text-white mb-4">
            Responsable del sitio
          </h2>
          <p class="text-gray-300 leading-relaxed">
            <a
              :href="authorWeb"
              target="_blank"
              class="text-accent hover:underline"
            >
              {{ authorName }}
            </a>
            <br>
            Email: 
            <a 
              :href="`mailto:${authorEmail}`" 
              class="text-accent hover:underline"
            >
              {{ authorEmail }}
            </a>
          </p>
        </section>

        <!-- Datos recogidos -->
        <section class="card">
          <h2 class="text-xl font-semibold text-white mb-4">
            Datos que recogemos
          </h2>
          <p class="text-gray-300 leading-relaxed mb-4">
            <strong class="text-white">No recogemos ni almacenamos datos personales.</strong>
            No existen cuentas de usuario, ni formularios de registro, ni sistema de login.
          </p>
          <p class="text-gray-300 leading-relaxed mb-4">
            Lo único que guardamos es el contenido público que tú decides crear:
          </p>
          <ul class="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>Mochilas (nombre, descripción, código público)</li>
            <li>Objetos (nombre, peso, precio, categoría)</li>
            <li>Imágenes que subas de los objetos</li>
          </ul>
          <p class="text-gray-300 leading-relaxed mt-4">
            Todo este contenido es <strong class="text-white">público por diseño</strong>.
            Cualquiera con el enlace puede verlo. No uses la plataforma para información sensible.
          </p>
        </section>

        <!-- No cookies, no tracking -->
        <section class="card">
          <h2 class="text-xl font-semibold text-white mb-4">
            Cookies y rastreo
          </h2>
          <p class="text-gray-300 leading-relaxed">
            <strong class="text-white">No utilizamos cookies</strong> de ningún tipo.
            No usamos Google Analytics, ni Facebook Pixel, ni ningún sistema de rastreo de terceros.
            No perfilamos a los visitantes.
          </p>
        </section>

        <!-- No IPs -->
        <section class="card">
          <h2 class="text-xl font-semibold text-white mb-4">
            Direcciones IP
          </h2>
          <p class="text-gray-300 leading-relaxed">
            No recogemos ni almacenamos direcciones IP. Nuestro servidor no guarda logs de acceso
            con información identificable.
          </p>
        </section>

        <!-- Derechos -->
        <section class="card">
          <h2 class="text-xl font-semibold text-white mb-4">
            Tus derechos
          </h2>
          <p class="text-gray-300 leading-relaxed">
            Puedes eliminar cualquier mochila u objeto que hayas creado en cualquier momento.
            Si tienes alguna duda o quieres que eliminemos contenido de forma manual, escríbenos a
            <a :href="`mailto:${authorEmail}`" class="text-accent hover:underline">{{ authorEmail }}</a>.
          </p>
        </section>

        <!-- Código abierto -->
        <section class="card">
          <h2 class="text-xl font-semibold text-white mb-4">
            Código abierto
          </h2>
          <p class="text-gray-300 leading-relaxed">
            {{ appName }} es software libre. Puedes consultar, auditar o contribuir al código fuente en
            <a 
              :href="githubUrl" 
              target="_blank" 
              class="text-accent hover:underline"
            >
              GitHub
            </a>.
          </p>
        </section>

        <!-- Licencia -->
        <section class="card">
          <h2 class="text-xl font-semibold text-white mb-4">
            Licencia
          </h2>
          <p class="text-gray-300 leading-relaxed">
            Este proyecto está licenciado bajo
            <a 
              href="https://www.gnu.org/licenses/agpl-3.0.html" 
              target="_blank" 
              class="text-accent hover:underline"
            >
              AGPL-3.0
            </a>.
          </p>
        </section>
      </div>

      <!-- Volver -->
      <div class="text-center mt-12">
        <router-link to="/" class="btn btn-primary">
          Volver al inicio
        </router-link>
      </div>
    </main>

  </div>
</template>

<script setup>

const appName = import.meta.env.VITE_APP_NAME || 'LeafPack'
const authorName = import.meta.env.VITE_AUTHOR_NAME || 'Manuel Arjona Blanco'
const authorEmail = import.meta.env.VITE_AUTHOR_EMAIL || 'contacto@manumontaraz.es'
const authorWeb = import.meta.env.VITE_AUTHOR_WEB || 'https://manumontaraz.es'
const githubUrl = import.meta.env.VITE_GITHUB_URL || 'https://github.com/ManuMontaraz/ultraligero'
</script>
