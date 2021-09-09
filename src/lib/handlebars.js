const helpers = {};
const hb = require('handlebars');

hb.registerHelper('status', function (value) {
    if(value === '1'){
        return true;
    }else{
        return false;
    }
    
  });

module.exports = helpers;