const express = require('express')
const app = express();
const geolib = require('geolib')
var bodyParser = require('body-parser')
const mongoose = require('mongoose');
const userModel = require('./model');
let connectionString="mongodb://127.0.0.1:27017/GEOCodes";
let db=mongoose.connection;

db.on('error',function(){
    console.log("Error connecting to DB");
});

db.once('open',function(){
    console.log("DB connected",connectionString);
   app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
});
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect(connectionString);
mongoose.promise=global.promise;

app.post('/', (req, res) => {
  let requestbody = req.body;
  let user = new userModel();
  user.userName = requestbody.userName;
  user.loc.type='Point';
  user.loc.coordinates.push(parseFloat(requestbody.long))
  user.loc.coordinates.push(parseFloat(requestbody.lat))
  user.save().then(user => {
    console.log(user);
    let response = {};
    response.status="200";
    response.message="Success";           
    response.data=user;
    return res.json(response);
  }).catch(function(error){
    res.send(error.toString());
})

  if(requestbody.long == undefined || requestbody.lat == undefined){

    //res.send('Please provide long and lat')
 }
// res.send(checkRadius(requestbody.lat,requestbody.long));
  
});



app.get('/', (req, res) => {
  console.log(req.query);
 let near = [parseFloat(req.query.long),parseFloat(req.query.lat)]
 
 userModel.aggregate(
    [
        { 
          "$geoNear": {
            "near": {
                "type": "Point",
                "coordinates": [parseFloat(req.query.long),parseFloat(req.query.lat)]
            }, 
            distanceField: "distance.calculated", 
            maxDistance: 2000, 
            spherical :true
        }
      }
    ],
    function(err,results) {
      console.log(results);
      if(err == null){
      let response = {};
      response.status="200";
      response.message="Success";           
      response.data=results;
      return res.json(response);
    }
    else{
      let response = {};
      response.status="404";
      response.message="Failure";           
      response.data=err;
      return res.json(response);
    }
  }
  
)
});

checkRadius = (lat,long) =>{
  console.log('Executing checkRadius');
  let isInLimit = geolib.isPointInCircle(
    {latitude: lat, longitude: long},
    {latitude: 51.5175, longitude: 7.4678},
    5000
);
if(isInLimit == true){ 
  return 'Its within circle'
}
else{
  return 'Its not within circle'
}
}

