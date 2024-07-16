<!-- MyComponent.vue -->
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>{{ content }}</p>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '默认标题'
    },
    /**这个一个内容字段 */
    content: {
      type: String,
      default: '默认内容'
    }
  }
}
</script>
  