module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.runtime.js',
      './spec/socket.io.js',
      './public/werewolfclient.js',
      './public/templates.js',
      './spec/client-spec.js'
    ],
    exclude: [
    ],
    preprocessors: {
      '**/*.hbs': 'handlebars'
    },
    reporters: ['dots'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: true,
    handlebarsPreprocessor:{templates: "Handlebars.templates"}
  });
};