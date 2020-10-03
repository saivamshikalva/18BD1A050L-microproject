const express = require('express');
const app = express();

//bodyparser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//for mongodb
const MongoClient=require('mongodb').MongoClient;
//Connecting server file for AWT
let server =require('./server');
let config = require('./config');
let middleware =require('./middleware');
const response =require('express');

//DATABASE CONNECTION
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'hospitalManagement';
let db;
MongoClient.connect(url,{useNewUrlParser:true,useUnifiedTopology:true},(error,client) =>{
    if(error) return console.log(err);
    db = client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
});

//FETCHING HOSPITAL DETAILS
app.get('/HospDetails', middleware.checkToken, function (req,res) {
    console.log("Hospital details");
    var data = db.collection('hospdetails').find().toArray()
    .then(result => res.json(result));
});
//VENTILATORS DETAILS
app.get('/VentDetails', middleware.checkToken,  (req,res) => {
    console.log("Ventilators Information ");
    var ventilatordetails = db.collection('ventilatordetails').find().toArray()
    .then(result => res.json(result));
    
});
//Search ventilators by status

app.post('/searchventbystatus',middleware.checkToken,(req,res)=>{
    var status=req.body.status;
    console.log(status);
    var ventilatordetails =db.collection('ventilatordetails').find({ "status":status}).toArray().then(result =>res.json(result));
});
//SEARCH VENTILATORS BY HOSPITAL NAME
app.post('/searchventbyname', middleware.checkToken, (req,res) =>{
    var name= req.query.name;
    console.log(name);
    var ventilatordetails=db.collection('ventilatordetails').find({'name': new RegExp(name, 'i')}).toArray()
    .then(result => res.json(result));
});
// SEARCH Hospital by Name
app.post('/searchhospital',middleware.checkToken,(req,res)=>{
    var name=req.query.name;
    console.log(name);
    var hospdetails=db.collection('hospdetails')
    .find({ 'name': new RegExp(name,'i')}).toArray().then(result=>res.json(result));
});
//UPDATE VENTILATOR DETAILS
app.put('/updateventilator',middleware.checkToken,(req,res)=>{
    var ventilatorId={ventilatorId: req.body.ventilatorId};
    console.log(ventilatorId);
    var newvalues ={ $set:{ status: req.body.status }};
    db.collection("ventilatordetails").updateOne(ventilatorId,newvalues,function(err, result){
        res.json("Ventilator details updated");
        if(err) throw err;
    });
});
//Add ventilator
app.post('/addventilatorbyuser',middleware.checkToken,(req,res)=>{
    var hID=req.body.hID;
    var ventilatorId=req.body.ventilatorId;
    var status=req.body.status;
    var name=req.body.name;
    
    var item=
    {
        hID:hID,ventilatorId:ventilatorId,status:status,name:name
    };
    db.collection('ventilatordetails').insertOne(item,function(err,result){
        res.json('Ventilator inserted');
    });
});
//Delete ventilator by its Id
app.delete('/deletevent',middleware.checkToken,(req,res)=>{
    var myquery=req.query.ventilatorId;
    console.log(myquery);
    var myquery1={ventilatorId: myquery };
    db.collection('ventilatordetails').deleteOne(myquery1, function(err,obj)
    {
        if(err) throw err;
        res.json("One Ventilator details deleted");
    });
});
app.listen(1700);