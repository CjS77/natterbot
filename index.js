const express = require('express');
const bodyParser  = require('body-parser');

const PORT = (process.env.PORT || 5000);
const app = express();
const SECURITY_TOKEN = process.env.SECURITY_TOKEN;
const relays = require('./src/relayers');
const Mattermost = require('./src/mattermost');

const client = new Mattermost({
    personal_token: process.env.MATTERMOST_TOKEN
});

console.log('Loading Mattermost teams');
client.get_teams().then(teams => {
    console.log('Loading channels');
    return client.get_channels(teams[0].id);
}).then(() => {
    console.log('Mattermost ready');
}).catch(err => {
    console.error(err.response.body);
    process.exit(1);
});

const apps = {};
relays.register(apps, client, 'github', 'tari-eng', process.env.GITHUB_TOKEN);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.json({ success: true });
    console.log('GET request received');
});

app.post('/apps', function(req, res) {
    const appList = relays.available_apps();
    res.json({ success: true, apps: appList });
    console.log('GET /apps');
});

app.post('/:app', (req, res, next) => {
    console.log('Received: ' + JSON.stringify(req.body));
    const app = apps[req.params.app];
    if (!app) {
        res.status(404)
            .json({success: false, app: req.params.app, reason: "App not found"});
        return;
    }
    req.app = app;
    app.authorize(req, res, next)
});

app.post('/:app', (req, res) => {
    req.app.handle(req, res);
});

app.listen(PORT);
console.log(`Webhook Server started... port: ${PORT}`);