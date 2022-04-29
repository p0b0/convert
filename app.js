if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const fs = require('fs');
const express = require('express');
const path = require('path');
const ejs = require('ejs');
const ejsMate = require('ejs-mate');
var xlsx = require("xlsx");
const multer = require('multer');
const csv = require('fast-csv');
const upload = multer({ dest: 'tmp/csv/' });
const moment = require('moment');

var port = process.env.PORT || 3000

let app = express();

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))

app.get('/', (req, res, next)=>{
    res.render('index');
})

app.post('/convert', upload.single('excelFile'), (req, res, next)=>{

    const file        = xlsx.readFile(req.file.path);
    var weekNumber    = req.body.weekNumber;
    var startDate     = req.body.startDate;
    var fillMonday    = req.body.fillMonday;
    var fillTuesday   = req.body.fillTuesday;
    var fillWednesday = req.body.fillWednesday;
    var fillThursday  = req.body.fillThursday;
    var fillFriday    = req.body.fillFriday;
    var fillSaturday  = req.body.fillSaturday;

    var weekDates  = [];

    var fillDays = {
        fillMonday: fillMonday,
        fillTuesday: fillTuesday,
        fillWednesday: fillWednesday,
        fillThursday: fillThursday,
        fillFriday: fillFriday,
        fillSaturday: fillSaturday
    };

    var totalWorkDays = 0;

    for (const property in fillDays) {
        if (fillDays[property] === 'on'){
            totalWorkDays = totalWorkDays + 1;
        }
    }

    console.log('***')
    console.log(totalWorkDays);
    console.log('***')

    var workingHours = 'Start:08:00\n' +
        'End:16:00\n' +
        'Ώρες:8\n' +
        'Break:12:00-12:15';

    var totalWorkHours = totalWorkDays * 8;

    var sumHours = 'Ώρες κανονικές: ' + totalWorkHours + '\n' +
        'Ώρες Υπερ-εργασίας: 0\n' +
        'Ώρες Υπερ-ωρίας: 0\n' +
        'Λεπτά Διαλείμματος: 30\n';

    var intermediateDate = moment(startDate);
    weekDates.push(startDate);
    for (let i = 0; i < weekNumber; i++){
        intermediateDate = moment(intermediateDate).add(1, 'week');
        weekDates.push(intermediateDate);
    }

    var cont = file.Strings;
    var sheet = file.Sheets[file.SheetNames[0]];

    var wj = xlsx.utils.sheet_to_json(sheet, {raw: true});
    wj.shift();
    const fileRows = [];

    //delete tmp csv file or files
    var directory = './tmp/csv/';

    fs.readdir(directory, (err, files)=> {
        if (err) throw err;

        for(const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    })

    res.render('result', {data: wj, weekDates: weekDates, weekNumber:weekNumber, moment: moment, fillDays : fillDays, workingHours: workingHours, sumHours: sumHours});
})

app.listen(port, ()=> {
    console.log(`listening to ${port}`)
})