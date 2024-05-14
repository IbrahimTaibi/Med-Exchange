const app = require("./app");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");

dotenv.config({ path: "./config.env" });

const url = process.env.URL;
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(`Error has occured ${err}`);
  });

app.listen(url, () => {
  console.log("listening to " + url);
});
