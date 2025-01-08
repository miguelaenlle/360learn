const mongoose = require('mongoose');
require("dotenv").config();

const dbUrl = process.env.MONGO_URL;

mongoose.connect(dbUrl)
    .then(() => {
        const app = require('./app');
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error(error);
    });