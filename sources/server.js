const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.static(path.join(__dirname)));
app.use(express.json({ limit: '10mb' }));

app.post('/write-json', (req, res) => {
    const data = req.body; // JSON data sent from the frontend

    // Define the file path
    const filePath = path.resolve(__dirname, 'objectRequest.json');

    // Write the data to the file
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8', (err) => {
        if (err) {
            console.error('Error writing JSON to file:', err);
            return res.status(500).send({ error: 'Failed to write file' });
        }

        console.log(`JSON written successfully to ${filePath}`);
        res.send({ message: 'File written successfully' });
    });
});

app.get('/online/:sessionNumber', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/detail.html'));
});

app.get('/online/templates/pdf-report.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/templates/pdf-report.html'));
});
app.get('/online/templates/pdf-report-params.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/templates/pdf-report-params.html'));
});
app.get('/online/templates/pdf-report.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/templates/pdf-report.css'));
});


app.get('/submiter/:pdbid', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/submiter.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});