import { getImportType } from "./get-import-type-module";

const { default: traverse } = require('@babel/traverse');

export const getDefaultVal = (node: any) => {
  let result = node.node.value || node.toString();
  if (node.type === 'ArrowFunctionExpression') {
    result = eval(`(${result})()`);
  } else if (node.isObjectExpression()) {
    result = {};
    node.get('properties').forEach((prop: any) => {
      result[prop.node.key.name] = prop.node.value.value;
    });
  } else if (node.isArrayExpression()) {
    result = node.node.elements.map((element: any) => element.value);
  }
  return result;
}

export const getType = (node: any, ast: any, vuePath: string) => {
  let propType = '';
  if (node) {
    propType = node.get('value').toString();
    // 复合类型
    if (typeof propType === 'string' && propType.includes('Object as Proptype<')) {
      const customPropType = node.node.value.typeAnnotation.typeParameters.params[0].typeName.name;
      // 拿到类型后要进行转换，拿到这个类型的实际内容
      const types = getImportType(ast, vuePath, customPropType);
      if (types) {
        propType = types;
      }
    }
    if (typeof propType === 'string' && propType.includes('Array as Proptype<')) {
      const customPropType = node.node.value.typeAnnotation.typeParameters.params[0].elementType.typeName.name;
      // 拿到类型后要进行转换，拿到这个类型的实际内容
      const types = getImportType(ast, vuePath, customPropType);
      if (types) {
        propType = types;
      }
    }
  }
  return propType;
};

export function printPropInfo(path: any, vuePath: string, ast: any) {
    const propName = path.node.key.name;
    const propTypeNode = path.get('value.properties').find((propPath: any) => propPath.node.key.name === 'type');
    let propType = undefined;
    if (propTypeNode) {
      propType = getType(propTypeNode, ast, vuePath);
    }
    const propDefault = path.get('value.properties').find((propPath: any) => propPath.node.key.name === 'default');
    const propDefaultNode = propDefault && propDefault.get('value');
    // const propDefaultValue = propDefaultNode && propDefaultNode.evaluate().value;
    const propDefaultValue = getDefaultVal(propDefaultNode);
  
    const leadingComments = path.node.leadingComments;
    const comment = leadingComments && leadingComments[0] && leadingComments[0].value.trim();
  
    console.log(`props: ${propName}`);
    console.log(`类型: ${propType}`);
    console.log(`默认值: ${propDefaultValue}`);
    if (comment) {
      console.log(`注释: ${comment}`);
    }
    return {
      [propName]: {
        tsType: {
          [propName]: propType,
        },
        description: comment,
        defaultValue: propDefaultValue,
      }
    };
  };
  
  export const getProps = (ast: any, vuePath: string) => {
    let props = {};
    // 遍历AST并查找props定义
    traverse(ast, {
     ExportDefaultDeclaration(path: any) {
      const propsNode = path.node.declaration.properties.find(
        (prop: any) => prop.key.name === 'props'
      );
       if (propsNode) {
        // 遍历propsNode.value
        traverse(propsNode.value, {
          ObjectProperty(path: any) {
              // 检查父节点是否是props节点
            if (path.parent === propsNode.value) {
              const propObj = printPropInfo(path, vuePath, ast);
              props = {
                ...props,
                ...propObj,
              }
            }
          },
        }, path.scope, path); // 传递scope和parentPath参数
       }
     },
   });
   return props;
 };

 export const getPropsForSetup = (ast: any, vuePath: string) => {
  let props = {};
  // 遍历AST并查找props定义
  traverse(ast, {
    CallExpression(path: any) {
      if (path.node.callee.name === 'defineProps') {
        const propsNode = path.get('arguments')[0];
        if (propsNode) {
          // 遍历propsNode.value
          traverse(propsNode.node, {
            ObjectProperty(path: any) {
                // 检查父节点是否是props节点
              if (path.parent === propsNode.node) {
                const propObj = printPropInfo(path, vuePath, ast);
                props = {
                  ...props,
                  ...propObj,
                }
              }
            },
          }, path.scope, path); // 传递scope和parentPath参数
        }
      };
   },
 });
 return props;
};
