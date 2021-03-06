'use strict';

const {Router} = require(`express`);
const multer = require(`multer`);
const {nanoid} = require(`nanoid`);
const Alias = require(`../../service/db/alias`);

const {
  FrontDir: {
    UPLOAD_IMAGES_DIR
  }
} = require(`../../constants.js`);

const {getLogger} = require(`../../service/lib/logger`);
const logger = getLogger({name: `OFFER-ROUTER`});

const storage = multer.diskStorage({
  destination: UPLOAD_IMAGES_DIR,
  filename: (req, file, cb) => {
    const uniqeName = nanoid(10);
    const extension = file.originalname.split(`.`).pop();
    cb(null, `${uniqeName}.${extension}`);
  }
});

const upload = multer({storage});

const api = require(`../api`).getAPI();
const offersRouter = new Router();

offersRouter.get(`/category/:categoryId`, async (req, res) => {
  const {categoryId} = req.params;

  const [
    apiOffersToCategoryData,
    apiCategoriesData
  ] = await Promise.all([
    api.getOffersToCategory(categoryId),
    api.getCategories({count: true})
  ]);

  const currentCategory = apiCategoriesData.find((it) => it.id === Number.parseInt(categoryId, 10));

  res.render(`offers/category`, {currentCategory, apiOffersToCategoryData, apiCategoriesData});
});

offersRouter.get(`/add`, async (req, res) => {
  const apiCategoriesData = await api.getCategories();
  res.render(`offers/new-ticket`, {apiCategoriesData});
});

offersRouter.post(`/add`, upload.single(`avatar`), async (req, res) => {
  const {body, file} = req;
  const offerData = {
    [Alias.PICTURES]: file.filename,
    sum: body.price,
    type: body.action,
    sentences: body.comment,
    title: body[`ticket-name`],
    category: body.category,
    offerTypeId: 1,
    userId: 1,
    createDate: new Date(),
  };

  try {
    await api.createOffer(offerData);
    res.redirect(`/my`);
  } catch (error) {
    logger.error(error.message);
    res.redirect(`back`);
  }
});

offersRouter.get(`/edit/:id`, async (req, res) => {
  const {id} = req.params;
  const [apiOfferData, apiCategoriesData] = await Promise.all([
    api.getOffer(id, {comments: false}),
    api.getCategories({count: false})
  ]);
  res.render(`offers/ticket-edit`, {apiOfferData, apiCategoriesData});
});

offersRouter.get(`/:id`, async (req, res) => {
  const {id} = req.params;
  const apiOfferData = await api.getOffer(id, true);
  res.render(`offers/ticket`, {apiOfferData});
});

module.exports = {
  offersRouter,
};
