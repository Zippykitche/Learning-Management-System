require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const connectMongo = require("./config/mongo");
const pool = require("./config/postgres");
connectMongo();
pool.connect()
  .then(() => console.log("PostgreSQL connected"))
  .catch(err => console.error(err));

app.get("/", (req, res) => {
  res.send("LMS API is running...");
});

app.use("/auth", require("./modules/auth/auth.routes"));
app.use("/courses", require("./modules/courses/courses.routes"));
app.use("/lessons", require("./modules/lessons/lessons.routes"));
app.use("/progress", require("./modules/progress/progress.routes"));
app.use("/users", require("./modules/users/users.routes"));
app.use("/audit", require("./modules/audit/audit.routes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});