const axios = require('axios');

const getUserWorkspaces = (token) => {
    const url = `http://${process.env.WORKSPACE_HOST}:${process.env.WORKSPACE_PORT}/workspace/`
    return axios.get(url, {
        headers: {
            'Authorization': token
        }
    }).then(res => res.data);
}

module.exports = {
    getUserWorkspaces
};
