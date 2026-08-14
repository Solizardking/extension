# Clawd plugin template

Cursor plugins live in `plugins/`. Validate with `npm run validate`.

The Visual Studio Code / Marketplace extension is a separate webpack package in [`extension/`](extension/). Package it with:

```bash
cd extension
npm install
npm run package
```

That produces `clawd-1.0.2.vsix`. Upload that file from [Visual Studio Marketplace publisher management](https://marketplace.visualstudio.com/manage/publishers/clawd).
