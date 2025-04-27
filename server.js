if (process.env.ENABLE_APM === "1") {
  const apm = require("elastic-apm-node").start({
    serviceName: "spepas-ussd",
    serverUrl: process.env.ELASTIC_APM_SERVER_URL,
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
    environment: process.env.NODE_ENV,
    active: true,
    captureBody: "all",
    errorOnAbortedRequests: true,
    captureErrorLogStackTraces: "always",
    logLevel: "debug",
  });
}
const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/error");
const { logger, morganMiddleware } = require("./logs/winston");
const routes = require("./routes/setup");
const path = require("path");
// const { checkConnection } = require("./logs/elasticsearch");
//load env vars
dotenv.config({ path: ".env" });
require("dotenv").config();

//initialise express
const app = express();

//body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Set Security Headers
app.use(helmet({ crossOriginResourcePolicy: false }));
//Set Security Headers

//Prevent XSS Attack
app.use(xss());

if (process.env.NODE_ENV === "development") {
  app.use(morganMiddleware);
}

app.use(function (req, res, next) {
  res.removeHeader("x-powered-by");
  res.removeHeader("set-cookie");
  res.removeHeader("Date");
  res.removeHeader("Connection");

  next();
});
app.use(function (req, res, next) {
  / Clickjacking prevention /;
  res.header("Content-Security-Policy", "frame-ancestors directive");
  next();
});

// app.use('/Selfie', express.static(path.join(__dirname, '/Selfie')))

//Mount routes
app.use("/spussd/api/v1/", routes);

app.use(errorHandler);

//errror middleware
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    status: 0,
    message: error.message,
  });
  logger.error(error.message);
});
//create port
const PORT = process.env.PORT || 9012;

// function startElasticSearch() {
//   checkConnection();
// }

//listen to portnpm
app.listen(PORT, () => {
  console.log(
    `Spepas USSD Service : Running in ${process.env.NODE_ENV} mode and listening on port http://:${PORT}`
  );
  // startElasticSearch();
  logger.info(
    `Spepas USSD Service: Running in ${process.env.NODE_ENV} mode and listening on port http://:${PORT}`
  );
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  logger.error(err.message);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
