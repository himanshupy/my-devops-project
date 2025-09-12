const express = require('express');
const os = require('os');

const app = express();
const port = process.env.PORT || 3000;
const version = process.env.APP_VERSION || 'dev';

app.get('/', (req, res) => {
  res.type('text/plain').send(
    `Hello from version ${version}\n` +
    `Host: ${os.hostname()}\n` +
    `Time: ${new Date().toISOString()}\n`
  );
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
