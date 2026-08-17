import app from "./app.js";
import config from "./config/env.js";
import { initDB } from "./db/index.js";

const main = () => {
  initDB();
  app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`);
  });
};

main();
