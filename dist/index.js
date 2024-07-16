"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue3_1 = require("./vue3");
const path_1 = __importDefault(require("path"));
const result = (0, vue3_1.analysisVue3)(path_1.default.resolve(process.cwd(), '__test__/demo-comp2/index.vue'));
console.log(JSON.stringify(result));
//# sourceMappingURL=index.js.map