const fs = require("node:fs");
const path = require("node:path");

const MANIFEST_REL = path.join(".cursor-plugin", "marketplace.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function marketplacePath(extensionPath) {
  return path.join(extensionPath, MANIFEST_REL);
}

function loadMarketplace(extensionPath) {
  const filePath = marketplacePath(extensionPath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing marketplace manifest: ${filePath}`);
  }
  return readJson(filePath);
}

function pluginSourceDir(extensionPath, plugin) {
  return path.resolve(extensionPath, plugin.source);
}

function loadPluginManifest(pluginDir) {
  const filePath = path.join(pluginDir, ".cursor-plugin", "plugin.json");
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return readJson(filePath);
}

function bundledPlugins(extensionPath) {
  const marketplace = loadMarketplace(extensionPath);
  const plugins = [];

  for (const entry of marketplace.plugins || []) {
    if (entry.name.startsWith("starter-")) {
      continue;
    }

    const sourceDir = pluginSourceDir(extensionPath, entry);
    if (!fs.existsSync(sourceDir)) {
      continue;
    }
    const manifest = loadPluginManifest(sourceDir) || {};
    plugins.push({
      name: entry.name,
      description: entry.description || manifest.description || "",
      displayName: manifest.displayName || entry.name,
      version: manifest.version || marketplace.metadata?.version || "0.0.0",
      source: entry.source,
      sourceDir,
      manifest,
    });
  }

  return { marketplace, plugins };
}

module.exports = {
  MANIFEST_REL,
  marketplacePath,
  loadMarketplace,
  bundledPlugins,
  loadPluginManifest,
};
