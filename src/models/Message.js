const Sequelize = require('sequelize');

class Message extends Sequelize.Model {}

const createMessageModel = sequelize => {
    Message.init({
        id: {
            primaryKey: true,
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        authorId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        content: {
            type: Sequelize.TEXT,
            allowNull: false
        }
    }, {
        sequelize
    });
}

module.exports = {
    Message,
    createMessageModel
}
