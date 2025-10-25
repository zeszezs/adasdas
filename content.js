(function() {
  'use strict';

  // Canvas Spoofing: Add noise to getImageData to change fingerprint
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type, ...args) {
    const ctx = originalGetContext.apply(this, [type, ...args]);
    if (type === '2d') {
      const originalGetImageData = ctx.getImageData;
      ctx.getImageData = function(...args) {
        const imageData = originalGetImageData.apply(this, args);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          data[i] += Math.floor(Math.random() * 3) - 1;     // Red
          data[i + 1] += Math.floor(Math.random() * 3) - 1; // Green
          data[i + 2] += Math.floor(Math.random() * 3) - 1; // Blue
          data[i] = Math.max(0, Math.min(255, data[i]));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
        }
        return imageData;
      };
    }
    return ctx;
  };

  // WebGL Spoofing: Override vendor and renderer
  const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
  WebGLRenderingContext.prototype.getParameter = function(param) {
    if (param === 37445) { // UNMASKED_VENDOR_WEBGL
      return 'Intel Inc.';
    }
    if (param === 37446) { // UNMASKED_RENDERER_WEBGL
      return 'Intel Iris OpenGL Engine';
    }
    return originalGetParameter.apply(this, arguments);
  };

  // Audio Spoofing: Override OfflineAudioContext
  const OriginalOfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (OriginalOfflineAudioContext) {
    window.OfflineAudioContext = function(channels, length, sampleRate) {
      const context = new OriginalOfflineAudioContext(channels, length, sampleRate);
      const originalStartRendering = context.startRendering;
      context.startRendering = function() {
        return originalStartRendering.apply(this, arguments).then(buffer => {
          const channelData = buffer.getChannelData(0);
          for (let i = 0; i < channelData.length; i++) {
            channelData[i] += (Math.random() * 0.0001) - 0.00005;
          }
          return buffer;
        });
      };
      return context;
    };
  }

  // Spoof AudioContext timestamps
  const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;
  if (OriginalAudioContext) {
    window.AudioContext = function() {
      const ctx = new OriginalAudioContext();
      const originalGetOutputTimestamp = ctx.getOutputTimestamp;
      ctx.getOutputTimestamp = function() {
        return { contextTime: 0, performanceTime: 0 };
      };
      return ctx;
    };
  }

  // Screen Resolution Spoofing: Set to 1920x1080
  Object.defineProperty(window.screen, 'availWidth', { get: () => 1920 });
  Object.defineProperty(window.screen, 'width', { get: () => 1920 });
  Object.defineProperty(window.screen, 'availHeight', { get: () => 1080 });
  Object.defineProperty(window.screen, 'height', { get: () => 1080 });
  Object.defineProperty(window, 'innerWidth', { get: () => 1920 });
  Object.defineProperty(window, 'innerHeight', { get: () => 974 });
  Object.defineProperty(window, 'outerWidth', { get: () => 1920 });
  Object.defineProperty(window, 'outerHeight', { get: () => 1040 });
  Object.defineProperty(window, 'devicePixelRatio', { get: () => 1 });

  // Hardware Concurrency Spoofing
  Object.defineProperty(navigator, 'hardwareConcurrency', {
    get: () => Math.floor(Math.random() * 7) + 2
  });
})();
