"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const index_js_1 = require("./index.js");
const result = (0, index_js_1.analysisVue)(path_1.default.resolve(process.cwd(), '__test__/demo-comp3/index.vue'));
console.log(JSON.stringify(result));
//# sourceMappingURL=example.js.map