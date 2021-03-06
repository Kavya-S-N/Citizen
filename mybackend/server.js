const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

//Load env vars
dotenv.config({ path: "./config/config.env" });

//connect to database
connectDB();

//Route files
const citizen = require("./routes/citizen");
const complaints = require("./routes/complaint");
// const company = require("./routes/company");
// const jobs = require("./routes/jobs");
const auth = require("./routes/auth");
const users = require("./routes/users");
// const reviews = require("./routes/reviews");
// const public = require("./routes/public");
// const orderlist = require("./routes/orderlist");
const category = require("./routes/category");

//initialize app with express
const app = express();

//bodyparser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

//Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

//Mount routers
app.use("/api/v1/citizen", citizen);
app.use("/api/v1/complaints", complaints);
// app.use("/api/v1/company",company);
// app.use("/api/v1/jobs",jobs);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
// app.use("/api/v1/reviews", reviews);
// app.use("/api/v1/public", public);
// app.use("/api/v1/orders", orderlist);
app.use("/api/v1/category", category);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

//handle unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error :${err.message}`);
  //close server and exit process
  server.close(() => process.exit(1));
});
