const Relay = require('../relay');

class PagerDuty extends Relay {
    constructor(mattermost, config) {
        super(mattermost, {displayName: 'Pager Duty', ...config});
    }

    translate(payload) {
        const messages = (payload && payload.messages) || [];
        let response = '';
        messages.forEach(message => {
            const {incident} = message;
            let row = `*Incident*: [${incident.incident_number}] ${incident.title}\n`;
            row += `${incident.description}`;
            row += `${incident.status} - ${incident.html_url}\n\n`;
            response += row;
        });
        return response;
    }
}

module.exports=PagerDuty;