<!-- MyComponent.vue -->
<template>
  <div>
    <h1>{{ props.title }}</h1>
    <p>{{ props.content }}</p>
  </div>
</template>

<script setup lang="ts">
import { defineProps, Proptype, } from 'vue';
import { Student } from './test';
type TempType = {
  a: string,
  b: string,
  c: Object,
  d: string[],
};
interface TempType2 {
  name: string,
  age: number,
}
const props = defineProps({
  title: {
    type: String,
    default: '默认标题'
  },
  content: {
    type: String,
    default: '默认内容'
  },
  studentObj: {
    type: Object as Proptype<Student>,
    default: () => ({name: 'linjian', score: 1, gender: 'boy'}),
  },
  studentObj2: {
    type: Object as Proptype<TempType>,
    default: {a: 'test', b: 'test1'},
  },
  studentObj3: {
    type: Array as Proptype<TempType2[]>,
    default: [],
  },
});
</script>
  