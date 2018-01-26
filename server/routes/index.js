var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
var mysql = require('mysql');
var fs = require('fs');
var util = require('util');

//router.use(bodyParser.urlencoded({ extended: false }));*/

router.get('/message', function(req, res, next) {
  res.json('Welcome To React');
});
let patternHistory=[]
let patternHistoryRate=[]
let todayRate=[]
let todayPatternKeySequence = []
router.post('/simulate', function(req, res, next) {  
  console.log(req.body)
  let {selectdate, lowerlimit, upperlimit, daylength} = req.body
  if (selectdate==''){
    res.json("Cannot calculate")
    return
  }
  let sequences=[]
  let todaysequence=[]
  
  patternHistoryRate=[]
  todayRate=[]
  todayPatternKeySequence = []
  //con.query('TRUNCATE TABLE calculating')
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "abc",
    database: "pk10_2"
  });
  con.connect(function(err) {
    if (err) throw err;  

    con.query(`SELECT * FROM sequence WHERE date BETWEEN DATE_SUB("${selectdate}", INTERVAL ${daylength} DAY) AND DATE_ADD("${selectdate}", INTERVAL 1 DAY) ORDER BY id, date ASC`, function (err, result, fields) {    
      if (err) throw err;    
      //sequences.push(result)    
      for(var i=0;i<result.length;i++){
        const oneRow = result[i];
        let oneSeq = oneRow.seq.split(",")
        let oneRowData = {id:result[i].id, seq:oneSeq, date:result[i].date}
        
        let date1 = GetFormattedDate(oneRow.date)
        let date2 = GetFormattedDate(selectdate)      
        if(date1 == date2){
          todaysequence.push(oneRowData)
        }else{
          sequences.push(oneRowData)        
        }      
      }
      filterPatterns(sequences, lowerlimit, upperlimit, selectdate)
      calculatePatternRate()
      console.log(patternHistoryRate)
      //todayRate = patternHistoryRate
      simulateSelectedDay(todaysequence)
      let returnVal = {sequences, todaysequence,patternHistory, todayRate, todayPatternKeySequence}
      //res.json('Welcome To React');
      //fs.writeFileSync("./test.json", util.inspect(returnVal), 'utf-8'); 
      let savedVal = {patternHistory, patternHistoryRate}
      fs.writeFileSync("./test.json", JSON.stringify(savedVal), 'utf-8'); 
      res.json(returnVal)
    });  
    con.end()
  });  
  //res.json('Welcome To React');
});

function filterPatterns(sequences, lowerlimit, upperlimit, selectdate){
    for(var i=5;i<sequences.length;i++){      
      for(var k=0;k<10;k++){
        let fiveElements=[]  
        for(var j=i-5;j<i;j++){
          fiveElements.push(sequences[j].seq[k])
        }
        if (!isExistDuplicate(fiveElements)){
          let isExistNextElement = fiveElements.find((element)=>element==sequences[i].seq[k])
          let key = getPatternKey(fiveElements.sort())
          if(patternHistory[key] === undefined){
            isExistNextElement? patternHistory[key] = `1` : patternHistory[key] = `0`
          }else{
            isExistNextElement? patternHistory[key] = `${patternHistory[key]}1` : patternHistory[key] = `${patternHistory[key]}0`
          }          
          //console.log(key, patternHistory[key])
        }
      }
    }  
}

function isExistDuplicate(a){
  var counts = [];
    for(var i = 0; i <= a.length; i++) {
        if(counts[a[i]] === undefined) {
            counts[a[i]] = 1;
        } else {
            return true;
        }
    }
    return false;
}

function getPatternKey(a){
  let patternKey = 0
  for(var i1 = 1; i1 <= 6; i1++) {
    for(var i2 = i1+1; i2 <= 7; i2++) {
      for(var i3 = i2+1; i3 <= 8; i3++) {
        for(var i4 = i3+1; i4 <= 9; i4++) {
          for(var i5 = i4+1; i5 <= 10; i5++) {
            patternKey++ 
            if((i1==a[0])&&(i2==a[1])&&(i3==a[2])&&(i4==a[3])&&(i5==a[4])){
              return patternKey
            }            
          }
        }
      }
    }
  }  
}

function GetFormattedDate(str) {
  var todayTime = new Date(str);
  var month = todayTime .getMonth() + 1;
  var day = todayTime .getDate();
  var year = todayTime .getFullYear();
  return month + "/" + day + "/" + year;
}

function calculatePatternRate(){  
  for(var i=0;i<256;i++){
    if(patternHistory[i]===undefined){

    }else{      
      var temp = patternHistory[i]
      var count1 = (temp.match(/1/g) || []).length;      
      var count = temp.length
      patternHistoryRate[i] = count1/count *100
    }
  }
}

function simulateSelectedDay(todaySeq){
  let rates;
  for(var i=5;i<todaySeq.length;i++){      
    for(var k=0;k<10;k++){
      let fiveElements=[]  
      for(var j=i-5;j<i;j++){
        fiveElements.push(todaySeq[j].seq[k])
      }
      if (!isExistDuplicate(fiveElements)){
        let isExistNextElement = fiveElements.find((element)=>element==todaySeq[i].seq[k])
        let key = getPatternKey(fiveElements.sort())
        if (patternHistoryRate[key]<=40){
          if(isExistNextElement){            
            if(todayRate[key] === undefined){
              todayRate[key] = `0`
            }else{
              todayRate[key] = `${todayRate[key]}0`              
            }
          }else{
            if(todayRate[key] === undefined){
              todayRate[key] = `1`
            }else{
              todayRate[key] = `${todayRate[key]}1`
            }
          }
          todayPatternKeySequence[i] = {key:key, patternState:todayRate[key], pos:k+1, prevPercent:patternHistoryRate[key]}
          break;
        }else if (patternHistoryRate[key] >=60 ){
          if(isExistNextElement){
            if(todayRate[key] === undefined){
              todayRate[key] = `1`
            }else{
              todayRate[key] = `${todayRate[key]}1`
            }            
          }else{
            if(todayRate[key] === undefined){
              todayRate[key] = `0`
            }else{
              todayRate[key] = `${todayRate[key]}0`              
            }            
          }
          todayPatternKeySequence[i] = {key:key, patternState:todayRate[key], pos:k+1, prevPercent:patternHistoryRate[key]}
          break;
        }        
      }
    }
  }  
}

module.exports = router;