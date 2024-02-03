/** BizTime express application. */


const express = require("express");
const companiesRoutes = require("./routes/companies");
const invoicesRoutes = require("./routes/invoices");
const ExpressError = require("./expressError")

const app = express();

app.use(express.json());
app.use("/companies", companiesRoutes);
app.use("/invoices", invoicesRoutes);

/** Home page */
app.get('/', function(req, res) {
  return res.send('Hello world!');
})

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});

app.listen(3000, function () {
  console.log("Listening on 3000");
});

module.exports = app;
