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
        enabled: true,
        token: process.env.GITHUB_TOKEN,
        channel: 'town-square'
    },
    dockerhub: {
        enabled: true,
        token: process.env.DOCKERHUB_TOKEN,
        channel: "town-square"
    },
    twitter: {
        enabled: true,
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        bearer_token: null,
        filter: 'natterbot',
        channel: 'twitterati',
        min_followers: 10
    }
};