#!/usr/bin/env node

const fs = require('fs');
const url = require('url');

const method = process.env.REQUEST_METHOD;
const contentType = process.env.CONTENT_TYPE || '';
const queryString = process.env.QUERY_STRING || '';

// Parse query string if present
const query = url.parse(queryString ? '?' + queryString : '', true).query;

// Read POST data from stdin
let body = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
    body += chunk;
});

process.stdin.on('end', () => {
    try {
        let inputstr = '';
        let outputFile = '';
        let responsePrefix = '';
        
        // Determine processing method based on Content-Type
        if (method === 'POST' && contentType.includes('application/json')) {
            // JSON POST handling
            const data = JSON.parse(body);
            inputstr = data.inputstr || '';
            outputFile = '/usr/local/apache2/htdocs/inputstr_post.txt';
            responsePrefix = '[CGI-JSON]';
        } else if (method === 'POST' && contentType.includes('application/x-www-form-urlencoded')) {
            // Form data handling
            const params = new URLSearchParams(body);
            inputstr = params.get('inputstr') || '';
            outputFile = '/usr/local/apache2/htdocs/inputstr.txt';
            responsePrefix = '[CGI-FORM]';
        } else if (method === 'GET' && query.inputstr) {
            // GET query handling
            inputstr = query.inputstr;
            outputFile = '/usr/local/apache2/htdocs/inputstr.txt';
            responsePrefix = '[CGI-GET]';
        } else {
            // Unsupported method or missing data
            console.log('Status: 400 Bad Request\n');
            console.log('Content-Type: text/plain\n');
            console.log('Error: Invalid request. Expected POST with form data or JSON, or GET with query parameter.');
            process.exit(0);
        }
        
        // Save to disk
        fs.writeFileSync(outputFile, inputstr + '\n', { flag: 'a' });
        
        // Send CGI response
        console.log('Content-Type: text/plain\n');
        console.log(`${responsePrefix} String "${inputstr}" saved to ${outputFile} at ${new Date().toISOString()}`);
        
    } catch (error) {
        console.log('Status: 500 Internal Server Error\n');
        console.log('Content-Type: text/plain\n');
        console.log('Error: ' + error.message);
    }
});
