// scripts/write-wrapper.js
const fs = require('fs');
const path = require('path');

const distDir = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

// Template wrapper — must match the reserved names below
const wrapper = `// dist/index.js — readable wrapper, DO NOT OBFUSCATE
const impl = require('./core.bundle.obf.js');

// Re-export public API (explicit mapping to keep usage exactly the same)
module.exports = {
  AppStorys: impl.AppStorys,
  Banner: impl.Banner,
  Floater: impl.Floater,
  Pip: impl.Pip,
  Stories: impl.Stories,
  StoriesScreen: impl.StoriesScreen,
  PipScreen: impl.PipScreen,
  CaptureScreenButton: impl.CaptureScreenButton,
  Survey: impl.Survey,
  Csat: impl.Csat,
  Widgets: impl.Widgets,
  Modal: impl.Modal,
  BottomSheet: impl.BottomSheet,
  Measurable: impl.Measurable,
  MeasurementProvider: impl.MeasurementProvider
};
`;

fs.writeFileSync(path.join(distDir, 'index.js'), wrapper, 'utf8');
console.log('Wrote dist/index.js (wrapper).');
