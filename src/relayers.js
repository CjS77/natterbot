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
 * @param cfg {object} The config object
 */
function register(apps, mattermost, app, cfg) {
    if (cfg.enabled === false) {
        console.log(`${app} is disabled. Skipping registration`);
        return null;
    }
    const appClass = relayers[app];
    if (!appClass) {
        console.log(`${app} replayer not found`);
    }
    let config = {
        appName: app,
        channel: cfg.channel,
        token: cfg.token
    };
    const instance = new appClass(mattermost, config);
    console.log(`${app} registered in #${cfg.channel}`);
    apps[app] = instance;
    return instance;
}

module.exports = {available_apps, register};
