import express from "express";
const postgresSql = require("./db/model");
const app = express();
const port = 3030;

app.use(express.json());



app.get("/", async (req, res) => {
  try {
    const results = await postgresSql`select version()`;
    console.log(results);
    res.send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
