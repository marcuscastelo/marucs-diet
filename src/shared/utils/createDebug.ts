/* eslint-disable */
export function getCallerFile(): string | undefined {
  const originalPrepareStackTrace = Error.prepareStackTrace;

  try {
    Error.prepareStackTrace = (_, stack) => stack;
    const err = new Error();

    const stack = err.stack as unknown as NodeJS.CallSite[];

    // stack[0] = getCallerFile
    // stack[1] = quem chamou getCallerFile
    // stack[2] = o arquivo chamador da função que chamou getCallerFile
    const caller = stack[2];
    return caller?.getFileName?.() ?? undefined;
  } finally {
    Error.prepareStackTrace = originalPrepareStackTrace;
  }
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

  const module =
    getCallerFile()?.replace(/.*\/src\//, '')?.replace(/\.[jt]sx?$/, '') ?? 'unknown';

  return (...args: unknown[]) => {
    const group = groups.get(module) ?? {
      entries: [],
      timer: null,
    };

    group.entries.push({ args });

    if (group.timer) clearTimeout(group.timer);

    group.timer = setTimeout(() => {
      flushGroup(module);
    }, GROUP_DELAY_MS);

    groups.set(module, group);
  };
}
