const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const { authRouter } = require("./routes/authRouter");
const { profileRouter } = require("./routes/profileRouter");
const { requestRouter } = require("./routes/requestRouter");
const { userRouter } = require("./routes/userRouter");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/',authRouter);
app.use('/',profileRouter);
app.use('/',requestRouter);
app.use('/',userRouter)

connectDB()
  .then(() => {
    console.log("Established connection to database");
    app.listen(3000, () => {
      console.log("Server is up and listening at port 3000");
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
