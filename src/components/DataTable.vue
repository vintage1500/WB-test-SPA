<template>
  <div class="card">
    <div class="row" style="justify-content: space-between;">
      <h3 style="margin:0;">Таблица</h3>
      <div class="row">
        <label>Поле сортировки
          <select v-model="sortKey">
            <option v-for="c in columns" :key="c" :value="c">{{ c }}</option>
          </select>
        </label>
        <label>
          <select v-model="sortDir">
            <option value="asc">asc</option>
            <option value="desc">desc</option>
          </select>
        </label>
      </div>
    </div>
    <div style="overflow:auto;">
      <table v-if="items.length">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in sortedItems" :key="i">
            <td v-for="col in columns" :key="col">{{ formatCell(row[col]) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="muted">Нет данных</div>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
const props = defineProps({ items: { type: Array, default: () => [] } })
const sortKey = ref('')
const sortDir = ref('asc')
const columns = computed(() => props.items.length ? Object.keys(props.items[0]) : [])
watch(columns, (cols) => { if (cols.length && !sortKey.value) sortKey.value = cols[0] }, { immediate: true })
const sortedItems = computed(() => {
  const arr = [...props.items]
  const key = sortKey.value
  if (!key) return arr
  arr.sort((a, b) => {
    const va = a?.[key]; const vb = b?.[key]
    const na = Number(va); const nb = Number(vb)
    let cmp
    if (!isNaN(na) && !isNaN(nb)) cmp = na - nb
    else cmp = String(va ?? '').localeCompare(String(vb ?? ''))
    return sortDir.value === 'asc' ? cmp : -cmp
  })
  return arr
})
function formatCell(v) {
  if (v == null) return ''
  if (typeof v === 'number') return v.toLocaleString('ru-RU')
  return String(v)
}
</script>
