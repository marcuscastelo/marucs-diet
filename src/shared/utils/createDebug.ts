/* eslint-disable */
export function getCallerFile(n: number): string | undefined {
  const originalPrepareStackTrace = Error.prepareStackTrace;

  try {
    Error.prepareStackTrace = (_, stack) => stack;
    const err = new Error();

    const stack = err.stack as unknown as NodeJS.CallSite[];

    const caller = stack[n + 1];
    return caller?.getFileName?.() ?? undefined;
  } finally {
    Error.prepareStackTrace = originalPrepareStackTrace;
  }
}

function getCallerContext(n: number = 1): string {
  const file = getCallerFile(n + 1);
  if (!file) return 'unknown';
  return file.replace(/.*\/src\//, '').replace(/\.[jt]sx?.*$/, '');
}

const DEBUG_ENABLED = true;
const GROUP_DELAY_MS = 50;

type LogEntry = {
  args: unknown[];
};

type GroupState = {
  entries: LogEntry[];
  timer: NodeJS.Timeout | null;
};

const groups = new Map<string, GroupState>();

function flushGroup(module: string) {
  const group = groups.get(module);
  if (!group || group.entries.length === 0) return;

  console.groupCollapsed(`[${module}]`);

  for (const { args } of group.entries) {
    console.debug(...args);
  }

  console.groupEnd();

  groups.delete(module);
}

export function createDebug() {
  if (!DEBUG_ENABLED) {
    return () => {};
  }

  const module = getCallerContext(1);

  return (...args: unknown[]) => {
    const group = groups.get(module) ?? {
      entries: [],
      timer: null,
    };
    group.entries.push({ args });
    if (!group.timer) {
      group.timer = setTimeout(() => flushGroup(module), GROUP_DELAY_MS);
    }
    groups.set(module, group);
  };
}
