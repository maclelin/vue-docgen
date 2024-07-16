<!-- MyComponent.vue -->
<template>
  <div>
    <h1>{{ props.title }}</h1>
    <p>{{ props.content }}</p>
  </div>
</template>

<script setup lang="ts">
import { defineProps  } from 'vue';
const props = defineProps({
  title: {
    type: String,
    default: '默认标题'
  },
  content: {
    type: String,
    default: '默认内容'
  }
});
</script>
  