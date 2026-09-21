// Postgres local embarqué pour le développement (aucun Docker requis).
// Données persistées dans .data/pg. Arrêt propre avec Ctrl+C.
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";

const databaseDir = new URL("../.data/pg", import.meta.url).pathname;
const pg = new EmbeddedPostgres({
  databaseDir,
  user: "corpus",
  password: "corpus",
  port: 5433,
  persistent: true,
});

if (!existsSync(`${databaseDir}/PG_VERSION`)) await pg.initialise();
await pg.start();
try {
  await pg.createDatabase("corpus");
} catch {
  // la base existe déjà
}
console.log("Postgres prêt : postgresql://corpus:corpus@localhost:5433/corpus");

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);
