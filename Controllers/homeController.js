const pool = require('../db');

exports.getIndex = (req, res) => {
    res.render('Home/Index', {
        title: 'Система управления расписанием института',
        activePage: 'home'
    });
};

exports.getAbout = (req, res) => {
    res.render('Home/About', {
        title: 'О программе',
        activePage: 'about'
    });
};