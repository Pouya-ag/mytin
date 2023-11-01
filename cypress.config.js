const { defineConfig } = require("cypress");
const { Client } = require("pg");

module.exports = defineConfig({
  viewportWidth: 1600,
  viewportHeight: 783,
  reporter: 'cypress-mochawesome-reporter',
  video: true,
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      on("task", {
        async connectDB(query){
          const client = new Client({
            user: "pouya_agh",
            password: "vfdasverEWCF#@$",
            host: "192.168.7.149",
            database: "Dispatch",
            ssl: false,
            port: 5432
          })
          await client.connect()
          const res = await client.query(query)
          await client.end()
          return res.rows;
        }
      })
    },
  },
});
