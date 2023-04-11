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

/* GET home page. */
// get list of market by admin

router.post('/admin/get/', function(req, res, next){

  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();

  var myMarket=[];
  db.collection('market').get().then((querySnapshot)=>{
    if(!querySnapshot.empty){
      querySnapshot.forEach((marketDoc) =>{
        if(marketDoc.data().owners.includes(req.body.owners)){
            myMarket.push(marketDoc.data());
        }
      });
      res.end(JSON.stringify(myMarket));
    }else{
        res.render(404);
    }
  });
});

//get list from market by section



router.post('/users/get/', function(req, res, next){

  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();

  var myMarket=[];
  db.collection('market').get().then((querySnapshot)=>{
    if(!querySnapshot.empty){
      querySnapshot.forEach((marketDoc) =>{
        if(req.body.id_section == marketDoc.data().id_section){
            myMarket.push(marketDoc.data());
        }
      });
      res.end(JSON.stringify(myMarket));
    }else{
        res.render(404);
    }
  });
});

// edit market with notification for all user


router.post('/',async function(req,res,next){
  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();
      const myData={
          "description_ar":req.body.description_ar,
          "description_en":req.body.description_en,
          "hide" : req.body.hide,
          "id":req.body.id,
          "id_section":req.body.id_section,
          "image" : req.body.image,
          "image_icon":req.body.image_icon,
          "lat" : req.body.lat,
          "long" : req.body.long, 
          "name_ar" : req.body.name_ar,
          "name_en" : req.body.name_en,
          "owners": req.body.owners,
          "timesTampClose" : req.body.timesTampClose,
          "timesTampOpen" : req.body.timesTampOpen,
          "rating":req.body.rating,
          "active":req.body.active
      };
  await db.collection('market').doc(myData.id).set(myData).then(()=>{
      console.log(req.body);
      res.end(JSON.stringify(myData));
  });
  notificationMarket(myData.name_en,req.body.notification);//send notifiction for user
  editRate(myData);//edit rate about market
  editTime(myData);//refresh time open and close market

});
  
/*******************************************/

async function notificationMarket(nameMarket,notif){
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
 if(notif){
  const payloadMarketNot = admin.messaging.MessagingPayload ={
    notification :{
        title : 'There Are a New Merket',
        body : 'Click Here To View It',
        icon :'',
        click_action :'FLUTTER_NOTIFICATION_CLICK'
    }
};
return fcm.sendToDevice(tokens,payloadMarketNot);
 }else{
  const payloadMarketNot = admin.messaging.MessagingPayload ={
    notification :{
        title : 'The\t'+nameMarket+'\t Edit His Information',
        body : 'Click Here To View It',
        icon :'',
        click_action :'FLUTTER_NOTIFICATION_CLICK'
    }
};
return fcm.sendToDevice(tokens,payloadMarketNot);
 }
}

/************************************/

function editRate(myData){
  const db=admin.firestore();
  const rule = new schedule.RecurrenceRule();
  rule.second = 00;
  
  const job = schedule.scheduleJob(rule,async function(){
    var finalRate=0.0;
    var rate=0;
    var numRate=0;
    await db.collection('myDemand').get().then((querySnapshot)=>{
      if(!querySnapshot.empty){
        querySnapshot.forEach((demandDoc) =>{
          if(myData.id == demandDoc.data().id_market){
              rate=rate+demandDoc.data().rating;
              numRate=numRate+1;
          }
        });
        if(numRate==0){
          finalRate=0.0;
        }
        else{
          finalRate=rate/numRate;
        }
      }
    });
    await db.collection('market').doc(myData.id).update({"rating":finalRate+0.0});
  });
}

/************************************/

async function editTime(myData){
  const db=admin.firestore();
  const rule = new schedule.RecurrenceRule();
  rule.second = 00;
  const job = schedule.scheduleJob(rule,async function(){
    await db.collection("market").doc(myData.id).get().then(async (value)=>{
      var active=false;
    var dateOfNow= new Date(Date.now());
    var dateOfNewOpen= new Date(Date.now());
    var dateOfNewClose= new Date(Date.now());
    var newOpenDate=new Date(value.data().timesTampOpen);
    var newCloseDate=new Date(value.data().timesTampClose);

    dateOfNewOpen.setHours(newOpenDate.getHours());
    dateOfNewOpen.setMinutes(newOpenDate.getMinutes());
    dateOfNewClose.setHours(newCloseDate.getHours());
    dateOfNewClose.setMinutes(newCloseDate.getMinutes());

    if((dateOfNow > dateOfNewOpen)&&(dateOfNow < dateOfNewClose)){
      active=true;
    }
    await db.collection('market').doc(myData.id).update({
      "active":active,
      "timesTampClose":Math.floor(dateOfNewClose),
      "timesTampOpen":Math.floor(dateOfNewOpen)
      });
    });
  });
}

module.exports = router;
