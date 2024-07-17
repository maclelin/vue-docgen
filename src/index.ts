import { analysisVue } from "./vue3";
import path from 'path';


const result = analysisVue(path.resolve(process.cwd(), '__test__/demo-comp3/index.vue'));
console.log(JSON.stringify(result));
// export default {
//   analysisVue,
// };
