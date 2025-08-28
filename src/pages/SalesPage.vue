<template>
  <div class="container">
    <h2 style="margin:8px 0 12px;">Sales</h2>

    <div class="grid">
      <ChartCard :items="filteredItems" />

      <div class="card">
        <div class="row" style="gap:8px; align-items:center;">
          <div><strong>Сервер:</strong> page {{ serverPage }} · limit {{ serverLimit }}</div>
          <div><strong>Загружено:</strong> {{ rawCount }}</div>
          <div><strong>Отфильтровано:</strong> {{ filteredItems.length }}</div>
          <div><strong>Показано (UI):</strong> {{ pagedItems.length }}/50</div>
          <div class="spacer"></div>

          <label>Limit (server)
            <select class="input" v-model.number="serverLimit">
              <option :value="100">100</option>
              <option :value="200">200</option>
              <option :value="500">500</option>
            </select>
          </label>

          <button class="btn" :disabled="serverPage<=1 || loading" @click="serverPrev">⬅ Серверная стр.</button>
          <button class="btn" :disabled="loading" @click="serverNext">Серверная стр. ➡</button>

          <button class="btn secondary" :disabled="loading" @click="reloadServer">
            {{ loading ? 'Загрузка…' : 'Обновить (server)' }}
          </button>
        </div>

        <div v-if="error" style="margin-top:8px; color:#ffb4b4;">Ошибка: {{ error }}</div>
        <div v-else-if="!loading && !items.length" class="muted" style="margin-top:8px;">
          Данных нет за выбранный период — увеличь диапазон дат.
        </div>
      </div>
    </div>

    <FiltersBar v-model="filters" @apply="applyFilters" @reset="resetFilters">
      <label>Поле фильтра
        <select v-model="fieldFilterKey">
          <option value="">—</option>
          <option v-for="c in columns" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
      <input class="input" v-model="fieldFilterValue" placeholder="значение…" />
    </FiltersBar>

    <DataTable :items="pagedItems" />
    <Paginator :page="uiPage" :lastPage="lastPage" @update:page="changePage" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { fetchEndpoint } from '../services/api'
import DataTable from '../components/DataTable.vue'
import Paginator from '../components/Paginator.vue'
import FiltersBar from '../components/FiltersBar.vue'
import ChartCard from '../components/ChartCard.vue'

const endpoint = 'sales'
const UI_PAGE_SIZE = 50

const serverPage = ref(1)
const serverLimit = ref(500)

const items = ref([])
const rawCount = computed(() => items.value.length)

const filters = reactive({ dateFrom: '', dateTo: '', q: '' })
const fieldFilterKey = ref(''); const fieldFilterValue = ref('')

const columns = computed(() => items.value.length ? Object.keys(items.value[0]) : [])

const filteredItems = computed(() => {
  let arr = items.value
  if (filters.q) {
    const q = filters.q.toLowerCase()
    arr = arr.filter(row => Object.values(row).some(v => String(v ?? '').toLowerCase().includes(q)))
  }
  if (fieldFilterKey.value && fieldFilterValue.value) {
    const k = fieldFilterKey.value; const val = fieldFilterValue.value.toLowerCase()
    arr = arr.filter(r => String(r[k] ?? '').toLowerCase().includes(val))
  }
  return arr
})

const uiPage = ref(1)
const lastPage = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / UI_PAGE_SIZE)))
const pagedItems = computed(() => {
  const start = (uiPage.value - 1) * UI_PAGE_SIZE
  return filteredItems.value.slice(start, start + UI_PAGE_SIZE)
})
watch(filteredItems, () => { if (uiPage.value > lastPage.value) uiPage.value = 1 })

const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { items: list } = await fetchEndpoint(endpoint, {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      page: serverPage.value,
      limit: serverLimit.value
    })
    items.value = Array.isArray(list) ? list : []
    uiPage.value = 1
  } catch (e) {
    error.value = e?.response?.data?.message
      || (typeof e?.response?.data === 'string' ? e.response.data : '')
      || e.message
  } finally {
    loading.value = false
  }
}

function reloadServer() { uiPage.value = 1; load() }
function serverPrev() { if (serverPage.value > 1) { serverPage.value--; load() } }
function serverNext() { serverPage.value++; load() }

function applyFilters() { serverPage.value = 1; uiPage.value = 1; load() }
function resetFilters() {
  filters.dateFrom = ''; filters.dateTo = ''; filters.q = ''
  fieldFilterKey.value = ''; fieldFilterValue.value = ''
  serverPage.value = 1; uiPage.value = 1; load()
}
function changePage(p) { uiPage.value = p }

onMounted(load)
</script>
