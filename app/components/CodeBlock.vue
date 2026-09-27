<script setup lang="ts">
import { highlight } from '~/utils/highlight'
const props = defineProps<{ code: string; title?: string; language?: string }>()
const highlighted = computed(() => highlight(props.code, props.language))
const message = ref('Copier')
let timer: ReturnType<typeof setTimeout> | undefined
async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    message.value = 'Copié !'
  } catch {
    message.value = 'Sélectionnez le code'
  }
  clearTimeout(timer)
  timer = setTimeout(() => {
    message.value = 'Copier'
  }, 2500)
}
onUnmounted(() => clearTimeout(timer))
</script>
<template>
  <div class="code-block">
    <div class="code-label">
      <span>{{ title || language || 'Kotlin' }}</span
      ><button type="button" @click="copy">{{ message }}</button>
    </div>
    <pre tabindex="0" :aria-label="title || 'Exemple de code'"><code v-html="highlighted" /></pre>
    <span class="sr-only" role="status">{{ message === 'Copier' ? '' : message }}</span>
  </div>
</template>
