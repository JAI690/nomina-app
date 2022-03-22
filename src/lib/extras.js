const getWeek = function (date) {
    /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */
    
        const dowOffset = 1; //default dowOffset to zero
        var newYear = new Date(date.getFullYear(),0,1);
        var day = newYear.getDay() - dowOffset; //the day of week the year begins on
        day = (day >= 0 ? day : day + 7);
        var daynum = Math.floor((date.getTime() - newYear.getTime() - 
        (date.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
        var weeknum;
        //if the year starts before the middle of a week
        if(day < 4) {
            weeknum = Math.floor((daynum+day-1)/7) + 1;
            if(weeknum > 52) {
                nYear = new Date(date.getFullYear() + 1,0,1);
                nday = nYear.getDay() - dowOffset;
                nday = nday >= 0 ? nday : nday + 7;
                /*if the next year starts before the middle of
                  the week, it is week #1 of that year*/
                weeknum = nday < 4 ? 1 : 53;
            }
        }
        else {
            weeknum = Math.floor((daynum+day-1)/7);
        }
        return weeknum;
    };

const ISRTarifas = {
    'Semana':[
        {
            inf: 0.01,
            sup: 148.4,
            cuota: 0,
            porcentaje: 1.92
        },
        {
            inf: 148.41,
            sup: 1259.72,
            cuota: 2.87,
            porcentaje: 6.4
        },
        {
            inf: 1259.73,
            sup: 2213.89,
            cuota: 73.99,
            porcentaje: 10.88
        },
        {
            inf: 2213.90,
            sup: 2573.55,
            cuota: 177.8,
            porcentaje: 16
        },
        {
            inf: 2573.56,
            sup: 3081.26,
            cuota: 235.34,
            porcentaje: 17.92
        },
        {
            inf: 3081.27,
            sup: 6214.46,
            cuota: 326.32,
            porcentaje: 21.36
        },
        {
            inf: 6214.47,
            sup: 9794.82,
            cuota: 995.54,
            porcentaje: 23.52
        },
        {
            inf: 9794.83,
            sup: 18699.94,
            cuota: 1837.64,
            porcentaje: 30
        },
        {
            inf: 18699.95,
            sup: 24933.30,
            cuota: 4509.19,
            porcentaje: 32
        },
        {
            inf: 24933.31,
            sup: 74799.83,
            cuota: 6503.84,
            porcentaje: 34
        },
        {
            inf: 74799.84,
            sup: 1000000,
            cuota: 23458.47,
            porcentaje: 35
        },
    ],
    'Quincena':[
        {
            inf: 0.01,
            sup: 318,
            cuota: 0,
            porcentaje: 1.92
        },
        {
            inf: 318.01,
            sup: 2699.40,
            cuota: 6.25,
            porcentaje: 6.4
        },
        {
            inf: 2699.41,
            sup: 4744.05,
            cuota: 158.55,
            porcentaje: 10.88
        },
        {
            inf: 4744.06,
            sup: 5514.75,
            cuota: 381,
            porcentaje: 16
        },
        {
            inf: 5514.76,
            sup: 6602.70,
            cuota: 504.3,
            porcentaje: 17.92
        },
        {
            inf: 6602.71,
            sup: 13316.70,
            cuota: 699.3,
            porcentaje: 21.36
        },
        {
            inf: 13316.71,
            sup: 20988.9,
            cuota: 2133.30,
            porcentaje: 23.52
        },
        {
            inf: 20988.91,
            sup: 40071.30,
            cuota: 3937.80,
            porcentaje: 30
        },
        {
            inf: 40071.31,
            sup: 53428.50,
            cuota: 9662.55,
            porcentaje: 32
        },
        {
            inf: 53428.51,
            sup: 160285.35,
            cuota: 13936.80,
            porcentaje: 34
        },
        {
            inf: 160285.36,
            sup: 10000000,
            cuota: 50268.15,
            porcentaje: 35
        },
    ]
}

const calcularISR = function(sueldo,cotizador){
    
    const tarifa = ISRTarifas[cotizador].find((segmento) => sueldo>segmento.inf && sueldo<segmento.sup);
    const gravable = sueldo-tarifa.inf;
    const isr = Number.parseFloat(tarifa.cuota + (gravable*tarifa.porcentaje/100)).toFixed(2)

    return isr
}


module.exports={getWeek, calcularISR};