// dist/index.js — readable wrapper, DO NOT OBFUSCATE
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
