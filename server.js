const path = require('path')
const express = require('express')
const app = express()
const port = process.argv[2] || process.env.PFN_OLD_PORT || 80

app.use(express.static(path.join(__dirname, 'www')))
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'www', 'error_pages', '404.html'))
})

app.listen(port, () => {
  console.log(`App started on port ${port}`)
})
