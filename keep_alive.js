const express = require('express');
const app = express();
let keep_alive = () => {
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });
}
app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
module.exports = keep_alive