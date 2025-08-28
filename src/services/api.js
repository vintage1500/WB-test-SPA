// src/services/api.js
import axios from 'axios'

const KEY = import.meta.env.VITE_API_KEY || ''

// Берём базу из env ТОЛЬКО для локалки. В проде (https) используем относительный путь.
const RAW_BASE = (import.meta.env.VITE_API_BASE || '').trim()

// Если страница под HTTPS (Netlify, кастомный домен и т.д.) — используем ОТНОСИТЕЛЬНЫЙ путь,
// чтобы идти через Netlify-прокси и не ловить mixed content/SSL.
const isHttpsPage =
  typeof window !== 'undefined' && window.location?.protocol === 'https:'

// '' → относительные запросы (/api/...), Netlify дальше проксирует на http://109.73.206.144:6969
const API_BASE = isHttpsPage ? '' : RAW_BASE.replace(/\/$/, '')

const client = axios.create({
  baseURL: API_BASE,
  timeout: 20000
})

// --- helpers ---
function fmtYMD(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function ensureDates(endpoint, params = {}) {
  const p = { ...params }
  const today = new Date()
  if (endpoint === 'stocks') {
    if (!p.dateFrom || String(p.dateFrom).trim() === '') p.dateFrom = fmtYMD(today)
  } else {
    const from = new Date()
    from.setDate(today.getDate() - 7)
    if (!p.dateFrom || String(p.dateFrom).trim() === '') p.dateFrom = fmtYMD(from)
    if (!p.dateTo   || String(p.dateTo).trim()   === '') p.dateTo   = fmtYMD(today)
  }
  return p
}

function commonParams(raw = {}) {
  const p = {
    key: KEY,
    page: Number.isFinite(raw.page) ? raw.page : 1,
    limit: Number.isFinite(raw.limit) ? raw.limit : 500
  }
  if (raw.dateFrom && String(raw.dateFrom).trim() !== '') p.dateFrom = raw.dateFrom
  if (raw.dateTo   && String(raw.dateTo).trim()   !== '') p.dateTo   = raw.dateTo
  return p
}

export async function fetchEndpoint(endpoint, params = {}) {
  const withDates = ensureDates(endpoint, params)
  const query = commonParams(withDates)
  const url = `/api/${endpoint}` // ← ОБЯЗАТЕЛЬНО относительный путь

  console.debug('GET', (API_BASE || '') + url, query)

  try {
    const { data } = await client.get(url, { params: query })
    const items = Array.isArray(data) ? data : (data?.data || data?.items || data?.rows || [])
    const meta = data?.meta ? data.meta : {
      current_page: query.page,
      last_page: query.page,
      total: Array.isArray(items) ? items.length : 0
    }
    return { items: Array.isArray(items) ? items : [], meta }
  } catch (e) {
    console.error('API error:', e?.response?.status, e?.response?.data || e.message)
    throw e
  }
}
