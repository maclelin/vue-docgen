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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImportType = void 0;
const { default: traverse } = require('@babel/traverse');
const nodePath = require('path');
const fs = require('fs');
const parser = __importStar(require("@babel/parser"));
const isFileExist = (filePath) => {
    const lastffix = ['.ts', '.js', '.d.ts'];
    const filePaths = [];
    if (filePath.lastIndexOf('.') === -1) {
        lastffix.forEach(ffix => {
            filePaths.push(`${filePath}${ffix}`);
        });
    }
    else {
        filePaths.push(filePath);
    }
    let resultPath = null;
    filePaths.some(item => {
        if (fs.existsSync(item)) {
            resultPath = item;
            return true;
        }
        return false;
    });
    return resultPath;
};
const getFieldType = (field) => {
    let fieldType;
    const initType = field.typeAnnotation.typeAnnotation.type;
    switch (initType) {
        case 'TSTypeReference':
            fieldType = field.typeAnnotation.typeAnnotation.typeName.name;
            break;
        case 'TSNumberKeyword':
            fieldType = 'number';
            break;
        case 'TSStringKeyword':
            fieldType = 'string';
            break;
        case 'TSBooleanKeyword':
            fieldType = 'boolean';
            break;
        case 'TSAnyKeyword':
            fieldType = 'any';
            break;
        case 'TSUnknownKeyword':
            fieldType = 'unknown';
            break;
        case 'TSVoidKeyword':
            fieldType = 'void';
            break;
        case 'TSNeverKeyword':
            fieldType = 'never';
            break;
        case 'TSArrayType':
            const tempType = field.typeAnnotation.typeAnnotation.elementType.type.replace(/TS|Keyword/g, '').toLowerCase();
            fieldType = (tempType === 'unknown' ? initType : tempType) + '[]';
            break;
        // 其他类型的类型注解...
        default:
            fieldType = 'unknown';
    }
    return fieldType;
};
// 根据.d.ts文件路径，去解析对应的结构
const getTargetTsType = (typeFilePath, typeKey) => {
    const studentTypeFileContent = fs.readFileSync(typeFilePath, 'utf-8');
    const studentTypeFileAst = parser.parse(studentTypeFileContent, {
        sourceType: 'module',
        plugins: ['typescript'],
    });
    let resultFields = {};
    traverse(studentTypeFileAst, {
        ExportNamedDeclaration(path) {
            if (path.node.declaration.id.name === typeKey) {
                resultFields = path.node.declaration.typeAnnotation.members.reduce((fields, field) => {
                    const fieldType = getFieldType(field);
                    fields[field.key.name] = fieldType;
                    return fields;
                }, {});
            }
        },
    });
    return resultFields;
};
const getImportType = (ast, filePath, typeKey) => {
    const parentPath = nodePath.resolve(filePath, '../');
    let resultTsType = null;
    traverse(ast, {
        TSInterfaceDeclaration(path) {
            if (path.node.id.name === typeKey) {
                resultTsType = path.node.body.body.reduce((fields, field) => {
                    const fieldType = getFieldType(field);
                    fields[field.key.name] = fieldType;
                    return fields;
                }, {});
            }
        },
        // 先在当前文件中查找
        TSTypeAliasDeclaration(path) {
            if (path.node.id.name === typeKey) {
                if (path.node.typeAnnotation.type === 'TSTypeLiteral') {
                    resultTsType = path.node.typeAnnotation.members.reduce((fields, field) => {
                        const fieldType = getFieldType(field);
                        fields[field.key.name] = fieldType;
                        return fields;
                    }, {});
                }
            }
        },
        ImportDeclaration(path) {
            const importedModule = path.node.source.value;
            try {
                const currPath = nodePath.resolve(parentPath, importedModule);
                const finalPath = isFileExist(currPath);
                if (finalPath) {
                    path.node.specifiers.forEach((specifier) => {
                        if (specifier.imported.name === typeKey) {
                            resultTsType = getTargetTsType(finalPath, typeKey);
                        }
                    });
                }
            }
            catch (error) {
                console.error(error);
            }
        },
    });
    return resultTsType;
};
exports.getImportType = getImportType;
//# sourceMappingURL=get-import-type-module.js.map