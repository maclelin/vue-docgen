"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = exports.analysisVue = void 0;
const compiler_sfc_1 = require("@vue/compiler-sfc");
const fs_1 = __importDefault(require("fs"));
const parser = __importStar(require("@babel/parser"));
const get_props_info_1 = require("./get-props-info");
const analysisVue = (filePath) => {
    // 读取.vue文件
    const componentSource = fs_1.default.readFileSync(filePath, 'utf-8');
    // 解析.vue文件
    const { descriptor } = (0, compiler_sfc_1.parse)(componentSource);
    const result = (0, compiler_sfc_1.compileScript)(descriptor, {
        id: 'test',
    });
    if (descriptor.scriptSetup) {
        // 如果使用了<script setup>，需要使用compileScriptSetupDescriptor方法
        const scriptSetupContent = descriptor.scriptSetup.content;
        const ast = parser.parse(scriptSetupContent, {
            sourceType: 'module', // 设置sourceType为"module"
            plugins: ['jsx', 'typescript'],
        });
        // const importTypes = getImportType(ast, filePath);
        const props = (0, get_props_info_1.getPropsForSetup)(ast, filePath);
        return {
            props,
        };
    }
    else if (descriptor.script) {
        const ast = parser.parse(result.content, {
            sourceType: 'module', // 设置sourceType为"module"
            plugins: ['jsx', 'typescript'],
        });
        // const importTypes = getImportType(ast, filePath);
        // 如果使用了常规的<script>，可以直接获取内容
        const props = (0, get_props_info_1.getProps)(ast, filePath);
        return {
            props,
        };
        // 你需要使用一些JavaScript解析器（如Babel）来解析scriptContent并获取props
    }
    else {
        console.log('未找到<script>或<script setup>块');
    }
};
exports.analysisVue = analysisVue;
const test = () => { };
exports.test = test;
//# sourceMappingURL=index.js.map