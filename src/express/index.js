'use strict';
const express = require(`express`);
const path = require(`path`);
const {mainRouter} = require(`./routes/main-routes`);
const {HttpStatusCode} = require(`../constants.js`);
const {getLogger} = require(`../service/lib/logger`);


// Инициализация сервера...
const {
  DEFAULT_PORT_FRONT,
  PROJECT_DIR,
  PUBLIC_DIR,
  UPLOAD_DIR,
  TEMPLATES_DIR
} = require(`../../settings`);

const DEFAULT_PORT = process.env.PORT || DEFAULT_PORT_FRONT;

const logger = getLogger({name: `EXPRESS`});
const app = express();

app.use(`/`, mainRouter);
app.use(express.static(path.resolve(PROJECT_DIR, PUBLIC_DIR)));
app.use(express.static(path.resolve(PROJECT_DIR, UPLOAD_DIR)));

app.use((req, res) => res.status(HttpStatusCode.BAD_REQUEST).render(`errors/404`));

app.use((err, _req, res, _next) => {
  logger.error(`errors/500: ${err}`);
  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).render(`errors/500`);
});

app.set(`views`, path.resolve(PROJECT_DIR, TEMPLATES_DIR));
app.set(`view engine`, `pug`);

app.listen(DEFAULT_PORT,
    () => logger.info(`Сервер запущен на порту: ${DEFAULT_PORT}`));
