const express = require('express')
const app = express()
const port = 4200

app.use(express.static('./dist/autonomy'))
app.listen(port, () => console.log(`Test app listening at http://localhost:${port}`))
app.get("/*", function(req, res, next) {
    res.render('dist/autonomy/index.html');
});