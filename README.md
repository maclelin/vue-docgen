# Vue doc gen
    Analysis Vue Component and get component props, finally, it outputs the type、default value、comment about every prop.

## For Example1
1. Vue component
```
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

<!-- run by this repository -->
import path from 'path';
import { analysisVue } from './index.js';


const result = analysisVue(path.resolve(process.cwd(), '__test__/demo-comp/index.vue'));
console.log(JSON.stringify(result));

<!-- output result -->
{
  "props": {
    "title": {
      "tsType": {
        "title": "String"
      },
      "defaultValue": "默认标题"
    },
    "content": {
      "tsType": {
        "content": "String"
      },
      "description": "*这个一个内容字段",
      "defaultValue": "默认内容"
    }
  }
}
```
## For Example2
1. Vue component by setup type
```
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
  

<!-- run by this repository -->
import path from 'path';
import { analysisVue } from './index.js';


const result = analysisVue(path.resolve(process.cwd(), '__test__/demo-comp2/index.vue'));
console.log(JSON.stringify(result));

<!-- output result -->
{
  "props": {
    "title": {
      "tsType": {
        "title": "String"
      },
      "defaultValue": "默认标题"
    },
    "content": {
      "tsType": {
        "content": "String"
      },
      "defaultValue": "默认内容"
    }
  }
}
```

## For Example3
1. Vue component includes typescript decleration 
```
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


<!-- typescript decleration -->
export interface Person {
  name: string;
  age: string;
};
export type Student = {
  name: string,
  gender: string,
  score: number,
};


  

<!-- run by this repository -->
import path from 'path';
import { analysisVue } from './index.js';


const result = analysisVue(path.resolve(process.cwd(), '__test__/demo-comp3/index.vue'));
console.log(JSON.stringify(result));

<!-- output result -->
{
  "props": {
    "title": {
      "tsType": {
        "title": "String"
      },
      "defaultValue": "默认标题"
    },
    "content": {
      "tsType": {
        "content": "String"
      },
      "defaultValue": "默认内容"
    },
    "studentObj": {
      "tsType": {
        "studentObj": {
          "name": "string",
          "gender": "string",
          "score": "number"
        }
      },
      "defaultValue": {
        "name": "linjian",
        "score": 1,
        "gender": "boy"
      }
    },
    "studentObj2": {
      "tsType": {
        "studentObj2": {
          "a": "string",
          "b": "string",
          "c": "Object",
          "d": "string[]"
        }
      },
      "defaultValue": {
        "a": "test",
        "b": "test1"
      }
    },
    "studentObj3": {
      "tsType": {
        "studentObj3": {
          "name": "string",
          "age": "number"
        }
      },
      "defaultValue": [
        
      ]
    }
  }
}
```