const app = require('./app');
const port = 3000;

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});