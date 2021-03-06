'use strict';
const Alias = require(`../alias`);

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(Alias.OFFERS, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sentences: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      sum: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, _Sequelize) => {
    await queryInterface.dropTable(Alias.OFFERS);
  }
};
