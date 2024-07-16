import { analysisVue3 } from "./vue3";
import path from 'path';


const result = analysisVue3(path.resolve(process.cwd(), '__test__/demo-comp2/index.vue'));
console.log(JSON.stringify(result));
