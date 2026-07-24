const COLOR = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function paint(color: keyof typeof COLOR, text: string): string {
  if (process.env.NO_COLOR || !process.stdout.isTTY) return text;
  return `${COLOR[color]}${text}${COLOR.reset}`;
}

export const logger = {
  info(msg: string) {
    console.log(`${paint('cyan', '›')} ${msg}`);
  },
  ok(msg: string) {
    console.log(`${paint('green', '✓')} ${msg}`);
  },
  warn(msg: string) {
    console.log(`${paint('yellow', '!')} ${msg}`);
  },
  error(msg: string) {
    console.error(`${paint('red', '✗')} ${msg}`);
  },
  dim(msg: string) {
    console.log(paint('dim', msg));
  },
  json(data: unknown) {
    console.log(JSON.stringify(data, null, 2));
  },
};
