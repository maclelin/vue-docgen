"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropsForSetup = exports.getProps = exports.getType = exports.getDefaultVal = void 0;
exports.printPropInfo = printPropInfo;
const get_import_type_module_1 = require("./get-import-type-module");
const { default: traverse } = require('@babel/traverse');
const getDefaultVal = (node) => {
    let result = node.node.value || node.toString();
    if (node.type === 'ArrowFunctionExpression') {
        result = eval(`(${result})()`);
    }
    else if (node.isObjectExpression()) {
        result = {};
        node.get('properties').forEach((prop) => {
            result[prop.node.key.name] = prop.node.value.value;
        });
    }
    else if (node.isArrayExpression()) {
        result = node.node.elements.map((element) => element.value);
    }
    return result;
};
exports.getDefaultVal = getDefaultVal;
const getType = (node, ast, vuePath) => {
    let propType = '';
    if (node) {
        propType = node.get('value').toString();
        // 复合类型
        if (propType.includes('Object as Proptype<')) {
            const customPropType = node.node.value.typeAnnotation.typeParameters.params[0].typeName.name;
            // 拿到类型后要进行转换，拿到这个类型的实际内容
            const types = (0, get_import_type_module_1.getImportType)(ast, vuePath, customPropType);
            if (types) {
                propType = types;
            }
        }
        if (propType.includes('Array as Proptype<')) {
            const customPropType = node.node.value.typeAnnotation.typeParameters.params[0].elementType.typeName.name;
            // 拿到类型后要进行转换，拿到这个类型的实际内容
            const types = (0, get_import_type_module_1.getImportType)(ast, vuePath, customPropType);
            if (types) {
                propType = types;
            }
        }
    }
    return propType;
};
exports.getType = getType;
function printPropInfo(path, vuePath, ast) {
    const propName = path.node.key.name;
    const propTypeNode = path.get('value.properties').find((propPath) => propPath.node.key.name === 'type');
    let propType = undefined;
    if (propTypeNode) {
        propType = (0, exports.getType)(propTypeNode, ast, vuePath);
    }
    const propDefault = path.get('value.properties').find((propPath) => propPath.node.key.name === 'default');
    const propDefaultNode = propDefault && propDefault.get('value');
    // const propDefaultValue = propDefaultNode && propDefaultNode.evaluate().value;
    const propDefaultValue = (0, exports.getDefaultVal)(propDefaultNode);
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
}
;
const getProps = (ast, vuePath) => {
    let props = {};
    // 遍历AST并查找props定义
    traverse(ast, {
        ExportDefaultDeclaration(path) {
            const propsNode = path.node.declaration.properties.find((prop) => prop.key.name === 'props');
            if (propsNode) {
                // 遍历propsNode.value
                traverse(propsNode.value, {
                    ObjectProperty(path) {
                        // 检查父节点是否是props节点
                        if (path.parent === propsNode.value) {
                            const propObj = printPropInfo(path, vuePath, ast);
                            props = Object.assign(Object.assign({}, props), propObj);
                        }
                    },
                }, path.scope, path); // 传递scope和parentPath参数
            }
        },
    });
    return props;
};
exports.getProps = getProps;
const getPropsForSetup = (ast, vuePath) => {
    let props = {};
    // 遍历AST并查找props定义
    traverse(ast, {
        CallExpression(path) {
            if (path.node.callee.name === 'defineProps') {
                const propsNode = path.get('arguments')[0];
                if (propsNode) {
                    // 遍历propsNode.value
                    traverse(propsNode.node, {
                        ObjectProperty(path) {
                            // 检查父节点是否是props节点
                            if (path.parent === propsNode.node) {
                                const propObj = printPropInfo(path, vuePath, ast);
                                props = Object.assign(Object.assign({}, props), propObj);
                            }
                        },
                    }, path.scope, path); // 传递scope和parentPath参数
                }
            }
            ;
        },
    });
    return props;
};
exports.getPropsForSetup = getPropsForSetup;
//# sourceMappingURL=get-props-info.js.map