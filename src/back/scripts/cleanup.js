const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_FILE_BASE = path.join(DATA_DIR, 'sigac');
const DB_FILES = [`${DB_FILE_BASE}.mv.db`, `${DB_FILE_BASE}.h2.db`];
const DEMO_DOMAIN = '@demo.sigac.local';
const DEMO_CNPJS = [
  '31345678000190',
  '31456789000121',
  '31567890000154',
];

function log(message) {
  process.stdout.write(`${message}\n`);
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function findH2Jar() {
  const h2Root = path.join(os.homedir(), '.m2', 'repository', 'com', 'h2database', 'h2');
  if (!fs.existsSync(h2Root)) {
    fail(`H2 não encontrado em ${h2Root}.`);
  }

  const versions = fs.readdirSync(h2Root)
    .filter((entry) => fs.statSync(path.join(h2Root, entry)).isDirectory())
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  for (let index = versions.length - 1; index >= 0; index -= 1) {
    const version = versions[index];
    const jarPath = path.join(h2Root, version, `h2-${version}.jar`);
    if (fs.existsSync(jarPath)) {
      return jarPath;
    }
  }

  fail('Não foi possível localizar o jar do H2 no repositório Maven local.');
}

function h2Url() {
  return `jdbc:h2:file:${DB_FILE_BASE};DB_CLOSE_DELAY=-1;MODE=MySQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE`;
}

function sqlList(values) {
  return values.map((value) => `'${String(value).replace(/'/g, "''")}'`).join(', ');
}

function cleanupSql() {
  const cnpjs = sqlList(DEMO_CNPJS);
  const emailPattern = `%${DEMO_DOMAIN}`;

  return `
SET REFERENTIAL_INTEGRITY FALSE;

DELETE FROM aviso_destinatarios
WHERE aviso_id IN (
  SELECT id FROM avisos
  WHERE condominio_id IN (
    SELECT id FROM condominios WHERE cnpj IN (${cnpjs})
  )
);

DELETE FROM avisos
WHERE condominio_id IN (
  SELECT id FROM condominios WHERE cnpj IN (${cnpjs})
);

DELETE FROM arrecadacao_mensal_logs
WHERE arrecadacao_mensal_id IN (
  SELECT id FROM arrecadacoes_mensais
  WHERE condominio_id IN (
    SELECT id FROM condominios WHERE cnpj IN (${cnpjs})
  )
);

DELETE FROM solicitacoes_manutencao
WHERE condominio_id IN (
  SELECT id FROM condominios WHERE cnpj IN (${cnpjs})
);

DELETE FROM manutencoes
WHERE condominio_id IN (
  SELECT id FROM condominios WHERE cnpj IN (${cnpjs})
);

DELETE FROM gastos_produto
WHERE condominio_id IN (
  SELECT id FROM condominios WHERE cnpj IN (${cnpjs})
);

DELETE FROM funcionarios
WHERE condominio_id IN (
  SELECT id FROM condominios WHERE cnpj IN (${cnpjs})
);

DELETE FROM inquilinos
WHERE condominio_id IN (
  SELECT id FROM condominios WHERE cnpj IN (${cnpjs})
);

DELETE FROM arrecadacoes_mensais
WHERE condominio_id IN (
  SELECT id FROM condominios WHERE cnpj IN (${cnpjs})
);

DELETE FROM gestores_condominio
WHERE condominio_id IN (
  SELECT id FROM condominios WHERE cnpj IN (${cnpjs})
);

DELETE FROM sindicos_condominio
WHERE condominio_id IN (
  SELECT id FROM condominios WHERE cnpj IN (${cnpjs})
);

DELETE FROM condominios
WHERE cnpj IN (${cnpjs});

DELETE FROM users
WHERE email LIKE '${emailPattern}';

SET REFERENTIAL_INTEGRITY TRUE;
`;
}

function runSql(sql) {
  const h2Jar = findH2Jar();
  const tempSqlFile = path.join(os.tmpdir(), `sigac-cleanup-${Date.now()}.sql`);
  fs.writeFileSync(tempSqlFile, sql, 'utf8');

  try {
    const result = spawnSync(
      'java',
      [
        '-cp',
        h2Jar,
        'org.h2.tools.RunScript',
        '-url',
        h2Url(),
        '-user',
        'sa',
        '-password',
        '',
        '-script',
        tempSqlFile,
      ],
      {
        cwd: ROOT_DIR,
        encoding: 'utf8',
      },
    );

    if (result.status !== 0) {
      const details = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
      fail(`Falha ao executar cleanup no H2.\n${details}`);
    }
  } finally {
    fs.rmSync(tempSqlFile, { force: true });
  }
}

function main() {
  const dbExists = DB_FILES.some((filePath) => fs.existsSync(filePath));
  if (!dbExists) {
    log('Nenhum banco H2 encontrado em data/. Nada para limpar.');
    return;
  }

  log('Limpando dataset de demonstração do SIGAC...');
  runSql(cleanupSql());
  log('Cleanup concluído com sucesso.');
}

main();
