const request = require('superagent');

class Mattermost {
    constructor(config) {
        this.api_url = config.api_url;
        this.personal_token = config.personal_token;
        this.teams = null;
        this.channel_map = null;
    }

    /**
     * Make a generic API call. Returns a promise
     * @param method, GET, POST etc
     * @param endpoint 'users', 'channels' etc
     * @param data - a JSON object that will get added to post requests
     */
    api(method, endpoint, data) {
        const req = request(method.toUpperCase(), `${this.api_url}/${endpoint}`)
            .accept('json')
            .set('Authorization', `Bearer ${this.personal_token}`);
        if (data) {
            req.send(data);
        }
        return req.then(res => {
            return res.body;
        });
    }

    /**
     * Only returns the public teams, unless this is an admin user
     */
    get_teams(force = false) {
        if (!force && this.teams) {
            return Promise.resolve(this.teams);
        }
        return this.api('get', 'teams').then(teams => {
            this.teams = teams;
            return teams;
        });
    }

    get_team_by_name(teamName) {
        return this.api('get', `teams/name/${teamName}`);
    }

    get_users() {
        return this.api('get', 'users');
    }

    get_channels(teamId) {
        let p = Promise.resolve(teamId);
        if (!teamId) {
            p = this.get_teams(true).then(teams => teams[0].id);
        }
        return p.then(id => {
            return this.api('get', `teams/${id}/channels?per_page=250`);
        }).then(channels => {
            this.channel_map = {};
            channels.forEach(ch => {
                this.channel_map[ch.name] = {
                    id: ch.id,
                    name: ch.name,
                    displayName: ch.display_name
                }
            });
        });
    }

    /**\
     * Post a message to a public channel
     * @param channel - the channel name (as a slug)
     * @param message - can be markdown
     * @param reloadChannels - force reload of channels before attempting to post
     * @returns {Promise<void>}
     */
    create_post(channel, message, reloadChannels = false) {
        const p = (!this.channel_map || reloadChannels) ? this.get_channels() : Promise.resolve();
        return p.then(() => {
            const ch = this.channel_map[channel];
            if (!ch) {
                return Promise.reject(new Error(`Unknown channel: ${channel}`));
            }
            const data = {
                channel_id: ch.id,
                message: message
            };
            return this.api('post', 'posts', data);
        });
    }
}

module.exports = Mattermost;