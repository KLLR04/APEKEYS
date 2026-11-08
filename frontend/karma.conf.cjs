/* =============================================================================
   karma.conf.cjs: configuración de las pruebas unitarias (Jasmine + Karma)
   -----------------------------------------------------------------------------
   Karma   = el "corredor": abre un navegador real y ejecuta los tests ahí.
   Jasmine = el "lenguaje" de los tests: describe(), it(), expect(), spyOn().
   Webpack + Babel = traducen TypeScript/JSX a JavaScript que el navegador entiende.
   Istanbul (babel-plugin-istanbul) = mide la cobertura y la deja en coverage/html.
   ========================================================================== */
const fs = require('fs')

// Si el PC no tiene Google Chrome, se usa Microsoft Edge (también es Chromium).
if (!process.env.CHROME_BIN) {
  const candidatos = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  ]
  const encontrado = candidatos.find((ruta) => fs.existsSync(ruta))
  if (encontrado) process.env.CHROME_BIN = encontrado
}

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'webpack'],
    files: [{ pattern: 'tests/**/*.spec.tsx', watched: false }],
    preprocessors: { 'tests/**/*.spec.tsx': ['webpack'] },

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
      module: {
        rules: [
          {
            test: /\.[jt]sx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: { chrome: '120' } }],
                  ['@babel/preset-react', { runtime: 'automatic' }],
                  '@babel/preset-typescript',
                ],
                // Cobertura solo del código de la app (src/), no de los tests.
                plugins: [['istanbul', { include: ['src/**'] }]],
              },
            },
          },
          // Imágenes, video y fuentes: en los tests basta con su URL.
          { test: /\.(png|jpe?g|gif|webp|svg|mp4|ttf|woff2?)$/i, type: 'asset/resource' },
          { test: /\.css$/, type: 'asset/source' },
        ],
      },
    },

    reporters: ['progress', 'kjhtml', 'coverage'],
    coverageReporter: {
      dir: 'coverage',
      reporters: [{ type: 'html', subdir: 'html' }, { type: 'text-summary' }],
    },

    browsers: ['ChromeHeadless'],
    singleRun: false,
    client: { clearContext: false, jasmine: { random: false } },
  })
}
