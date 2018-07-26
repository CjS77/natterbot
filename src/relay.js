/**
 * config {object}
 * config.appName {string} The name used to identify this app in the url
 * config.displayName {string} User-friendly display name
 * config.channel {string} The channel to post messages in
 * config.token {string} A Security token
 */
class Relay {
    constructor(mattermost, config) {
        this.mattermost = mattermost;
        this.name = config.appName;
        this.displayName = config.displayName;
        this.channel = config.channel || 'town-square';
        this.token = config.token;
    }

    translate(input) {
        let s = "";
        try {
            s = JSON.stringify(input);
        } catch (err) {
            s = "Invalid JSON input";
        }
        return `${this.displayName} received: ${s}`;
    }

    /**
     * Default authorization middleware. Override for custom checking
     */
    authorize(req, res, next) {
        if (req.body.token !== this.token) {
            res.status(401).send({ error: 'Unauthorized' });
            return;
        }
        next();
    }

    handle(req, res) {
        const body = Object.assign({}, req.body);
        delete body.token;
        console.log(`${new Date()}: ${this.name}`, body);
        const out = this.translate(body);
        this.mattermost.create_post(this.channel, out, false)
            .then(msg => {
                res.status(200)
                    .json({
                        success: true,
                        msg_id: msg.id
                    });
            })
            .catch(err => {
                const mm_res = err.response;
                res.status(400)
                    .json({
                        mattermost_status: mm_res.status,
                        success: false,
                        reason: mm_res.body.message
                    });
            });

    }
}

module.exports = Relay;