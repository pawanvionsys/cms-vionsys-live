type EnvEntry = {
  key: string;
  configured: boolean;
  source: 'env' | 'default' | 'missing';
  value?: string;
  masked?: string;
};

const SECRET_KEYS = new Set([
  'DATABASE_URL',
  'JWT_SECRET',
  'FRONTEND_REVALIDATE_SECRET',
  'ACCESS_KEY_ID',
  'SECRET_ACCESS_KEY',
]);

function maskSecret(value: string): string {
  if (value.length <= 8) return '********';
  return `${value.slice(0, 4)}…${value.slice(-4)} (${value.length} chars)`;
}

function maskDatabaseUrl(value: string): string {
  try {
    const url = new URL(value.replace(/^mongodb(\+srv)?:\/\//, 'https://'));
    const pathname = value.includes('@')
      ? value.split('@')[1]?.split('/')[0]
      : url.host;
    const db = value.split('/').pop()?.split('?')[0];
    return `mongodb://***@${pathname}/${db ?? '?'}`;
  } catch {
    return maskSecret(value);
  }
}

function describeEnv(key: string, fallback?: string): EnvEntry {
  const raw = process.env[key];
  const trimmed = raw?.trim();
  const configured = Boolean(trimmed);
  const source: EnvEntry['source'] = configured
    ? 'env'
    : fallback
      ? 'default'
      : 'missing';
  const resolved = configured ? trimmed! : fallback;

  if (!resolved) {
    return { key, configured: false, source: 'missing' };
  }

  if (key === 'DATABASE_URL') {
    return {
      key,
      configured,
      source,
      masked: maskDatabaseUrl(resolved),
    };
  }

  if (SECRET_KEYS.has(key)) {
    return {
      key,
      configured,
      source,
      masked: maskSecret(resolved),
    };
  }

  return {
    key,
    configured,
    source,
    value: resolved,
  };
}

export function getEnvDiagnostics(options?: { revealSecrets?: boolean }) {
  const revealSecrets = options?.revealSecrets ?? false;

  const keys = [
    'NODE_ENV',
    'DATABASE_URL',
    'JWT_SECRET',
    'VIONSYS_FRONTEND_BASE_URL',
    'CMS_BASE_URL',
    'FRONTEND_REVALIDATE_URL',
    'FRONTEND_REVALIDATE_SECRET',
    'REGION',
    'BUCKET',
    'ACCESS_KEY_ID',
    'SECRET_ACCESS_KEY',
  ] as const;

  const defaults: Partial<Record<(typeof keys)[number], string>> = {
    NODE_ENV: 'development',
    REGION: 'ap-south-1',
    BUCKET: 'vionsys-wms',
  };

  const variables = keys.map((key) => describeEnv(key, defaults[key]));

  const s3Ready = Boolean(
    process.env.ACCESS_KEY_ID?.trim() && process.env.SECRET_ACCESS_KEY?.trim()
  );

  const payload: Record<string, unknown> = {
    checkedAt: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'development',
    s3Ready,
    variables,
  };

  if (revealSecrets) {
    payload.revealed = Object.fromEntries(
      keys.map((key) => [key, process.env[key]?.trim() || null])
    );
  }

  return payload;
}
