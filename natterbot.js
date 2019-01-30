#!/usr/bin/env node
const express = require('express');
const bodyParser  = require('body-parser');

const relays = require('./src/relayers');
const Mattermost = require('./src/mattermost');
const twitter = require('./src/twitter');
const program = require('commander');

program.option('-c --config [file]', 'configuration file', 'config.js')
    .parse(process.argv);

console.log(`Loading configuration from ${program.config}`);
const config = require(`${__dirname}/${program.config}`);
const client = new Mattermost(config.mattermost);
const apps = {};


let team = config.mattermost.team ? client.get_team_by_name(config.mattermost.team) : getFirstTeam(client);

function getFirstTeam(client) {
    console.log('Loading Mattermost team list ');
    return client.get_teams().then(teams => teams[0]);
}

team.then(team => {
    const {id, name} = team;
    console.log(`Loading channels for ${name}`);
    return client.get_channels(id);
}).then(() => {
    console.log('Mattermost ready');
    registerApps();
}).catch(err => {
    const msg = (err.response && err.response.body) || err;
    console.error(msg);
    process.exit(1);
});

function registerApps() {
    relays.register(apps, client, 'github', config.github);
    relays.register(apps, client, 'dockerhub', config.dockerhub);
    relays.register(apps, client, 'pagerduty', config.pagerduty);
    if (config.twitter.enabled) {
        twitter.start_stream(client, config.twitter);
    }
}


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