const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');
const  io   = require('../app');
const Message = require('../Models/Message')

router.get('/', ensureAuthenticated, function(req,res){
    Message.find({})
    .then(chats => {
        res.render('index', {
            chats:chats
        });
    })
})

function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    req.flash('success','You Must Login First!')
    res.location('/users/login');
    res.redirect('/users/login');
}


module.exports = router;