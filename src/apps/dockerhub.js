const Relay = require('../relay');

class DockerHub extends Relay {
    constructor(mattermost, config) {
        super(mattermost, {displayName: 'Docker Hub', ...config});
    }

    translate(payload) {
        const repo = (payload && payload.repository) || {};
        return `*Docker hub*: [New docker image](${repo.repo_url}) for ${repo.repo_name} is ready.`;
    }
}

module.exports=DockerHub;