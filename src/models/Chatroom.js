const Sequelize = require('sequelize');

class Chatroom extends Sequelize.Model {}

const createChatroomModel = sequelize => {
    Chatroom.init({
        id: {
            primaryKey: true,
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        workspaceId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true
        }
    }, {
        sequelize
    });
}

module.exports = {
    Chatroom,
    createChatroomModel
}
