/* Handler for http request */

import path from 'node:path';
import fs from 'node:fs';

function serverFile(req, res) {
    let filePath = path.join(process.cwd(), '../client', req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath).toLocaleLowerCase();

    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.json': 'application/json'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

export default serverFile;