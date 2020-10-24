const axios = require('axios');

const getUser = (id) => {
    return axios.post(`http://${process.env.IAM_HOST}:${process.env.IAM_PORT}/users/search`, {
        userIds: [ id ]
    }).then(res => res.data[0]);
}

const getUsers = (ids) => {
    return axios.post(`http://${process.env.IAM_HOST}:${process.env.IAM_PORT}/users/search`, {
        userIds: ids
    }).then(res => res.data);
}


module.exports = {
    getUser,
    getUsers
}
