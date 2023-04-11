var express = require('express');
var router = express.Router();


var admin = require("firebase-admin");

var serviceAccount = require("../infinity-project-e5457-firebase-adminsdk-kez4h-1109e5f33b.json");

if (admin.apps.length === 0){
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
}

/* GET home page. */
//get list of categorize with hidden categorize

router.post('/admin/get/', function(req, res, next){

  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();

  var id={"id_market":req.body.id_market};
  var myCategorize=[];
  db.collection('market').doc(id.id_market).collection('categorize').get().then((querySnapshot)=>{
    if(!querySnapshot.empty){
      querySnapshot.forEach((categorizeDoc) =>{
        myCategorize.push(categorizeDoc.data());
      });
      res.end(JSON.stringify(myCategorize));
    }else{
        res.render(404);
    }
  });
});


//get list off categorize by market without hidden categorize


router.post('/users/get/', function(req, res, next){

  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();
  var id={"id_market":req.body.id_market};
  var myCategorize=[];
  db.collection('market').doc(id.id_market).collection('categorize').get().then((querySnapshot)=>{
    if(!querySnapshot.empty){
      querySnapshot.forEach((categorizeDoc) =>{
        if(categorizeDoc.data().hide==false){myCategorize.push(categorizeDoc.data());}
      });
      res.end(JSON.stringify(myCategorize));
    }else{
        res.render(404);
    }
  });
});

//add or edit categorize with notification for all user


router.post('/',async function(req,res,next){
  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();
  const fcm=admin.messaging();
      const id={"id_market" : req.body.id_market};
      const myData={    
          "hide" : req.body.hide,
          "id" : req.body.id,
          "image" : req.body.image,
          "name_ar" : req.body.name_ar,
          "name_en" : req.body.name_en
      };
  await db.collection('market').doc(id.id_market).collection('categorize').doc(myData.id).set(myData).then(()=>{
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
  const payloadCategorizeNot = admin.messaging.MessagingPayload ={
      notification :{
          title : 'New Categorize Is Added',
          body : 'Click Here To View It',
          icon :'',
          click_action :'FLUTTER_NOTIFICATION_CLICK'
      }
  };
  return fcm.sendToDevice(tokens,payloadCategorizeNot);
});

module.exports = router;
