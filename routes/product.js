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
//get list of product with hidden product

router.post('/admin/get/', function(req, res, next){

  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();
  var myProduct=[];
  db.collection('product').get().then((querySnapshot)=>{
    if(!querySnapshot.empty){
      querySnapshot.forEach((productDoc) =>{
        if(req.body.id_categorize == productDoc.data().id_categorize){myProduct.push(productDoc.data());}
      });
      res.end(JSON.stringify(myProduct));
    }else{
        res.render(404);
    }
  });
});

//get list of product without hidden product
router.post('/users/get/', function(req, res, next){

  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();

  var myProduct=[];
  db.collection('product').get().then((querySnapshot)=>{
    if(!querySnapshot.empty){
      querySnapshot.forEach((productDoc) =>{
        if((req.body.id_categorize == productDoc.data().id_categorize)&&(req.body.hide==false)){myProduct.push(productDoc.data());}
      });
      res.end(JSON.stringify(myProduct));
    }else{
        res.render(404);
    }
  });
});

//add or edit product with notification for user


router.post('/',async function(req,res,next){
  res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
  const db=admin.firestore();
  const fcm=admin.messaging();
      const myData={
          "description_ar" : req.body.description_ar,
          "description_en" : req.body.description_en,     
          "hide" : req.body.hide,
          "id" : req.body.id,
          "id_categorize" : req.body.id_categorize,
          "image" : req.body.image,
          "name_ar" : req.body.name_ar,
          "name_en" : req.body.name_en,
          "note" : req.body.note,
          "price" : req.body.price  
      };
  await db.collection('product').doc(myData.id).set(myData).then(()=>{
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
  const payloadProductNot = admin.messaging.MessagingPayload ={
      notification :{
          title : 'New Product Is Added',
          body : 'Click Here To View It',
          icon :'',
          click_action :'FLUTTER_NOTIFICATION_CLICK'
      }
  };
  return fcm.sendToDevice(tokens,payloadProductNot);
});

module.exports = router;
