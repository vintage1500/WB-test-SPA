<template>
  <div class="card">
    <div class="row" style="justify-content: space-between;">
      <h3 style="margin:0;">График</h3>
      <div class="row">
        <label>X
          <select v-model="xField">
            <option v-for="f in fields" :key="f" :value="f">{{ f }}</option>
          </select>
        </label>
        <label>Y
          <select v-model="yField">
            <option value="">— count —</option>
            <option v-for="f in numericFields" :key="f" :value="f">{{ f }}</option>
          </select>
        </label>
        <button class="btn" @click="regen">Построить</button>
      </div>
    </div>
    <BarChart v-if="chartData" :chartData="chartData" :options="chartOptions" />
    <div v-else class="muted">Выберите поля для графика</div>
  </div>
</template>

<script setup>
import { BarChart } from 'vue-chart-3'
import { Chart, registerables } from 'chart.js'
import { computed, ref, watch } from 'vue'

Chart.register(...registerables)

const props = defineProps({ items: { type: Array, default: () => [] } })
const fields = computed(() => props.items.length ? Object.keys(props.items[0]) : [])
const numericFields = computed(() => {
  if (!props.items.length) return []
  const keys = Object.keys(props.items[0])
  return keys.filter(k => props.items.some(r => typeof r[k] === 'number' || (!isNaN(Number(r[k])) && r[k] !== '')))
})
const dateLike = (v) => typeof v === 'string' && (/^\d{4}-\d{2}-\d{2}/.test(v) || /^\d{2}\.\d{2}\.\d{4}/.test(v))
const xField = ref(''); const yField = ref('')
watch(fields, (fs) => {
  if (fs.length) {
    const firstDate = fs.find(f => props.items.some(r => dateLike(r[f])))
    xField.value = firstDate || fs[0]
  }
}, { immediate: true })

const chartData = ref(null)
const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { autoSkip: true } } } }

function regen() {
  if (!props.items.length || !xField.value) { chartData.value = null; return }
  const map = new Map()
  for (const row of props.items) {
    const x = String(row[xField.value] ?? '—')
    const yv = yField.value ? Number(row[yField.value]) : 1
    const cur = map.get(x) || 0
    map.set(x, cur + (isNaN(yv) ? 0 : yv))
  }
  const labels = Array.from(map.keys())
  const data = Array.from(map.values())
  chartData.value = { labels, datasets: [{ label: yField.value || 'count', data }] }
}
watch(() => [props.items, xField.value, yField.value], regen, { deep: true })
</script>

<style scoped>
.card { min-height: 360px; }
</style>
