const { default: traverse } = require('@babel/traverse');
const nodePath = require('path');
const fs = require('fs');
import * as parser from '@babel/parser';

const isFileExist = (filePath: string) => {
  const lastffix = ['.ts', '.js', '.d.ts'];
  const filePaths: string[] = [];
  if (filePath.lastIndexOf('.') === -1) {
    lastffix.forEach(ffix => {
      filePaths.push(`${filePath}${ffix}`);
    });
  } else {
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

const getFieldType = (field: any) => {
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
      const tempType: string = field.typeAnnotation.typeAnnotation.elementType.type.replace(/TS|Keyword/g, '').toLowerCase();
      fieldType = (tempType === 'unknown' ? initType : tempType) + '[]';
      break;
    // 其他类型的类型注解...
    default:
      fieldType = 'unknown';
  }
  return fieldType;
}

// 根据.d.ts文件路径，去解析对应的结构
const getTargetTsType = (typeFilePath: string, typeKey: string) => {
  const studentTypeFileContent = fs.readFileSync(typeFilePath, 'utf-8');
  const studentTypeFileAst = parser.parse(studentTypeFileContent, {
    sourceType: 'module',
    plugins: ['typescript'],
  });
  let resultFields = {};
  traverse(studentTypeFileAst, {
    ExportNamedDeclaration(path: any) {
      if (path.node.declaration.id.name === typeKey) {
        resultFields = path.node.declaration.typeAnnotation.members.reduce((fields: any, field: any) => {
        const fieldType = getFieldType(field);
        fields[field.key.name] = fieldType;
        return fields;
        }, {});
      }
    },
  });
  return resultFields;
};


export const getImportType = (ast: any, filePath: string, typeKey: string) => {
  const parentPath = nodePath.resolve(filePath, '../');
  let resultTsType = null;

  traverse(ast, {
    TSInterfaceDeclaration(path: any) {
      if (path.node.id.name === typeKey) {
        resultTsType = path.node.body.body.reduce((fields: any, field: any) => {
          const fieldType = getFieldType(field);
          fields[field.key.name] = fieldType;
          return fields;
        }, {});
      }
    },
    // 先在当前文件中查找
    TSTypeAliasDeclaration(path: any) {
      if (path.node.id.name === typeKey) {
        if (path.node.typeAnnotation.type === 'TSTypeLiteral') {
          resultTsType = path.node.typeAnnotation.members.reduce((fields: any, field: any) => {
            const fieldType = getFieldType(field);
            fields[field.key.name] = fieldType;
            return fields;
          }, {});
        }
      }
    },
    ImportDeclaration(path: any) {
      const importedModule = path.node.source.value;
      try {
        const currPath = nodePath.resolve(parentPath, importedModule)
        const finalPath = isFileExist(currPath);
        if (finalPath) {
          path.node.specifiers.forEach((specifier: any) => {
            if (specifier.imported.name === typeKey) {
              resultTsType = getTargetTsType(finalPath, typeKey);
            }
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
  });
  return resultTsType;
};
