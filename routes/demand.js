var express = require('express');
var router = express.Router();


var admin = require("firebase-admin");

const schedule = require('node-schedule');

var serviceAccount = require("../infinity-project-e5457-firebase-adminsdk-kez4h-1109e5f33b.json");

if (admin.apps.length === 0){
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
}

/* GET home page. */
//get list of demand by admin

router.post('/get/', function(req, res, next){

  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();

  var myDemand=[];
  db.collection('myDemand').orderBy("timesTampCreat",'desc').get().then((querySnapshot)=>{
    if(!querySnapshot.empty){
      querySnapshot.forEach((demandDoc) =>{
        if(demandDoc.data().id_admins.includes(req.body.id_admin)){
          myDemand.push(demandDoc.data());
        }
      });
      res.end(JSON.stringify(myDemand));
    }else{
        res.render(404);
    }
  });
});

router.post('/get/user/', function(req, res, next){

  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();

  var myDemand=[];
  db.collection('myDemand').orderBy("timesTampCreat",'desc').get().then((querySnapshot)=>{
    if(!querySnapshot.empty){
      querySnapshot.forEach((demandDoc) =>{
        if(demandDoc.data().id_user == req.body.id_user){
          myDemand.push(demandDoc.data());
        }
      });
      res.end(JSON.stringify(myDemand));
    }else{
        res.render(404);
    }
  });
});

router.post('/get/bymarket/', function(req, res, next){

  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();

  var myDemand=[];
  db.collection('myDemand').orderBy("timesTampCreat",'desc').get().then((querySnapshot)=>{
    if(!querySnapshot.empty){
      querySnapshot.forEach((demandDoc) =>{
        if(demandDoc.data().id_market==req.body.id_market){
          myDemand.push(demandDoc.data());
        }
      });
      res.end(JSON.stringify(myDemand));
    }else{
        res.render(404);
    }
  });
});



router.post('/get/bymarket/bytime/', function(req, res, next){

  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();

  var startDate=new Date(req.body.start);
  var endDate=new Date(req.body.end);
  var myDemand=[];
  db.collection('myDemand').orderBy("timesTampCreat",'desc').get().then((querySnapshot)=>{
    if(!querySnapshot.empty){
      querySnapshot.forEach((demandDoc) =>{
        var demandTime=new Date(demandDoc.data().timesTampCreat);
        if((demandDoc.data().id_market==req.body.id_market)&&(demandTime>startDate)&&(demandTime<endDate)){
          myDemand.push(demandDoc.data());
        }
      });
      res.end(JSON.stringify(myDemand));
    }else{
        res.render(404);
    }
  });
});

//get list of demand by worker

router.post('/get/worker/', function(req, res, next){

  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();

  var myDemand=[];
  db.collection('myDemand').orderBy("timesTampCreat",'desc').get().then((querySnapshot)=>{
    if(!querySnapshot.empty){
      querySnapshot.forEach((demandDoc) =>{
        if(demandDoc.data().id_worker==req.body.id_worker){
          myDemand.push(demandDoc.data());
        }
      });
      res.end(JSON.stringify(myDemand));
    }else{
        res.render(404);
    }
  });
});

//post demand from user with notification for admins

router.post('/user/post/',async function(req,res,next){
  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();
  const fcm=admin.messaging();
      const myData={
         "id_worker":req.body.id_worker,
         "done":req.body.done,
         "product":req.body.product,
         "id":req.body.id,
         "id_user":req.body.id_user,
         "id_market":req.body.id_market,
         "id_admins":req.body.id_admins,
         "state_ar":req.body.state_ar,
         "state_en":req.body.state_en,
         "remove":req.body.remove,
         "timesTampdemand":req.body.timesTampdemand,
         "timesTampCreat":req.body.timesTampCreat,
         "priceTotal":req.body.priceTotal,
         "rating":req.body.rating,
         "iscoupon":req.body.iscoupon
      };
  await db.collection('myDemand').doc(myData.id).set(myData).then(()=>{
      console.log(req.body);
      res.end(JSON.stringify(myData));
  });
  addCoupon(myData);//add discount automatic 
  const querySnapshot= await db.collection('users').get();
  const tokens =new Array();
 if(!querySnapshot.empty){
    querySnapshot.forEach((tokenDoc)=>{
      if(myData.id_admins.includes(tokenDoc.data().id) && (tokenDoc.data().role=="admin")){
        tokens.push(tokenDoc.data().token);
      }
    });
 }
  const payloadDemandNot = admin.messaging.MessagingPayload ={
      notification :{
          title : 'New Demand Is Requested',
          body : 'Click Here To View It',
          icon :'',
          click_action :'FLUTTER_NOTIFICATION_CLICK'
      }
  };
  return fcm.sendToDevice(tokens,payloadDemandNot);
});

//edit demand with notification for user and worker

