#!/usr/bin/env node
const express = require('express');
const bodyParser  = require('body-parser');

const relays = require('./src/relayers');
const Mattermost = require('./src/mattermost');
const program = require('commander');

program.option('-c --config [file]', 'configuration file', 'config.js')
    .parse(process.argv);

console.log(`Loading configuration from ${program.config}`);
const config = require(`${__dirname}/${program.config}`);
const client = new Mattermost(config.mattermost);

console.log('Loading Mattermost teams');
client.get_teams().then(teams => {
    console.log('Loading channels');
    return client.get_channels(teams[0].id);
}).then(() => {
    console.log('Mattermost ready');
}).catch(err => {
    const msg = (err.response && err.response.body) || err;
    console.error(msg);
    process.exit(1);
});

const apps = {};
const natterbot = config.natterbot;
const gh = config.github;
const dh = config.dockerhub;
relays.register(apps, client, 'github', gh.channel, gh.token);
relays.register(apps, client, 'dockerhub', dh.channel, natterbot.token);


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.json({ success: true });
    console.log('GET request received');
});

app.post('/apps', function(req, res) {
    console.log('POST /apps');
    const appList = relays.available_apps();
    res.json({ success: true, apps: appList });
});

app.post('/:app', (req, res, next) => {
    console.log('Received: ' + JSON.stringify(req.url));
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

const port = config.natterbot.port;
app.listen(port);
console.log(`Webhook Server started... port: ${port}`);