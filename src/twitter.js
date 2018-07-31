const Twitter = require('twitter');

function start_stream(mattermost, config) {
    const client = new Twitter({
        consumer_key: config.consumer_key,
        consumer_secret: config.consumer_secret,
        access_token_key: config.access_token_key,
        access_token_secret: config.access_token_secret
    });

    const stream = client.stream('statuses/filter', {track: config.filter});
    stream.on('data', event => {
        if (event.lang !== 'en') {
            return;
        }
        const follow_count = event.user.followers_count || 0;
        if (follow_count < config.min_followers) {
            return;
        }
        const post = extractPost(event);
        mattermost.create_post(config.channel, post, false).then(msg => {
            console.log(`Tweet relayed. #${msg.id}`);
        }).catch(err => {
            console.log(`Tweet relay failed ${err.message}`);
            console.log(`Failed Post:\n${post}`);
        });
    });

    stream.on('error', function (error) {
        console.error(error);
    });

    return stream;
}

function extractPost(event) {
    const u = event.user;
    const desc = (u.name && ` (${u.name})`) || '';
    const followers = u.followers_count;

    let s = `**Tweet** from [@${u.screen_name}${desc}](https://twitter.com/${u.screen_name}). ${followers} followers.\n`;
    // Just extract the link if it's there
    const m = event.text.match(/https:\/\/t\.co\/\w*$/)
    if (m !== null) {
        s += m[0];
    } else {
        s += event.text;
    }
    return s;
}

module.exports = {
    start_stream
};
