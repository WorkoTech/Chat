const jwt = require('jsonwebtoken');
const { getUserWorkspaces } = require('./api/workspaces');
const { getUser } = require('./api/users');
const { Message } = require('./models/Message');
const { Chatroom } = require('./models/Chatroom');

let onlineUserIds = [];

module.exports = {
    onlineUserIds,
    isUserOnline: (id) => {
        console.log('isUserOnline : ', onlineUserIds);
        return onlineUserIds.find(uId => uId === id) !== undefined;
    },
    handler: (io) => {
        return (ws) => {
            // CHECK TOKEN
            if (!ws.handshake.query.token) {
                ws.disconnect();
                return ;
            }

            // DECODE IT
            const splitedToken = ws.handshake.query.token.split(' ').map(x => x.trim())
            let token = jwt.decode(splitedToken[1]);
            if (!token || !token.userId) {
                console.log('Got wrongly formatted token');
                ws.disconnect();
                return;
            }

            // EVENT TO JOIN / LEAVE CHANNELS
            ws.on('join', channel => {
                console.log(`User ${token.userId} joining channel ${channel}`);
                ws.join(channel);
            });

            ws.on('leave', channel => {
                console.log(`User ${token.userId} leaving channel ${channel}`);
                ws.leave(channel);
            });

            ws.on('message', msg => {
                if (!msg || !msg.ChatroomId || !msg.content) {
                    console.log("Wrongly formed message", msg);
                    return;
                }

                console.log('got message', msg);
                const raw = {
                    authorId: token.userId,
                    ...msg
                }
                let newMessage;
                Message.create(raw).then(res => {
                    console.log('message saved : ', res);
                    newMessage = res;
                    return getUser(newMessage.authorId)
                }).then(user => {
                    io.in(msg.ChatroomId).emit('new message', {
                        ...newMessage.dataValues,
                        author: user
                    });
                }).then(
                    x => console.log('x', x)
                ).catch(err => {
                    console.error(err);
                })
            });

            // ON DISCONNECT, LEAVE EVERY ROOMS AND NOTIFY THAT IS ONLINE
            ws.on('disconnect', () => {
                ws.broadcast.emit('USER_LOGGED_OUT', { id: token.userId });
                onlineUserIds = onlineUserIds.filter(id => id != parseInt(token.userId));
            });


            // ON CONNECTION

            // GET USER WORKSPACE
            getUserWorkspaces(ws.handshake.query.token).then(
                workspaces => {
                    // USER JOIN EVERY WORKSPACE CHATROOM
                    return Promise.all(workspaces.map(workspace => {
                        return Chatroom.findOrCreate({
                            where: { workspaceId: workspace.id }
                        }).then(res => {
                            const chatroom = res[0]; // res[0] result from frindorcreate, res[1] created (bool)
                            return new Promise((resolve, reject) => {
                                console.log('joining chatroom id :', chatroom.id);
                                ws.join(chatroom.id, resolve);
                            });
                        })

                    }));
                }
            ).then(
                () => {
                    // EMIT EVENT TO SAY THAT USER IS ONLINE
                    onlineUserIds.push(parseInt(token.userId));
                    ws.broadcast.emit('USER_LOGGED_IN', { id: token.userId });
                }
            );
        }
    }
}
