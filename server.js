const path = require('path')
const express = require('express')
const favicon = require('serve-favicon')

const app = express()
const port = process.argv[2] || process.env.PFN_OLD_PORT || 80

app.use(favicon(path.resolve(__dirname, 'www/favicon.ico')))
app.use(express.static(path.resolve(__dirname, 'www')))
app.use((_, response) => {
  response
    .status(404)
    .sendFile(path.resolve(__dirname, 'www/error_pages/404.html'))
})

app.listen(port, () => {
  console.log(`pillowfication-old started on port ${port}`)
})
