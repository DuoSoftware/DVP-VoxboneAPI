/**
 * Created by Rajinda on 8/12/2015.
 */

var request = require('request');

function Post(postUrl,data){
      var options = {
        method: 'POST',
        uri: '-----URL---------',
        form: {
            var_1:var_1,var_2:var_2,var_3:var_3
        },
        headers: {
            'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
        }
    };
    request(options, function(error, response, body) {
        if(error){
            console.log(error);
        }else{
            console.log(response);
        }
    });
}

function get()
{
        request.get("http://codeforgeek.com",function(error,response,body){
        if(error){
            console.log(error);
        }else{
            console.log(response);
        }
    });
}

function put(){
    var request=require("request");
    request.put('http://mysite.com/img.png',function(error,response,body){
        if(error){
            console.log(error);
        }else{
            console.log(response);
            console.log(response);
        }
    });
}

function del(){
    request.del("-------url------",function(error,response,body){
        if(error){
            console.log(error);
        }else{
            console.log(response);
            console.log(response);
        }
    });
}