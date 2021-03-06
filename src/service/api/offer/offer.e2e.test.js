'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const initDB = require(`../../lib/init-db`);
const offer = require(`./offer`).offerRouter;
const {OfferService, CommentService} = require(`../../data-service`);

const {HttpStatusCode} = require(`../../../constants`);

const {users, offers, offerTypes, categories} = require(`./offer-test-mock`);

const createAPI = async () => {
  const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});
  await initDB(mockDB, {users, offers, offerTypes, categories});
  const app = express();
  app.use(express.json());
  offer(app, new OfferService(mockDB), new CommentService(mockDB));
  return app;
};


describe(`API returns a list of all offers`, () => {
  let response;

  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app)
      .get(`/offers`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpStatusCode.OK));

  test(`Returns a list of 5 offers`, () => expect(response.body.length).toBe(5));

  test(`First offer's title equals "Куплю детские санки."`, () => expect(response.body[0].title).toBe(`Куплю детские санки.`));
});


describe(`API return an offer with given id`, () => {

  let response;

  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app)
      .get(`/offers/1`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpStatusCode.OK));

  test(`Offer's title is "Куплю детские санки.."`, () => expect(response.body.title).toBe(`Куплю детские санки.`));
});


describe(`API creates an offer if data is valid`, () => {
  const newOffer = {
    categories: [1, 2],
    title: `Дам погладить котика`,
    sentences: `Дам погладить котика. Дорого. Не гербалайф`,
    pictures: {
      path: `/img/item15.jpg`
    },
    sum: 100500,
    offerTypeId: 1,
    userId: 3,
  };

  let app; let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .post(`/offers`)
      .send(newOffer);
  });

  test(`Status code 201`, async () => expect(response.statusCode).toBe(HttpStatusCode.CREATED));

  test(`Offer count is changed`, async () => request(app)
    .get(`/offers`)
    .expect((res) => expect(res.body.length).toBe(6))
  );
});

describe(`API refuses to create an offer if data is invalid`, () => {
  const newOffer = {
    type: `OFFER`,
    title: `Дам погладить котика`,
    sentences: `Дам погладить котика. Дорого. Не гербалайф`,
    sum: 100500,
    picture: `cat.jpg`,
    category: `Котики`,
  };

  let app;

  beforeAll(async () => {
    app = await createAPI();
  });

  test(`Without any required property response code is 400`, async () => {
    for (const key of Object.keys(newOffer)) {
      const badOffer = {...newOffer};
      delete badOffer[key];
      await request(app)
        .post(`/offers`)
        .send(badOffer)
        .expect(HttpStatusCode.BAD_REQUEST);
    }
  });
});


describe(`API changes existent offer`, () => {
  const newOffer = {
    categories: [1, 2],
    title: `Дам погладить котика`,
    sentences: `Дам погладить котика. Дорого. Не гербалайф`,
    pictures: {
      path: `/img/item15.jpg`
    },
    type: `OFFER`,
    sum: 100500,
    offerTypeId: 1,
    userId: 3,
  };

  let app; let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .put(`/offers/2`)
      .send(newOffer);
  });

  test(`Status code 200`, async () => expect(response.statusCode).toBe(HttpStatusCode.OK));

  test(`Offer is really changed`, async () => request(app)
    .get(`/offers/2`)
    .expect((res) => expect(res.body.title).toBe(`Дам погладить котика`))
  );
});

test(`API returns status code 404 when trying to change non-existent offer`, async () => {

  const app = await createAPI();

  const validOffer = {
    categories: [1, 2],
    title: `Дам погладить котика`,
    sentences: `Дам погладить котика. Дорого. Не гербалайф`,
    pictures: {
      path: `/img/item15.jpg`
    },
    type: `OFFER`,
    sum: 100500,
    offerTypeId: 1,
    userId: 3,
  };

  return request(app)
    .put(`/offers/20`)
    .send(validOffer)
    .expect(HttpStatusCode.NOT_FOUND);
});

test(`API returns status code 400 when trying to change an offer with invalid data`, async () => {

  const invalidOffer = {
    categories: [1, 2],
    title: `Это невалидный`,
    description: `объект`,
    picture: `объявления`,
    type: `нет поля sum`
  };

  let app; let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .put(`/offers/20`)
      .send(invalidOffer);
  });

  return () => expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
});


describe(`API correctly deletes an offer`, () => {

  let app; let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .delete(`/offers/1`);
  });

  test(`Status code 200`, async () => expect(response.statusCode).toBe(HttpStatusCode.OK));

  test(`Offer count is 4 now`, async () => {

    beforeAll(async () => {
      response = await request(app)
        .get(`/offers`);
    });

    return () => expect(response.body.length).toBe(4);
  });
});

test(`API refuses to delete non-existent offer`, async () => {

  let app; let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
    .delete(`/offers/20`);
  });

  return () => expect(response.statusCode).toBe(HttpStatusCode.NOT_FOUND);
});

describe(`API returns a list of comments to given offer`, () => {

  let response;

  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app)
      .get(`/offers/2/comments`);
  });

  test(`Status code 200`, async () => expect(response.statusCode).toBe(HttpStatusCode.OK));

  test(`Returns list of 1 comments`, async () => expect(response.body.length).toBe(1));

  test(`First comment's text is "Почему в таком ужасном состоянии? Неплохо, но дорого. Совсем немного... Оплата наличными или перевод на карту? С чем связана продажа? Почему так дешёво?"`,
      async () => expect(response.body[0].text).toBe(`Почему в таком ужасном состоянии? Неплохо, но дорого. Совсем немного... Оплата наличными или перевод на карту? С чем связана продажа? Почему так дешёво?`));

});


describe(`API creates a comment if data is valid`, () => {

  const newComment = {
    text: `Валидному комментарию достаточно этого поля`
  };

  let app; let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .post(`/offers/3/comments`)
      .send(newComment);
  });


  test(`Status code 201`, async () => expect(response.statusCode).toBe(HttpStatusCode.CREATED));

  test(`Comments count is changed`, async () => request(app)
    .get(`/offers/3/comments`)
    .expect((res) => expect(res.body.length).toBe(5))
  );

});

test(`API refuses to create a comment to non-existent offer and returns status code 404`, async () => {

  let app; let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
    .post(`/offers/20/comments`)
    .send({
      text: `Неважно`
    });
  });

  return () => expect(response.statusCode).toBe(HttpStatusCode.NOT_FOUND);

});

test(`API refuses to create a comment when data is invalid, and returns status code 400`, async () => {

  let app; let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .post(`/offers/2/comments`)
      .send({});
  });

  return () => expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);

});

describe(`API correctly deletes a comment`, () => {

  let app; let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .delete(`/offers/1/comments/1`);
  });

  test(`Status code 200`, async () => expect(response.statusCode).toBe(HttpStatusCode.OK));

  test(`Comments count is 2 now`, async () => request(app)
    .get(`/offers/1/comments`)
    .expect((res) => expect(res.body.length).toBe(2))
  );

});

test(`API refuses to delete non-existent comment`, async () => {
  let app; let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .delete(`/offers/4/comments/100`);
  });

  return () => expect(response).toBe(HttpStatusCode.NOT_FOUND);
});

test(`API refuses to delete a comment to non-existent offer`, async () => {
  let app; let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .delete(`/offers/20/comments/1`);
  });

  return () => expect(response.statusCode).toBe(HttpStatusCode.NOT_FOUND);
});
