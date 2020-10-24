const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

const { HttpError } = require('../errors');
const { getUserWorkspaces } = require('../api/workspaces');
const { getUsers } = require('../api/users');
const { Chatroom } = require('../models/Chatroom');
const { Message } = require('../models/Message');
const { isUserOnline } = require('../chatHandler');

router.get('/', (req, res, next) => {
    const rawToken = req.header('Authorization') || '';
    const splitedToken = rawToken.split(' ').map(x => x.trim())
    if (splitedToken.length < 2) {
        next(new HttpError(403, 'Forbidden'));
        return;
    }
    const token = jwt.decode(splitedToken[1]);

    let userWorkspaces;
    getUserWorkspaces(rawToken)
        .then(workspaces => {
            console.log("USER WORKSPACE : ", workspaces);
            userWorkspaces = workspaces;
            // GET CHATROOMS WITH THEIR MESSAGES

            return Promise.all(workspaces.map(workspace =>
                Chatroom.findOrCreate({
                    where: {
                        workspaceId: workspace.id
                    },
                    include: [{
                        model: Message,
                        as: 'messages'
                    }]
                }).then(([chatroom, created]) => chatroom)
            ));
        }).then(chatrooms => {
            console.log("chatrooms : ", chatrooms)
            // ADD USER DETAILS IN MESSAGES
            // get users ids to search for
            const userIds = [];
            chatrooms.forEach(room => {
                if (!room.messages)
                    room.messages = [];

                room.messages.forEach(message => {
                    userIds.push(message.authorId);
                });
            });

            // fill messages info
            return getUsers(userIds).then(users => {
                chatrooms = chatrooms.map(room => {
                    room.messages = room.messages.map(message => {
                        const author = users.find(user => user.id === message.authorId);
                        message.dataValues.author = author;
                        return message;
                    });
                    const workspace = userWorkspaces.find(workspace => workspace.id == room.workspaceId);
                    room.dataValues.users = workspace.users.map(user => {
                        console.log('token : ', token);
                        console.log('user.id : ', user.id);
                        console.log('isUserOnline : ', isUserOnline(user.id));
                        return {
                            ...user,
                            online: user.id === parseInt(token.userId) ? true : isUserOnline(user.id)
                        }
                    });
                    return room;
                });
                res.status(200).json(chatrooms);
            });
        }).catch(err => {
            if (err instanceof HttpError) {
                next(err);
            } else {
                // UNEXPECTED ERROR
                console.error('Unexpected error : ', err);
                next(new HttpError(500, 'Internal Server Error'));
            }
        });
});

module.exports = router;
