<template>
  <div class="row card" style="align-items:center; justify-content:center;">
    <button class="btn" :disabled="page<=1" @click="$emit('update:page', page-1)">◀</button>
    <span style="padding:0 12px;">Стр. {{ page }} из {{ lastPage }}</span>
    <button class="btn" :disabled="page>=lastPage" @click="$emit('update:page', page+1)">▶</button>
  </div>
</template>
<script setup>
defineProps({ page: Number, lastPage: Number })
defineEmits(['update:page'])
</script>
