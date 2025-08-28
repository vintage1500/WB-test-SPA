<template>
  <div class="card">
    <div class="row" style="gap:8px;">
      <label>dateFrom <input class="input" type="date" v-model="local.dateFrom" /></label>
      <label>dateTo <input class="input" type="date" v-model="local.dateTo" /></label>

      <label>Глобальный фильтр
        <input class="input" placeholder="поиск..." v-model="local.q" />
      </label>

      <button class="btn primary" @click="$emit('apply', local)">Применить</button>
      <button class="btn" @click="reset">Сброс</button>
      <div class="spacer"></div>
      <slot />
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue','apply','reset'])

const local = reactive({ dateFrom: '', dateTo: '', q: '' })
if (props.modelValue) Object.assign(local, props.modelValue)

function reset() {
  local.dateFrom = ''
  local.dateTo = ''
  local.q = ''
  emit('reset')
}
</script>