router.post('/admin/post/',async function(req,res,next){
  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();
  const fcm=admin.messaging();
      const myData={
         "id_worker":req.body.id_worker,
         "done":req.body.done,
         "product":req.body.product,
         "id":req.body.id,
         "id_user":req.body.id_user,
         "id_market":req.body.id_market,
         "id_admins":req.body.id_admins,
         "state_ar":req.body.state_ar,
         "state_en":req.body.state_en,
         "remove":req.body.remove,
         "timesTampdemand":req.body.timesTampdemand,
         "timesTampCreat":req.body.timesTampCreat,
         "priceTotal":req.body.priceTotal,
         "rating":req.body.rating,
         "iscoupon":req.body.iscoupon
      };
  await db.collection('myDemand').doc(myData.id).set(myData).then(()=>{
      console.log(req.body);
      res.end(JSON.stringify(myData));
  });
  notifUsers(myData,false);//send notification to users 
 if(req.body.notification == true){
  workerNotification(myData);// send notification to delivery worker
 }
  
});

/*****************************************/

//generate random id from 20 element
function getRandomID(){
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 20; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


//generate random id from 4 element
function getRandomCODE(){
let text = '';
const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
for (let i = 0; i < 8; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
}
return text;
}


function addCoupon(myData){
  const db=admin.firestore();
  const fcm=admin.messaging();
  const rule = new schedule.RecurrenceRule();
  rule.second = 00;
  const job = schedule.scheduleJob(rule,async function(){
    var totalCost=0;
    await db.collection('myDemand').get().then(async (querySnapshot)=>{
      if(!querySnapshot.empty){
        querySnapshot.forEach((demandDoc) =>{
          if((demandDoc.data().id_user == myData.id_user) && (demandDoc.data().iscoupon==false)
          &&(demandDoc.data().remove==false)&&(demandDoc.data().state_en=="Delivered ...")){
           totalCost=totalCost+ demandDoc.data().priceTotal;
          }
        });
      }else{
          totalCost=0;
      }
      if(totalCost>=50000){
        var myId=getRandomID();
        var myCode=getRandomCODE();
        var totalCoupon=0;
        if((totalCost>=50000)&&(totalCost<=60000)){
          totalCoupon=5000;
        }else if((totalCost>60000)&&(totalCost<=75000)){
          totalCoupon=10000;
        }else if((totalCost>75000)&&(totalCost<=100000)){
          totalCoupon=15000;
        }else if(totalCost>100000){
          totalCoupon=20000;
        } 


       await db.collection('coupon').doc(myId).set({
         "code":myCode,
         "id":myId,
         "iduser":myData.id_user,
         "iscoupon":false,
         "value":totalCoupon
       });
       await db.collection('myDemand').get().then((querySnapshot)=>{
        if(!querySnapshot.empty){
          querySnapshot.forEach(async(demandDoc) =>{
            if((demandDoc.data().id_user==myData.id_user)&&(demandDoc.data().iscoupon==false)){
              await db.collection('myDemand').doc(demandDoc.data().id).update({"iscoupon":true});
            }
          });
        }
      });
      notifUsers(myData,true);//send notifiction to user
      }
    });
  });
}


/****************************************/

async function notifUsers(myData,coupon){
  const db=admin.firestore();
  const fcm=admin.messaging();
  const querySnapshot= await db.collection('users').get();
  const tokens =new Array();
 if(!querySnapshot.empty){
    querySnapshot.forEach((tokenDoc)=>{
      if((myData.id_user == tokenDoc.data().id) && (tokenDoc.data().role=="users")){
        tokens.push(tokenDoc.data().token);
      }
    });
 }
 if(coupon){
  const payloadDemandNot = admin.messaging.MessagingPayload ={
    notification :{
        title : "Congratulations, You Have a Gift Discount",
        body : 'Click Here To View It',
        icon :'',
        click_action :'FLUTTER_NOTIFICATION_CLICK'
    }
  };
  return fcm.sendToDevice(tokens,payloadDemandNot);
 }else {
  const payloadDemandNot = admin.messaging.MessagingPayload ={
    notification :{
        title : 'Your Demand Is\t'+myData.state_en,
        body : 'Click Here To View It',
        icon :'',
        click_action :'FLUTTER_NOTIFICATION_CLICK'
    }
  };
  return fcm.sendToDevice(tokens,payloadDemandNot);
 }
}

/**********************************/

async function workerNotification(myData){
  const db=admin.firestore();
  const fcm=admin.messaging();
  const querySnapshotWorker= await db.collection('worker').get();
  const tokens =new Array();
  if(!querySnapshotWorker.empty){
     querySnapshotWorker.forEach((tokenDoc)=>{
       if(myData.id_worker == tokenDoc.data().id){
         tokens.push(tokenDoc.data().token);
       }
     });
  }

  const payloadDemandNot = admin.messaging.MessagingPayload ={
    notification :{
        title : 'Your Have a New Demand to Deliver',
        body : 'Click Here To View It',
        icon :'',
        click_action :'FLUTTER_NOTIFICATION_CLICK'
    }
};

return fcm.sendToDevice(tokens,payloadDemandNot);
}

module.exports = router;
