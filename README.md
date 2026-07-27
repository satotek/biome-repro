# `noUnnecessaryConditions` false positives in Biome 2.5.5

Biome 2.5.5 reports `lint/suspicious/noUnnecessaryConditions` on optional chaining and nullish
coalescing that TypeScript requires. The diagnostics first appear in 2.5.4; 2.5.3 and earlier
report nothing on the same code with the same configuration.

Removing the reported syntax, as the diagnostics instruct, makes `tsc` fail.

## Summary

| Scenario | Biome 2.5.5 | tsc 7.0.2 |
| --- | --- | --- |
| `src/`, `noUncheckedIndexedAccess: true` | 4 errors | passes |
| `diagnostics-applied/`, reported syntax removed | 0 errors | **3 errors** |

| Biome | 2.5.2 | 2.5.3 | 2.5.4 | 2.5.5 |
| --- | --- | --- | --- | --- |
| `src/` diagnostics | 0 | 0 | 4 | 4 |

## Environment

- `@biomejs/biome` 2.5.5 (2.5.2 for comparison)
- `typescript` 7.0.2
- pnpm 11.16.0, Node.js 24

<details>
<summary><code>biome rage --linter</code></summary>

```
CLI:
  Version:                      2.5.5
  Color support:                true

Platform:
  CPU Architecture:             x86_64
  OS:                           linux

Environment:
  BIOME_DISTRIBUTION:                npm
  BIOME_LOG_PATH:                    unset
  BIOME_LOG_PREFIX_NAME:             unset
  BIOME_LOG_LEVEL:                   unset
  BIOME_LOG_KIND:                    unset
  BIOME_CONFIG_PATH:                 unset
  BIOME_THREADS:                     unset
  BIOME_WATCHER_KIND:                unset
  BIOME_WATCHER_POLLING_INTERVAL:    unset
  NO_COLOR:                     unset
  TERM:                         xterm-256color
  JS_RUNTIME_VERSION:           v24.15.0
  JS_RUNTIME_NAME:              node
  NODE_PACKAGE_MANAGER:         unset

Biome Configuration:
  Status:                       Loaded successfully.
  Path:                         biome.json
  Formatter enabled:            true
  Linter enabled:               true
  Assist enabled:               true
  VCS enabled:                  false
  HTML full support enabled:    unset

Linter:
  JavaScript enabled:           unset
  JSON enabled:                 unset
  CSS enabled:                  unset
  GraphQL enabled:              unset
  Recommended:                  unset
  Enabled rules:
    suspicious/noUnnecessaryConditions

Workspace:
  Open Documents:               0
```

</details>

## Steps

```sh
pnpm install
pnpm typecheck   # passes, no errors
pnpm lint        # 4 errors
```

Compare against 2.5.3, the last release without the diagnostics:

```sh
pnpm lint:2.5.3   # no errors
```

## Observed

```
src/pattern-a.ts:12:10  Unnecessary nullish coalescing
src/pattern-a.ts:12:10  Unnecessary optional chaining
src/pattern-b.ts:14:19  Unnecessary nullish coalescing
src/pattern-b.ts:17:27  Unnecessary optional chaining
```

Both are reported as "guaranteed to be non-nullish".

## Expected

Neither pattern should produce a diagnostic. In each case the optional chaining is required for
the code to type-check, and the nullish coalescing is required to satisfy the declared return
type.

### Pattern A — the awaited value of `Promise<T | null>`

`src/loader.ts` declares `getUsage(): Promise<Usage | null>`, so the awaited value is
`Usage | null`.

```ts
export async function patternA(userId: string): Promise<string> {
  const result = await getUsage(userId);
  return result?.range.startDate ?? 'N/A';
}
```

This is independent of any compiler option: `tsc` reports `TS18047: 'result' is possibly 'null'`
once the optional chaining is removed.

Note that annotating the return type does not silence the rule, so the workaround suggested in
biomejs/biome#10704 — adding an explicit return type annotation — does not apply here.

### Pattern B — `noUncheckedIndexedAccess`

With `noUncheckedIndexedAccess: true`, both `logs[0]` and `const [first] = logs` are
`LogEntry | undefined`.

```ts
export async function patternB(): Promise<string[]> {
  const logs = await getLogs();

  const byIndex = logs[0]?.id ?? '';

  const [first] = logs;
  const byDestructuring = first?.createdAt.toISOString() ?? '';

  return [byIndex, byDestructuring];
}
```

The type inference does not appear to model this compiler option: setting it to `false` does not
change Biome's diagnostics, even though it changes the types inferred by TypeScript.

The option is not implied by `strict`, but it is enabled by default in the `tsconfig.json` that
`tsc --init` generates, and it is part of `@tsconfig/strictest`.

## Applying the diagnostics breaks the build

`diagnostics-applied/` contains the same two files with the reported syntax removed. Biome 2.5.5
accepts them, but the compiler does not:

```sh
pnpm lint:diagnostics-applied     # no errors
pnpm typecheck:diagnostics-applied
```

```
diagnostics-applied/pattern-a.ts(10,10): error TS18047: 'result' is possibly 'null'.
diagnostics-applied/pattern-b.ts(11,19): error TS2532: Object is possibly 'undefined'.
diagnostics-applied/pattern-b.ts(14,27): error TS18048: 'first' is possibly 'undefined'.
```
