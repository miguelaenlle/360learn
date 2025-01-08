const cors = require("cors");
const express = require('express');
const bodyParser = require("body-parser");
const app = express();

const experiencesRoutes = require('./routes/experiences-routes');
const stepsRoutes = require('./routes/steps-routes');


app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

app.use('/experiences', experiencesRoutes);
app.use('/steps', stepsRoutes);

module.exports = app;