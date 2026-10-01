import { returnType } from './practice.js';

const pythonTypes = { int: 'int', ints: 'list[int]', string: 'str', strings: 'list[str]', matrix: 'list[list[int]]', bool: 'bool', float: 'float' };
const rustTypes = { int: 'i64', ints: 'Vec<i64>', string: 'String', strings: 'Vec<String>', matrix: 'Vec<Vec<i64>>', bool: 'bool', float: 'f64' };
export const functionName = problem => problem.id.replaceAll('-', '_');
export const starterBody = language => language === 'python' ? '# Write your solution here. You may define helper functions.\nraise NotImplementedError("Complete this function")' : '// Write your solution here. You may define helper functions.\nunimplemented!("Complete this function")';

function pythonLiteral(value) {
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (Array.isArray(value)) return `[${value.map(pythonLiteral).join(', ')}]`;
  return JSON.stringify(value);
}
function rustLiteral(value) {
  if (Array.isArray(value)) return `vec![${value.map(rustLiteral).join(', ')}]`;
  return typeof value === 'string' ? `${JSON.stringify(value)}.to_string()` : String(value);
}

export function runnerParts(problem, language) {
  const name = functionName(problem), type = returnType(problem);
  if (language === 'python') {
    const signature = `def ${name}(${problem.args.map(a => `${a.name}: ${pythonTypes[a.type]}`).join(', ')}) -> ${pythonTypes[type]}:`;
    return {
      prefix: `from functools import cache, lru_cache\nfrom collections import deque\nimport math\nimport json\n\n${signature}`,
      suffix: `\nif __name__ == "__main__":\n    test_cases = ${pythonLiteral(problem.examples)}\n    for inputs in test_cases:\n        try:\n            answer = ${name}(**inputs)\n            print("__DP_RESULT__" + json.dumps({"actual": answer}, allow_nan=False))\n        except Exception as error:\n            print("__DP_RESULT__" + json.dumps({"error": str(error)}))`,
    };
  }
  if (language !== 'rust') throw new Error('Choose Python or Rust.');
  return {
    prefix: `use std::collections::{HashMap, VecDeque};\n\nfn ${name}(${problem.args.map(a => `${a.name}: ${rustTypes[a.type]}`).join(', ')}) -> ${rustTypes[type]} {`,
    suffix: `}\n\nfn main() {\n${problem.examples.map(input => `    match std::panic::catch_unwind(|| ${name}(${problem.args.map(a => rustLiteral(input[a.name])).join(', ')})) {\n        Ok(answer) => println!("__DP_RESULT__{{\\\"actual\\\":{:?}}}", answer),\n        Err(_) => println!("__DP_RESULT__{{\\\"error\\\":\\\"Solution panicked\\\"}}"),\n    }`).join('\n')}\n}`,
  };
}

export function assembleSource(problem, language, body) {
  if (typeof body !== 'string' || body.length > 40000 || body.split('\n').length > 600 || body.includes('\0')) throw new Error('Solution body must be text, at most 40,000 characters and 600 lines.');
  const { prefix, suffix } = runnerParts(problem, language);
  return `${prefix}\n${body.split('\n').map(line => `    ${line}`).join('\n')}\n${suffix}\n`;
}
