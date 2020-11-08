'use strict';

const {Router} = require(`express`);

const {offersRouter} = require(`./offers-routes`);
const {myRouter} = require(`./my-routes`);

const mainRouter = new Router();

mainRouter.get(`/`, (req, res) => res.render(`main/main`, {title: `Куплю Продам`}));
mainRouter.get(`/register`, (req, res) => res.render(`main/sign-up`));
mainRouter.get(`/login`, (req, res) => res.render(`main/login`));
mainRouter.get(`/search`, (req, res) => res.render(`main/search`));

mainRouter.use(`/offers`, offersRouter);
mainRouter.use(`/my`, myRouter);

module.exports = {
  mainRouter,
};
