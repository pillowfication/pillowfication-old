const path = require('path');
const express = require('express');
const app = express();
const port = +process.argv[2] || 80;

app.use(express.static(path.join(__dirname, 'www')));

app.listen(port, function () {
  console.log(`App started on port ${port}`);
});
