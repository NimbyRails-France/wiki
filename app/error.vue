<script setup lang="ts">
defineProps<{ error: { statusCode?: number; message?: string } }>()
</script>
<template>
  <div class="error-page">
    <img src="/favicon.svg" width="48" height="48" alt="" />
    <p class="eyebrow">WIKI NIMBYRAILS FRANCE</p>
    <h1>
      {{
        error.statusCode === 404
          ? 'Cette voie ne mène nulle part.'
          : 'La page n’a pas pu être chargée.'
      }}
    </h1>
    <p>
      {{
        error.statusCode === 404
          ? 'La page demandée n’existe pas ou a changé d’adresse.'
          : 'Revenez à l’accueil pour reprendre votre lecture.'
      }}
    </p>
    <a href="/" class="button primary">Retour au wiki →</a>
  </div>
</template>
