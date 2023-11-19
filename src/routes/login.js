const { generateToken } = require('../extra/Utils');
const { user: userSchema } = require('../extra/Schemas');
const { main_domain } = require('../../settings.json');

const AuthHelper = require('../helpers/AuthHelper');

module.exports = (database) => ({
    method: 'GET',
    path: '/login',
    schema: {},
    config: {
        rateLimit: {
            max: 2,
            timeWindow: '5s'
        }
    },
    async handler(request, response) {
        const code = request.query?.code;
        if(!code) return response
            .code(400)
            .send({ error: true, reason: 'Please return to the login page and try again' });

        const process = new AuthHelper();

        const { error } = await process.authCodeGrant(code);
        if(error) return response
            .code(400)
            .send({ error: true, reason: 'Please return to the login page and try again' });

        const { id, username } = await process.getUserInfo();

        const user = await database
            .collection('users')
            .findOne(
                { 
                    userID: id 
                }, 
                { 
                    projection: { 
                        _id: 0,
                        userID: 0,
                        username: 0
                    } 
                }
            );
        
        const token = user?.token || generateToken();

        await database
            .collection('users')
            .updateOne(
                {
                    userID: id
                },
                {
                    $set: {
                        token,
                        userID: id,
                        username: username,
                        cooldown: user?.cooldown ?? userSchema.cooldown, 
                        tag: user?.tag ?? userSchema.tag, 
                        badges: user?.badges ?? userSchema.badges,
                        points: user?.points ?? userSchema.points
                    }
                },
                { upsert: true }
            );

        process.joinPixelateitServer();

        return response
            .redirect(`https://${main_domain}/?token=${token}&id=${id}`);
    }
});