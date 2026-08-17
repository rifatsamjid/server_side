import app from "./app.js";
import config from "./config/env.js";
import { initDB } from "./db/index.js";

app.listen(config.port, () => {
  initDB();
  console.log(`Example app listening on port ${config.port}`);
});
