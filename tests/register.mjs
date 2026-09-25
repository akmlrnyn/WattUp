// Test-only TypeScript/alias loader; uses the project's installed compiler.
import { registerHooks } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import ts from 'typescript';
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === '@/modules/auth/infrastructure/auth' && globalThis.wattupTestAuth) {
      return { url: pathToFileURL(resolve('tests/auth-stub.mjs')).href, shortCircuit: true };
    }
    if (specifier === 'next/server') return nextResolve('next/server.js', context);
    let url;
    if (specifier.startsWith('@/')) url = pathToFileURL(resolve('src', specifier.slice(2))).href;
    else if (specifier.startsWith('.') && context.parentURL?.endsWith('.ts')) url = new URL(specifier, context.parentURL).href;
    if (url) {
      if (existsSync(fileURLToPath(url + '.ts'))) return { url: url + '.ts', shortCircuit: true };
      if (url.endsWith('.ts')) return { url, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.ts') && !url.includes('/node_modules/')) {
      return { format: 'module', shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText };
    }
    return nextLoad(url, context);
  },
});
