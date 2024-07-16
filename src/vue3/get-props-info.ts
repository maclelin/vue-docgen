const { default: traverse } = require('@babel/traverse');

export function printPropInfo(path: any) {
    const propName = path.node.key.name;
    const propTypeNode = path.get('value.properties').find((propPath: any) => propPath.node.key.name === 'type');
    let propType = undefined;
    if (propTypeNode) {
      propType = propTypeNode.get('value').toString();
    }
    const propDefault = path.get('value.properties').find((propPath: any) => propPath.node.key.name === 'default');
    const propDefaultNode = propDefault && propDefault.get('value');
    const propDefaultValue = propDefaultNode && propDefaultNode.evaluate().value;
  
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
  
  export const getProps = (ast: any) => {
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
              const propObj = printPropInfo(path);
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
