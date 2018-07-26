module.exports = {
    natterbot: {
        port: 5000,
        token: process.env.SECURITY_TOKEN
    },
    mattermost: {
        api_url: process.env.MATTERMOST_URL,
        personal_token: process.env.MATTERMOST_TOKEN
    },
    github: {
        token: process.env.GITHUB_TOKEN,
        channel: 'town-square'
    }
};