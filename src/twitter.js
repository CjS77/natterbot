const Twitter = require('twitter');

function start_stream(filter) {
    const client = new Twitter();

    const stream = client.stream('statuses/filter', {track: filter});
    stream.on('data', function (event) {
        console.log(event && event.text);
    });

    stream.on('error', function (error) {
        throw error;
    });

    return stream;
}

module.exports = {
    start_stream
};
