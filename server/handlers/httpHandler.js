/**
 * HTTP Request Handler
 * Serves static files from the client directory
 */

import path from 'node:path';
import fs from 'node:fs';
import { info, error as logError } from '../utils/logger.js';

/**
 * MIME types for common file extensions
 */
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

/**
 * Serve static files from client directory
 * @param {http.IncomingMessage} req - HTTP request
 * @param {http.ServerResponse} res - HTTP response
 */
function serveFile(req, res) {
    try {
        // Prevent directory traversal attacks
        const sanitizedUrl = req.url.split('?')[0].replace(/\.\./g, '');
        
        // Determine file path
        const requestPath = sanitizedUrl === '/' ? '/index.html' : sanitizedUrl;
        const filePath = path.join(process.cwd(), '../client', requestPath);
        
        // Get file extension
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Security: Ensure file is within client directory
        const clientDir = path.join(process.cwd(), '../client');
        const normalizedPath = path.normalize(filePath);
        
        if (!normalizedPath.startsWith(clientDir)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('403 Forbidden');
            logError('Attempted directory traversal', { url: req.url });
            return;
        }

        // Read and serve file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                    info('File not found', { path: requestPath });
                } else {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('500 Internal Server Error');
                    logError('Error reading file', err);
                }
            } else {
                // Set appropriate headers
                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Content-Length': data.length,
                    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
                });
                res.end(data);
            }
        });
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        logError('Unexpected error in HTTP handler', err);
    }
}

export default serveFile;