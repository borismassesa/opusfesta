import React from 'react';

const UnicornStudioBackgroundBokehGradientShapeStack: React.FC = () => {
  const srcDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    html, body {
      margin: 0;
      height: 100%;
      overflow: hidden;
      background: transparent;
    }
    .unicorn-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
    }
    .unicorn-layer {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0.6;
      mix-blend-mode: screen;
    }
    .unicorn-target {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="unicorn-bg">
    <div class="unicorn-layer">
      <div
        data-us-project="WdVna2EGJHojbGLRHA52"
        data-us-dpi="1.5"
        data-us-fps="60"
        data-us-lazyload="true"
        data-us-production="true"
        class="unicorn-target"
      ></div>
    </div>
  </div>

  <script>
    (function () {
      function initUnicorn() {
        if (window.UnicornStudio && window.UnicornStudio.init) {
          if (!window.UnicornStudio.isInitialized) {
            window.UnicornStudio.init();
            window.UnicornStudio.isInitialized = true;
          }
        }
      }

      if (window.UnicornStudio && window.UnicornStudio.init) {
        initUnicorn();
        return;
      }

      if (!window.UnicornStudio) {
        window.UnicornStudio = { isInitialized: false };
      }

      if (!document.querySelector('script[data-unicorn-loader]')) {
        var s = document.createElement('script');
        s.src =
          'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.0-1/dist/unicornStudio.umd.js';
        s.setAttribute('data-unicorn-loader', 'true');
        s.onload = function () {
          initUnicorn();
        };
        (document.head || document.body).appendChild(s);
      }
    })();
  </script>
</body>
</html>`;

  return (
    <iframe
      title="UnicornStudio Background Bokeh Gradient Shape Stack"
      srcDoc={srcDoc}
      className="h-full w-full border-0"
      sandbox="allow-scripts"
    />
  );
};

export default UnicornStudioBackgroundBokehGradientShapeStack;
