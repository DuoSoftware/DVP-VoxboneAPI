/**
 * Created by Heshan.i on 11/25/2016.
 */

/**
 * Created by Heshan.i on 6/17/2016.
 */

var request = require('request');
var util = require('util');
var config = require('config');
var DoPost = function (companyInfo, serviceurl, postData, callback) {
    var jsonStr = JSON.stringify(postData);
    var accessToken = 'bearer'+config.Services.authToken;
    var options = {
        url: serviceurl,
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'authorization': accessToken,
            'companyinfo': companyInfo
        },
        body: jsonStr
    };
    try {
        request.post(options, function optionalCallback(err, httpResponse, body) {
            if (err) {
                console.log('upload failed:', err);
            }
            console.log('Server returned: %j', body);
            callback(err, httpResponse, body);
        });
    }catch(ex){
        callback(ex, undefined, undefined);
    }
};

var DoGet = function (companyInfo, serviceurl, callback) {
    var accessToken = 'bearer'+config.Services.authToken;
    console.log('GetRequest:: %s', serviceurl);
    var options = {
        url: serviceurl,
        headers: {
            'content-type': 'application/json',
            'authorization': accessToken,
            'companyinfo': companyInfo
        }
    };
    try {
        request(options, function optionalCallback(err, httpResponse, body) {
            if (err) {
                console.log('upload failed:', err);
            }
            console.log('Server returned: %j', body);
            callback(err, httpResponse, body);
        });
    }catch(ex){
        callback(ex, undefined, undefined);
    }
};


module.exports.DoPost = DoPost;
module.exports.DoGet = DoGet;