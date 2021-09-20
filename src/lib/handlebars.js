const helpers = {};
const hb = require('handlebars');
const moment = require("moment");

hb.registerHelper('status', function (value) {
    if(value === '1'){
        return true;
    }else{
        return false;
    }
    
  });
  
hb.registerHelper('dateFormat', function (date, options) {
      const formatToUse = (arguments[1] && arguments[1].hash && arguments[1].hash.format) || "DD/MM/YYYY"
      return moment(date).format(formatToUse);
  });

module.exports = helpers;