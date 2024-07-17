import { parse as compileParse, compileScript } from '@vue/compiler-sfc';
import fs from 'fs';
import * as parser from '@babel/parser';
import { getProps, getPropsForSetup } from './get-props-info';



export const analysisVue = (filePath: string) => {
  // 读取.vue文件
  const componentSource = fs.readFileSync(filePath, 'utf-8');

  // 解析.vue文件
  const { descriptor } = compileParse(componentSource);
  const result = compileScript(descriptor, {
    id: 'test',
  });

  if (descriptor.scriptSetup) {
    // 如果使用了<script setup>，需要使用compileScriptSetupDescriptor方法
    const scriptSetupContent = descriptor.scriptSetup.content;
    const ast = parser.parse(scriptSetupContent, {
      sourceType: 'module', // 设置sourceType为"module"
      plugins: ['jsx', 'typescript'],
    });
    const props = getPropsForSetup(ast);
    return {
      props,
    };
  } else if (descriptor.script) {
    const ast = parser.parse(result.content, {
      sourceType: 'module', // 设置sourceType为"module"
      plugins: ['jsx', 'typescript'],
    });
    // 如果使用了常规的<script>，可以直接获取内容
    const props = getProps(ast);
    return {
      props,
    };
    // 你需要使用一些JavaScript解析器（如Babel）来解析scriptContent并获取props
  } else {
    console.log('未找到<script>或<script setup>块');
  }
};

export const test = () => {};
