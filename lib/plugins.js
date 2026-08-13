const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { bundledPlugins } = require("./marketplace");
const { log } = require("./output");

function cursorPluginsDir() {
  return path.join(os.homedir(), ".cursor", "plugins", "local");
}

function pluginDest(name) {
  return path.join(cursorPluginsDir(), name);
}

function isInstalled(plugin) {
  const dest = pluginDest(plugin.name);
  const manifest = path.join(dest, ".cursor-plugin", "plugin.json");
  return fs.existsSync(manifest);
}

function pluginStatuses(extensionPath) {
  const { marketplace, plugins } = bundledPlugins(extensionPath);
  return {
    marketplace,
    plugins: plugins.map((plugin) => ({
      ...plugin,
      installed: isInstalled(plugin),
      destDir: pluginDest(plugin.name),
    })),
  };
}

function installCursorPlugins(extensionPath) {
  try {
    const destRoot = cursorPluginsDir();
    fs.mkdirSync(destRoot, { recursive: true });

    const { plugins } = bundledPlugins(extensionPath);
    if (plugins.length === 0) {
      return { ok: false, message: "No bundled Cursor plugins found in this VSIX." };
    }

    const installed = [];
    for (const plugin of plugins) {
      const dest = pluginDest(plugin.name);
      fs.rmSync(dest, { recursive: true, force: true });
      fs.cpSync(plugin.sourceDir, dest, { recursive: true });
      installed.push(plugin.name);
      log(`Installed ${plugin.name} → ${dest}`);
    }

    return {
      ok: true,
      installed,
      destRoot,
      message: `Installed Cursor plugins (${installed.join(", ")}) to ${destRoot}. Reload the window if they are not listed in Customize.`,
    };
  } catch (error) {
    const message = `Failed to install Cursor plugins: ${error.message}`;
    log(message);
    return { ok: false, message };
  }
}

module.exports = {
  cursorPluginsDir,
  pluginDest,
  isInstalled,
  pluginStatuses,
  installCursorPlugins,
};
