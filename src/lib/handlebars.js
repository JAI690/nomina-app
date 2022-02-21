const helpers = {};
const hb = require('handlebars');
const moment = require("moment");
const accounting = require("accounting");

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

hb.registerHelper('dateFormat2', function (date, options) {
  const formatToUse = (arguments[1] && arguments[1].hash && arguments[1].hash.format) || "YYYY-MM-DD"
  return moment(date).format(formatToUse);
});

hb.registerHelper('esquema', function (value) {
    if(value === '1'){
        return "Quincena";
    }else{
        return "Semana";
    }
  });

hb.registerHelper('cotizador', function (value) {
    if(value === '1'){
        return "Día";
    }else{
        return "Hora";
    }
  });

  hb.registerHelper('accountingFormat', function (value) {
    return accounting.formatMoney(value);
  });
    

module.exports = helpers;