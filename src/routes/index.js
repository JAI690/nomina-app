const express = require('express');

const router = express.Router();

router.get('/', (req,res) => {
    res.render("../views/auth/signin.hbs")
});




module.exports = router;