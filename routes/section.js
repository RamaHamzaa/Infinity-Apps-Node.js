var express = require('express');
var router = express.Router();


var admin = require("firebase-admin");

var serviceAccount = require("../infinity-project-e5457-firebase-adminsdk-kez4h-1109e5f33b.json");

if (admin.apps.length === 0){
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
}

//get section 
router.post('/get/', function(req, res, next){

  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();

  var mySection=[];
  db.collection('section').get().then((querySnapshot)=>{
    if(!querySnapshot.empty){
      querySnapshot.forEach((sectionDoc) =>{
        mySection.push(sectionDoc.data());
      });

      res.end(JSON.stringify(mySection));
    }else{
        res.render(404);
    }
  });
});

//add section with notification
router.post('/',async function(req,res,next){
  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();
  const fcm=admin.messaging();
      const myData={    
          "hide" : req.body.hide,
          "id" : req.body.id,
          "image" : req.body.image,
          "name_ar" : req.body.name_ar,
          "name_en" : req.body.name_en,
          "timesTamp":req.body.timesTamp  
      };
  await db.collection('section').doc(myData.id).set(myData).then(()=>{
      console.log(req.body);
      res.end(JSON.stringify(myData));
  });

  const querySnapshot= await db.collection('users').get();
  const tokens =new Array();
 if(!querySnapshot.empty){
  querySnapshot.forEach((tokenDoc)=>{
    if(tokenDoc.data().role=="users"){
      tokens.push(tokenDoc.data().token);
    }
    });
 }
  const payloadSectionNot = admin.messaging.MessagingPayload ={
      notification :{
          title : 'New Section Is Added',
          body : 'Click Here To View It',
          icon :'',
          click_action :'FLUTTER_NOTIFICATION_CLICK'
      }
  };
  return fcm.sendToDevice(tokens,payloadSectionNot);
});



module.exports = router;