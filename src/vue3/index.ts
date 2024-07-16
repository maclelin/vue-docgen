import { parse as compileParse, compileScript } from '@vue/compiler-sfc';
import fs from 'fs';
import * as parser from '@babel/parser';
import { getProps } from './get-props-info';



export const analysisVue3 = (filePath: string) => {
  // 读取.vue文件
  const componentSource = fs.readFileSync(filePath, 'utf-8');

  // 解析.vue文件
  const { descriptor } = compileParse(componentSource);
  const result = compileScript(descriptor, {
    id: 'test',
  });
  const ast = parser.parse(result.content, {
    sourceType: 'module', // 设置sourceType为"module"
    plugins: ['jsx', 'typescript'],
  });
  if (descriptor.scriptSetup) {
    // 如果使用了<script setup>，需要使用compileScriptSetupDescriptor方法
    // const script = compilerSfc.compileScriptSetupDescriptor(descriptor);
    // console.log(script.bindings.props); // 输出props
  } else if (descriptor.script) {
    // 如果使用了常规的<script>，可以直接获取内容
    const props = getProps(ast);
    return {
      props,
    }
    // 你需要使用一些JavaScript解析器（如Babel）来解析scriptContent并获取props
  } else {
    console.log('未找到<script>或<script setup>块');
  }
};

