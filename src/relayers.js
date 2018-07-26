const requireDir = require('require-dir');
const relayers = requireDir('./apps');

function available_apps() {
    return Object.keys(relayers);
}

/**
 * Register a webhook app
 * @param apps An apps map object
 * @param mattermost {MatterMost} Mattermost client
 * @param app {string} The app name
 * @param channel {string} The channel to post message in
 * @param token {string} security token
 */
function register(apps, mattermost, app, channel, token) {
    const appClass = relayers[app];
    if (!appClass) {
        console.log(`${app} replayer not found`);
    }
    let config = {
        appName: app,
        channel: channel,
        token: token
    };
    const instance = new appClass(mattermost, config);
    console.log(`${app} registered in #${channel}`);
    apps[app] = instance;
    return instance;
}

module.exports = {available_apps, register};
