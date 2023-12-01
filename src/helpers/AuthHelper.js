const fetch = require('node-fetch');
const { clientSecret, clientId, guildId, api_domain, token } = require('../../settings.json');

class AuthHelper {
    async authCodeGrant(code) {
        const data = await fetch(
            'https://discord.com/api/oauth2/token',
            {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: clientId,
					client_secret: clientSecret,
					code,
					grant_type: 'authorization_code',
					redirect_uri: `${api_domain}/login`,
					scope: 'identify guilds.join',
                }).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        ).then(res => res.json());

        this.token_type = data.token_type;
        this.access_token = data.access_token;

        return data;
    }

    async getUserInfo() {
        const data = await fetch(
            'https://discord.com/api/users/@me',
            {
                method: 'GET',
                headers: { 
                    'Content_Type': 'application/json', 
                    Authorization: `${this.token_type} ${this.access_token}` 
                }
            }
        ).then(res => res.json());

        this.user_id = data.id;
        return data;
    }

    async joinPixelateitServer() {
        return await fetch(
            `https://discord.com/api/guilds/${guildId}/members/${this.user_id}`,
            {
                method: "PUT",
                body: JSON.stringify({
                    access_token: this.access_token
                }),
                headers: { 
                    'Content-Type': 'application/json', 
                    Authorization: `Bot ${token}`
                }
            }
        ).catch(() => {});
    }
}

module.exports = AuthHelper;