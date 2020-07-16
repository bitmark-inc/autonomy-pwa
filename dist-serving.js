const express = require('express')
const app = express()
const port = 4200
const path = require('path');

app.use(express.static('./dist/autonomy'))
app.listen(port, () => console.log(`Test app listening at http://localhost:${port}`))
app.get('/*', function(req, res, next) {
    res.sendFile(path.resolve(__dirname, 'dist/autonomy/index.html'));
});