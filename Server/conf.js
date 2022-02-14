module.exports.headers = {
    jpg: {
        'Content-Type': 'image/jpg',
        'Access-Control-Allow-Origin': '*',
    },
    png: {
        'Content-Type': 'image/png',
        'Access-Control-Allow-Origin': '*',
    },
    css: {
        'Content-Type': 'text/css',
        'Access-Control-Allow-Origin': '*',
    },
    html: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
    },
    js: {
        'Content-Type': 'application/javascript',
        'Access-Control-Allow-Origin': '*',
    },
    json: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
    },
    sse: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive'
    },
    options: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': 86400
    },
    internalError: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain'
    },
    text: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain'
    }
}