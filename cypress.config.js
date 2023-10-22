const { defineConfig } = require("cypress");

module.exports = defineConfig({
  viewportWidth: 1600,
  viewportHeight: 783,
  reporter: 'cypress-mochawesome-reporter',
  video: true,
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
    },
  },
});
