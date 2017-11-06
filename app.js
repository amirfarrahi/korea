var     http = require('http'),
	express  = require('express'),
	mysql    = require('mysql')
	parser   = require('body-parser');

var URL = require('url');
var myURL  = URL.parse(process.env.DATABASE_URL,true);
var authParts = myURL.auth.split(':');
console.log(authParts[0]);
console.log(authParts[1]);
console.log(myURL.hostname);
console.log(myURL.pathname.substring(1));
var connection = mysql.createConnection({
  host: myURL.hostname,
  user: authParts[0],
  password: authParts[1] ,
  database : myURL.pathname.substring(1)
});




var app = express();
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 5000);
 
// Set default route


app.get('/radar/:id', function (req,res) {
/* 
  const myURL = new URL('mysql2://b3f075f1d5a634:774299be@us-cdbr-iron-east-04.cleardb.net/heroku_3348c67f9d86e50?reconnect=true');
  
   console.log(myURL.host);
   console.log(myURL.username);
   console.log(myURL.password);
   console.log(myURL.pathname.substring(1));*/
//  res.header("Access-Control-Allow-Origin", "*");
//  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

	var id = req.params.id;

//connection.connect();
 

	connection.query('select s.id,s.time,s.flow,s.density,IFNULL(c.lat,0) accident_ind,IFNULL(c.response_time,-1) response_time ,IFNULL(c.turn_around_time,-1) turn_around_time from speed_vol_agg s left outer join collisions c on (c.date=s.date and s.id=c.radar_id and c.time=s.time) where s.id=? order by 1,2', [id], function(err, rows, fields) {
  		if (!err){
  			var response = [];
 
			if (rows.length != 0) {
				response.push({'result' : 'success', 'data' : rows});
			} else {
				response.push({'result' : 'error', 'msg' : 'No Results Found'});
			}
        //                connection.end();
			res.setHeader('Content-Type', 'application/json');
                        
	    	res.status(200).send(JSON.stringify(response));
  		} else {
		    res.status(400).send(err);
	  	}
	});
});

app.get('/radars', function (req,res) {

 res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        
connection.connect();
        connection.query('select radarname,lat, lng from radar', [], function(err, rows, fields) {
                if (!err){
                        var response = [];

                        if (rows.length != 0) {
                                response.push({'result' : 'success', 'data' : rows});
                        } else {
                                response.push({'result' : 'error', 'msg' : 'No Results Found'});
                        }
                        connection.end();
                        res.setHeader('Content-Type', 'application/json');
                res.status(200).send(JSON.stringify(response));
                } else {
                    res.status(400).send(err);
                }
        });
});


app.get('/accidents', function (req,res) {

 res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

       
        connection.connect();
        connection.query('select timestep start_time ,lat,lng,radar_id,SEC_TO_TIME(FLOOR((TIME_TO_SEC(SEC_TO_TIME((TIME_TO_SEC(timestep)+ TIME_TO_SEC(TURN_AROUND_TIME))))+150)/300)*300) end_time,response_time,turn_around_time from collisions', [], function(err, rows, fields) {
                if (!err){
                        var response = [];

                        if (rows.length != 0) {
                                response.push({'result' : 'success', 'data' : rows});
                        } else {
                                response.push({'result' : 'error', 'msg' : 'No Results Found'});
                        }
                         connection.end();
                        res.setHeader('Content-Type', 'application/json');
                res.status(200).send(JSON.stringify(response));
                } else {
                    res.status(400).send(err);
                }
        });
});





 
// Create server




 http.createServer(app).listen( app.get('port'), function(){
	console.log('Server listening on port ' + app.get('port'));
}); 

    
