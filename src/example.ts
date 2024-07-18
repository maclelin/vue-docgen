import path from 'path';
import { analysisVue } from './index.js';


const result = analysisVue(path.resolve(process.cwd(), '__test__/demo-comp3/index.vue'));
console.log(JSON.stringify(result));