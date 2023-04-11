var express = require('express');
var router = express.Router();
const schedule = require('node-schedule');

var admin = require("firebase-admin");

var serviceAccount = require("../infinity-project-e5457-firebase-adminsdk-kez4h-1109e5f33b.json");

if (admin.apps.length === 0){
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
}

//get all sold with hidden sold by market

router.post('/admin/get/', function(req, res, next){

  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();

  var MySold=[];
  db.collection('sold').orderBy("timesTamp",'desc').get().then((querySnapshot)=>{
    if(!querySnapshot.empty){
      querySnapshot.forEach((soldDoc) =>{
        if(req.body.id_market == soldDoc.data().id_market){MySold.push(soldDoc.data());}
      });
      res.end(JSON.stringify(MySold));
    }else{
        res.render(404);
    }
  });
});


//get list from sold by market without hidden sold


router.post('/users/get/', function(req, res, next){

  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();

  var mySold=[];
  db.collection('sold').orderBy("timesTamp",'desc').get().then((querySnapshot)=>{
    if(!querySnapshot.empty){
      querySnapshot.forEach((soldDoc) =>{
        if((req.body.id_market == soldDoc.data().id_market)&&(req.body.hide=false)){mySold.push(soldDoc.data());}
      });
      res.end(JSON.stringify(mySold));
    }else{
        res.render(404);
    }
  });
});

//add sold with notification for all user


router.post('/',async function(req,res,next){
  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();
      const myData={
          "description_ar" : req.body.description_ar,
          "description_en" : req.body.description_en,     
          "hide" : req.body.hide,
          "id" : req.body.id,
          "id_market" : req.body.id_market,
          "image" : req.body.image,
          "image_icon":req.body.image_icon,
          "lastPrice":req.body.lastPrice,
          "longDay":req.body.longDay,
          "name_ar" : req.body.name_ar,
          "name_en" : req.body.name_en,
          "name_market_ar" : req.body.name_market_ar,
          "name_market_en" : req.body.name_market_en,
          "price" : req.body.price,   
          "timeSend":req.body.timeSend,
          "timesTamp":req.body.timesTamp
      };
  await db.collection('sold').doc(myData.id).set(myData).then(()=>{
      console.log(req.body);
      res.end(JSON.stringify(myData));
  });
  notificationSold();//send notifivation to users
  editHide(myData);//hide offers automatic after some day

});


/**************************************/

async function notificationSold(){
  const db=admin.firestore();
  const fcm=admin.messaging();
  const querySnapshot= await db.collection('users').get();
  const tokens =new Array();
 if(!querySnapshot.empty){
  querySnapshot.forEach((tokenDoc)=>{
    if(tokenDoc.data().role=="users"){
      tokens.push(tokenDoc.data().token);
    }
    });
 }
  const payloadSoldNot = admin.messaging.MessagingPayload ={
      notification :{
          title : 'New Sold Is Added',
          body : 'Click Here To View It',
          icon :'',
          click_action :'FLUTTER_NOTIFICATION_CLICK'
      }
  };
  return fcm.sendToDevice(tokens,payloadSoldNot);
}



/*************************************/

async function editHide(myData){
  const db=admin.firestore();
  const rule = new schedule.RecurrenceRule();
  rule.second = 00;
  const job = schedule.scheduleJob(rule,async function(){
    var hide=false;
    var dateOfNow= new Date(Date.now());
    var newDateTest=new Date(myData.timesTamp);
    newDateTest.setDate(newDateTest.getDate()+myData.longDay);
    if(dateOfNow.getFullYear()>newDateTest.getFullYear()){
      hide=true;
    }else if(dateOfNow.getFullYear()==newDateTest.getFullYear()){
      if(dateOfNow.getMonth()>newDateTest.getMonth()){
        hide=true;
      }else if(dateOfNow.getMonth()==newDateTest.getMonth()){
        if(dateOfNow.getDate()>newDateTest.getDate()){
          hide=true;
        }else if(dateOfNow.getDate()==newDateTest.getFullYear()){
          if(dateOfNow.getHours()>newDateTest.getHours()){
            hide=true; 
          }else if(dateOfNow.getHours()==newDateTest.getHours()){
            if(dateOfNow.getMinutes()>=newDateTest.getMinutes()){
              hide=true;
            }
          }
        }
      }
    }
    await db.collection('sold').doc(myData.id).update({"hide":hide});
  });
}

module.exports = router;