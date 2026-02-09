const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "../public");
const dest = path.join(__dirname, "../dist/public");

console.log(`Copiando assets de ${src} para ${dest}...`);

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Origem não existe: ${src}`);
    return;
  }

  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName),
      );
    });
  } else {
    // Garante que o diretório pai existe
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(src, dest);
    console.log(`Copiado: ${path.basename(src)}`);
  }
}

try {
  copyRecursiveSync(src, dest);
  console.log("Arquivos copiados com sucesso!");
} catch (err) {
  console.error("Erro ao copiar arquivos:", err);
  process.exit(1);
}
