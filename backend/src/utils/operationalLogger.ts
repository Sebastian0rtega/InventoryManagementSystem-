type LogLevel = "info" | "warn" | "error";

type OperationalLog = {
  level: LogLevel;
  event: string;
  [key: string]: unknown;
};

export const writeOperationalLog = (entry: OperationalLog): void => {
  const serialized = JSON.stringify({
    timestamp: new Date().toISOString(),
    ...entry,
  });

  if (entry.level === "error") {
    console.error(serialized);
    return;
  }

  console.log(serialized);
};
