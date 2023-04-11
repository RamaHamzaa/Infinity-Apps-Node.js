var express = require('express');
var router = express.Router();
//const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
var admin = require("firebase-admin");

var serviceAccount = require("../infinity-project-e5457-firebase-adminsdk-kez4h-1109e5f33b.json");

if (admin.apps.length === 0){
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
}

// function encodeRegistrationToken()
// {
//     let info = {id: "dalalbobes0@gmail.com"};
//     const token = jwt.sign(info,"app_food_456@gmail.com");

//     return token;
// }

var rand,host,link;    

router.post('/public/send/mail', async (req, res) => {
    var text='Welcome To App Food Link!';
    var subject='Have a nice experience as a food in our App!'
    rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link="http://"+req.get('host')+"/account/"+`${rand}`+"/verify/mail";
    console.log(link);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {user: 'appfood456@gmail.com', pass: 'app_food_456@gmail.com'}
        });
        await transporter.sendMail({
            from: 'App Food',
            //to:"ramahamza43@gmail.com",
            //to:"dalalbobes0@gmail.com",
            to:'wafaabobes2@gmail.com', 
            //to:'hala.lk2001@gmail.com',
            subject,
            text,
            //html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
            html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
        },function(error,response){
            if(error){
                console.log(error.message);
                console.log(`Not Send Mail with subject: ${subject}\nand text: ${text}\nwasn\'t sent.`);
                res.end("error");
            }else{
                console.log("Message sent: " + response.message);
                console.log(`Send Mail with subject: ${subject}\nand text: ${text}\n.`);
                res.end("sent");
            }
        });
});

router.get('/:rank/verify/mail',async function(req,res){
console.log("fdssdfsdfsfd :     "+req.params.rank);
    const db=admin.firestore();
    await db.collection('vrify').add({email:"ramahamza43@gmail.com"});
    console.log(req.protocol+":/"+req.get('host'));
    if((req.protocol+"://"+req.get('host'))==("http://"+host))
    {
        console.log("Domain is matched. Information is from Authentic email");
        if(req.params.rank==rand)
        {
            console.log("email is verified");
            res.end("Successfully verified");
        }
        else
        {
            console.log("Not verified");
            res.end("Bad Request");
        }
    }
    else
    {
        res.end("Unknown Source");
    }
    });

module.exports = router;