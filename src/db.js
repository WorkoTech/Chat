const { createChatroomModel } = require('./models/Chatroom');
const { createMessageModel } = require('./models/Message');
const Sequelize = require('sequelize');

const getPostgresUri = () => {
    const user = process.env.POSTGRES_USER || 'postgres';
    const password = process.env.POSTGRES_PASSWORD || '_qWj4gaGs3S3=fyD9H5ke6';
    const host = process.env.POSTGRES_HOST || 'localhost';
    const port = process.env.POSTGRES_PORT || 5432;
    const name = process.env.POSTGRES_NAME || 'chat';

    return `postgres://${user}:${password}@${host}:${port}/${name}`
}

let pgConnexionTry = 0;
const initSequelize = () => {
    return new Promise((resolve, reject) => {
        const sequelize = new Sequelize(getPostgresUri());

        return sequelize.authenticate()
            .then(() => {
                console.log('Successfuly connected to PostgreSQL.');
                createChatroomModel(sequelize);
                createMessageModel(sequelize);

                sequelize.models.Chatroom.hasMany(sequelize.models.Message, { allowNull: false, as: 'messages' });
                sequelize.models.Message.belongsTo(sequelize.models.Chatroom, { allowNull: false });

                return sequelize.sync({ alter: true }).then(() => resolve(sequelize));
            })
            .catch(err => {
                console.log('Try ' + pgConnexionTry + ' : Unable to connect to postgres ( ' + err + ', retrying...');
                pgConnexionTry += 1
                return setTimeout(() => initSequelize().then(resolve).catch(reject), 2000);
            });
    });
}

module.exports = {
    initSequelize
}
