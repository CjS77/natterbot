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
        if (payload.action === "synchronize") { return; }
        if (!payload.action) {
            return Github.extractPush(payload);
        }
        if (payload.review) {
            return Github.extractReview(payload);
        }
        if (payload.issue && payload.comment) {
            return Github.extractIssueComment(payload);
        }
        if (payload.issue) {
            return Github.extractIssue(payload);
        }
        if (payload.pull_request) {
            return Github.extractPullRequest(payload);
        }
    }

    verify_signature(req) {
        const hmac = crypto.createHmac('sha1', this.token);
        hmac.update(JSON.stringify(req.body));
        const signature = 'sha1=' + hmac.digest('hex');
        return signature === req.headers['x-hub-signature']
    }

    static extractReview(payload) {
        const review = payload.review;
        const pr = payload.pull_request;
        let status = review.state;
        switch (review.state) {
            case 'changes_requested':
                status = 'requested changes for';
                break;
            case 'commented':
                status = 'commented on';
                break;
        }
        let result = `**Github**: Pull Request Review ${payload.action}\n`;
        result += `[${review.user.login}](${review.user.html_url}) ${status} [${pr.title}](${pr.html_url})\n`;
        result += `[See Review](${review.html_url})\n`;
        result += `[See PR diff](${pr.diff_url})`;
        return result;
    }

    static extractPush(payload) {
        const repo = payload.repository || {};
        const owner = repo.owner || {};
        let s = `**Github:** ${owner.name} pushed to  [${repo.full_name}](${repo.url}) at ${repo.updated_at}\n`;
        s += `[Compare changes](${payload.compare})`;
        return s;
    }

    static extractIssue(payload) {
        const issue = payload.issue;
        let result = `**Github:** Issue ${payload.action}: ${issue.title} on [${payload.repository.full_name}](${payload.repository.html_url})\n`;
        // "assigned", "unassigned", "labeled", "unlabeled", "opened", "edited", "milestoned", "demilestoned", "closed", or "reopened"
        switch (payload.action) {
            case 'opened':
                result += `Created by [${issue.user.login}](${issue.user.html_url})\n`;
                break;
            case 'assigned':
                result += `Assigned to [${issue.assignee.login}](${issue.assignee.html_url})\n\`;`
                break;
            default:
                result += `${payload.action} by [${issue.user.login}](${issue.user.html_url})\n`;
        }
        result += `[Issue](${issue.html_url})\n`;
        result += `[Comments](${issue.comments_url})`;
        return result;
    }

    static extractIssueComment(payload) {
        const issue = payload.issue;
        const comment = payload.comment;
        const user = comment.user;
        let result = `**Github:** Issue Comment ${payload.action}: [${issue.title}](${issue.html_url}) on [${payload.repository.full_name}](${payload.repository.html_url})\n`;
        result += `[${user.login}](${user.html_url}) says "${comment.body}"\n`;
        return result;
    }

    static extractPullRequest(payload) {
        const pr = payload.pull_request;
        let result = `**Github:** Pull Request ${payload.action}: ${pr.title} on [${payload.repository.full_name}](${payload.repository.html_url})\n`;
        result += `Created by [${pr.user.login}](${pr.user.html_url})\n`;
        result += `[Pull request](${pr.html_url})\n`;
        return result;
    }
}

module.exports = Github;