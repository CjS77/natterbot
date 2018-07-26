const Relay = require('../relay');
const crypto = require('crypto');

class Github extends Relay {
    constructor(mattermost, config) {
        super(mattermost, { displayName: 'Github', ...config });
    }

    authorize(req, res, next) {
        if (!this.verify_signature(req)) {
            res.status(401).send({ error: 'Invalid signature' });
            return;
        }
        next();
    }

    translate(payload) {
        const repo = payload.repository || {};
        const owner = repo.owner || {};
        let s = `**Github:** ${owner.name} pushed to  [${repo.full_name}](${repo.url}) at ${repo.updated_at}\n`;
        s += `[Compare changes](${payload.compare})`;
        return s;
    }

    verify_signature(req) {
        const hmac = crypto.createHmac('sha1', this.token);
        hmac.update(JSON.stringify(req.body));
        const signature = 'sha1=' + hmac.digest('hex');
        return signature === req.headers['x_hub_signature']
    }
}

module.exports = Github;