import { createServer } from "vite";
import esbuild from "esbuild";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Asegurar que el runtime de node esté en PATH para procesos secundarios de Electron
const nodeBinDir = path.dirname(process.execPath);
process.env.PATH = `${nodeBinDir}:${process.env.PATH || ""}`;

async function startDev() {
  console.log("🚀 [Novelore] Iniciando servidor Vite...");
  const server = await createServer({
    configFile: path.join(rootDir, "vite.config.ts"),
    server: { port: 5173 },
  });

  await server.listen();
  const address = server.httpServer?.address();
  const port = typeof address === "object" && address ? address.port : 5173;
  const devUrl = `http://localhost:${port}`;
  console.log(`✨ [Novelore] Vite listo en: ${devUrl}`);

  console.log("🔨 [Novelore] Compilando proceso principal y preload de Electron...");
  await esbuild.build({
    entryPoints: [path.join(rootDir, "electron/main.ts")],
    bundle: true,
    platform: "node",
    target: "node20",
    external: ["electron"],
    outfile: path.join(rootDir, "dist-electron/main.cjs"),
    define: {
      "process.env.VITE_DEV_SERVER_URL": JSON.stringify(devUrl),
    },
  });

  await esbuild.build({
    entryPoints: [path.join(rootDir, "electron/preload.ts")],
    bundle: true,
    platform: "node",
    target: "node20",
    external: ["electron"],
    outfile: path.join(rootDir, "dist-electron/preload.cjs"),
  });
  console.log("✅ [Novelore] Electron compilado correctamente.");

  // Importar electron ejecutable
  const { default: electronPath } = await import("electron");

  console.log("🖥️  [Novelore] Abriendo ventana nativa de Electron...");
  const electronProcess = spawn(electronPath, [path.join(rootDir, "dist-electron/main.cjs")], {
    stdio: "inherit",
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: devUrl,
    },
  });

  electronProcess.on("close", async () => {
    console.log("🛑 [Novelore] Cerrando entorno de desarrollo...");
    await server.close();
    process.exit(0);
  });
}

startDev().catch((err) => {
  console.error("❌ Error en dev:electron:", err);
  process.exit(1);
});
