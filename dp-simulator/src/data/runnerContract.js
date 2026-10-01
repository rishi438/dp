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
      suffix: `\nif __name__ == "__main__":\n    test_cases = ${JSON.stringify(problem.examples)}\n    for inputs in test_cases:\n        try:\n            answer = ${name}(**inputs)\n            print("__DP_RESULT__" + json.dumps({"actual": answer}, allow_nan=False))\n        except Exception as error:\n            print("__DP_RESULT__" + json.dumps({"error": str(error)}))`,
    };
  }
  if (language !== 'rust') throw new Error('Choose Python or Rust.');
  return {
    prefix: `use std::collections::{HashMap, VecDeque};\n\nfn ${name}(${problem.args.map(a => `${a.name}: ${rustTypes[a.type]}`).join(', ')}) -> ${rustTypes[type]} {`,
    suffix: `}\n\nfn main() {\n${problem.examples.map(input => `    match std::panic::catch_unwind(|| ${name}(${problem.args.map(a => rustLiteral(input[a.name])).join(', ')})) {\n        Ok(answer) => println!("__DP_RESULT__{{\\\"actual\\\":{:?}}}", answer),\n        Err(_) => println!("__DP_RESULT__{{\\\"error\\\":\\\"Solution panicked\\\"}}"),\n    }`).join('\n')}\n}`,
  };
}

export function fullStarterCode(problem, language) {
  const name = functionName(problem), type = returnType(problem);
  if (language === 'python') {
    const signature = `def ${name}(${problem.args.map(a => `${a.name}: ${pythonTypes[a.type]}`).join(', ')}) -> ${pythonTypes[type]}:`;
    const body = '    # Write your solution here. You may define helper functions.\n    raise NotImplementedError("Complete this function")';
    const testCases = JSON.stringify(problem.examples);
    const runner = `if __name__ == "__main__":\n    test_cases = ${testCases}\n    for inputs in test_cases:\n        try:\n            answer = ${name}(**inputs)\n            print("__DP_RESULT__" + json.dumps({"actual": answer}, allow_nan=False))\n        except Exception as error:\n            print("__DP_RESULT__" + json.dumps({"error": str(error)}))`;
    return `from functools import cache, lru_cache\nfrom collections import deque\nimport math\nimport json\n\n\n${signature}\n${body}\n\n\n${runner}\n`;
  }
  if (language === 'rust') {
    const signature = `fn ${name}(${problem.args.map(a => `${a.name}: ${rustTypes[a.type]}`).join(', ')}) -> ${rustTypes[type]} {`;
    const body = '    // Write your solution here. You may define helper functions.\n    unimplemented!("Complete this function")';
    const runnerCalls = problem.examples.map(input => `    match std::panic::catch_unwind(|| ${name}(${problem.args.map(a => rustLiteral(input[a.name])).join(', ')})) {\n        Ok(answer) => println!("__DP_RESULT__{{\\\"actual\\\":{:?}}}", answer),\n        Err(_) => println!("__DP_RESULT__{{\\\"error\\\":\\\"Solution panicked\\\"}}"),\n    }`).join('\n');
    return `use std::collections::{HashMap, VecDeque};\n\n${signature}\n${body}\n}\n\nfn main() {\n${runnerCalls}\n}\n`;
  }
  throw new Error('Choose Python or Rust.');
}

export function toFullCode(problem, language, codeOrBody) {
  if (!codeOrBody) return fullStarterCode(problem, language);
  const name = functionName(problem);
  const isFull = language === 'python'
    ? (codeOrBody.includes(`def ${name}`) || codeOrBody.includes('import ') || codeOrBody.includes('if __name__ == "__main__":'))
    : (codeOrBody.includes(`fn ${name}`) || codeOrBody.includes('use ') || codeOrBody.includes('fn main()'));
  if (isFull) {
    if (language === 'python') {
      const multilineTestCases = /test_cases\s*=\s*\[[\s\S]*?\](?=\s*(?:\r?\n)\s*for\s+inputs\s+in)/;
      const match = codeOrBody.match(multilineTestCases);
      if (match && (match[0].includes('\n') || match[0].includes('\r'))) {
        return codeOrBody.replace(multilineTestCases, `test_cases = ${JSON.stringify(problem.examples)}`);
      }
    }
    return codeOrBody;
  }
  const { prefix, suffix } = runnerParts(problem, language);
  const indented = codeOrBody.split('\n').map(l => l.startsWith('    ') ? l : `    ${l}`).join('\n');
  if (language === 'python') {
    return `${prefix}\n${indented}\n\n${suffix}\n`;
  }
  return `${prefix}\n${indented}\n${suffix}\n`;
}

export function assembleSource(problem, language, body) {
  if (typeof body !== 'string' || body.length > 40000 || body.split('\n').length > 600 || body.includes('\0')) throw new Error('Solution body must be text, at most 40,000 characters and 600 lines.');
  const name = functionName(problem);
  const isFullPython = language === 'python' && (body.includes(`def ${name}`) || body.includes('if __name__ == "__main__":'));
  const isFullRust = language === 'rust' && (body.includes(`fn ${name}`) || body.includes('fn main()'));

  if (isFullPython || isFullRust) {
    let full = body;
    const { suffix } = runnerParts(problem, language);
    if (!full.includes('__DP_RESULT__')) {
      full = `${full.trimEnd()}\n\n${suffix}\n`;
    }
    return full;
  }

  const { prefix, suffix } = runnerParts(problem, language);
  return `${prefix}\n${body.split('\n').map(line => `    ${line}`).join('\n')}\n${suffix}\n`;
}
