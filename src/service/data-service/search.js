'use strict';

const {Op} = require(`sequelize`);
const Alias = require(`../db/alias`);

class SearchService {
  constructor(sequelize) {
    this._Offer = sequelize.models.Offer;
  }

  async findAll(searchText) {
    const offers = await this._Offer.findAll({
      where: {
        title: {
          [Op.substring]: searchText
        }
      },
      include: [Alias.CATEGORIES, Alias.PICTURES, Alias.OFFER_TYPES],
    });

    return offers.map((offer) => offer.get());
  }
}


module.exports = {
  SearchService,
};
