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
            let row = `${this._getStatusDisplay(incident.status)} - ${incident.title}\n`;
            row += `[${incident.incident_number}] ${incident.html_url}\n`;
            row += `${incident.description}\n\n`;
            response += row;
        });
        return response;
    }

    _getStatusDisplay(status) {
        let display = status;
        switch (status) {
            case 'triggered':
                display = '🔔';
                break;
            case 'acknowledged':
                display = '👍';
                break;
            case 'resolved':
                display = '🎉 ✅';
                break;
        }
        return display;
    }
}

module.exports=PagerDuty;
