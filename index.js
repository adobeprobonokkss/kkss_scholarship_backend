
const app = require('./dist/app').default;

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
