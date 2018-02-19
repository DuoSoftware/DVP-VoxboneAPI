/**
 * Created by Rajinda on 8/24/2015.
 */

var restify = require('restify');

var config = require('config');
var port = config.Host.port || 3000;
var version = config.Host.version;

var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var trunkHandler = require('./TrunkHandler');
var inventoryHandler = require('./voxbone/InventoryHandler');
var voxboneHandler = require('./VoxboneHandler');
var didReqHandler = require('./DidRequestHandler');



// var mongoip=config.Mongo.ip;
// var mongoport=config.Mongo.port;
// var mongodb=config.Mongo.dbname;
// var mongouser=config.Mongo.user;
// var mongopass = config.Mongo.password;


var port = config.Host.port || 3000;
var host = config.Host.vdomain || 'localhost';


// var mongoose = require('mongoose');
// var util = require('util');
// var connectionstring = util.format('mongodb://%s:%s@%s:%d/%s',mongouser,mongopass,mongoip,mongoport,mongodb)
// mongoose.connect(connectionstring);
//
// mongoose.connection.once('open', function() {
//     console.log("Connected to db");
// });


var util = require('util');
var mongoip=config.Mongo.ip;
var mongoport=config.Mongo.port;
var mongodb=config.Mongo.dbname;
var mongouser=config.Mongo.user;
var mongopass = config.Mongo.password;
var mongoreplicaset= config.Mongo.replicaset;

var mongoose = require('mongoose');
var connectionstring = '';
mongoip = mongoip.split(',');

if(util.isArray(mongoip)){
    if(mongoip.length > 1){
        mongoip.forEach(function(item){
            connectionstring += util.format('%s:%d,',item,mongoport)
        });

        connectionstring = connectionstring.substring(0, connectionstring.length - 1);
        connectionstring = util.format('mongodb://%s:%s@%s/%s',mongouser,mongopass,connectionstring,mongodb);

        if(mongoreplicaset){
            connectionstring = util.format('%s?replicaSet=%s',connectionstring,mongoreplicaset) ;
        }
    }
    else
    {
        connectionstring = util.format('mongodb://%s:%s@%s:%d/%s',mongouser,mongopass,mongoip[0],mongoport,mongodb);
    }
}else{

    connectionstring = util.format('mongodb://%s:%s@%s:%d/%s',mongouser,mongopass,mongoip,mongoport,mongodb);
}

console.log(connectionstring);
mongoose.connect(connectionstring,{server:{auto_reconnect:true}});


mongoose.connection.on('error', function (err) {
    console.error( new Error(err));
    mongoose.disconnect();

});

mongoose.connection.on('opening', function() {
    console.log("reconnecting... %d", mongoose.connection.readyState);
});


mongoose.connection.on('disconnected', function() {
    console.error( new Error('Could not connect to database'));
    mongoose.connect(connectionstring,{server:{auto_reconnect:true}});
});

mongoose.connection.once('open', function() {
    console.log("Connected to db");

});


mongoose.connection.on('reconnected', function () {
    console.log('MongoDB reconnected!');
});



process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});


//-------------------------  Restify Server ------------------------- \\
var RestServer = restify.createServer({
    name: "VoxboneApi",
    version: '1.0.0'
}, function (req, res) {

});
restify.CORS.ALLOW_HEADERS.push('authorization');

RestServer.use(restify.CORS());
RestServer.use(restify.fullResponse());
//Enable request body parsing(access)
RestServer.use(restify.bodyParser());
RestServer.use(restify.acceptParser(RestServer.acceptable));
RestServer.use(restify.queryParser());

// ---------------- Security -------------------------- \\
var jwt = require('restify-jwt');
var secret = require('dvp-common/Authentication/Secret.js');
var authorization = require('dvp-common/Authentication/Authorization.js');
RestServer.use(jwt({secret: secret.Secret}));
// ---------------- Security -------------------------- \\


//Server listen
RestServer.listen(port, function () {
    console.log('%s listening at %s', RestServer.name, RestServer.url);
});


// RestServer.post('/DVP/API/' + version + '/voxbone/trunk/trunksetup', authorization({
//     resource: "voxbone",
//     action: "write"
// }), function (req, res, next) {
//     try {
//         logger.info('[DVP-voxbone.TrunkSetup] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));
//
//         var apiKey = config.Services.apiKey;//req.headers.authorization
//
//         var cmp = req.body;
//         trunkHandler.TrunkSetup(apiKey, res, true, cmp.FaxType, cmp.IpUrl, cmp.TrunkCode, cmp.TrunkName, cmp.LbId, cmp.OperatorCode, cmp.OperatorName);
//
//     }
//     catch (ex) {
//         logger.error('[DVP-voxbone.TrunkSetup] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
//         var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
//         res.end(jsonString);
//     }
//     return next();
// });

RestServer.post('/DVP/API/' + version + '/voxbone/trunk/:trunkid/limitnumber', authorization({
    resource: "voxbone",
    action: "write"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.TrunkSetup] - [HTTP]  - Request received -  Data - %s -%s', JSON.stringify(req.body), JSON.stringify(req.params));

        /* var uname;
         var pword;
         try {
         var b64string = req.header('Authorization');
         b64string = b64string.replace("Basic ", "");
         var auth = new Buffer(b64string, 'base64').toString('ascii');
         var authInfo = auth.split(":");
         uname = authInfo[0];
         pword = authInfo[1];
         } catch (ex) {
         logger.error('[DVP-voxbone.SetLimitToNumber] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
         var jsonString = messageFormatter.FormatMessage(new Error("Authorization"), "EXCEPTION", false, "Invalid authorization info");
         res.end(jsonString);
         return;
         }
         */
        var apiKey = config.Services.apiKey;
        var cmp = req.body;
        trunkHandler.SetLimitToNumber(apiKey, cmp.limitDescription, cmp.maxCount, cmp.phoneNumber, req.params.trunkid, res);

    }
    catch (ex) {
        logger.error('[DVP-voxbone.SetLimitToNumber] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/voxbone/inventory/trunk', authorization({
    resource: "voxbone",
    action: "write"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.TrunkSetup] - [HTTP]  - Request received -  Data - %s -%s', JSON.stringify(req.body), JSON.stringify(req.params));

        /* var uname;
         var pword;
         try {
         var b64string = req.header('Authorization');
         b64string = b64string.replace("Basic ", "");
         var auth = new Buffer(b64string, 'base64').toString('ascii');
         var authInfo = auth.split(":");
         uname = authInfo[0];
         pword = authInfo[1];
         } catch (ex) {
         logger.error('[DVP-voxbone.SetLimitToNumber] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
         var jsonString = messageFormatter.FormatMessage(new Error("Authorization"), "EXCEPTION", false, "Invalid authorization info");
         res.end(jsonString);
         return;
         }
         */
        var apiKey = config.Services.apiKey;
        var voxboneUrl = config.Services.voxboneUrl;
        inventoryHandler.ListTrunk(voxboneUrl, apiKey,res);
    }
    catch (ex) {
        logger.error('[DVP-voxbone.SetLimitToNumber] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/voxbone/inventory/listcountries/:pageNumber/:pageSize', authorization({
    resource: "voxbone",
    action: "read"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.ListCountries] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var apiKey = config.Services.apiKey;
        var vox = req.params;
        voxboneHandler.ListCountries(apiKey, res, vox.pageNumber, vox.pageSize);

    }
    catch (ex) {

        logger.error('[DVP-voxbone.ListCountries] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/voxbone/inventory/listdidgroup/:countryCodeA3/:pageNumber/:pageSize', authorization({
    resource: "voxbone",
    action: "read"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.ListDIDGroup] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var vox = req.params;
        var apiKey = config.Services.apiKey;

        voxboneHandler.ListDIDGroup(apiKey, res, vox.countryCodeA3, vox.pageNumber, vox.pageSize);
    }
    catch (ex) {
        logger.error('[DVP-voxbone.ListDIDGroup] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/voxbone/inventory/listdidgroup/type/:didType/:countryCodeA3/:pageNumber/:pageSize', authorization({
    resource: "voxbone",
    action: "read"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.ListDIDGroupByDidType] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var apiKey = config.Services.apiKey;
        var vox = req.params;
        voxboneHandler.ListDIDGroupByDidType(apiKey, res, vox.countryCodeA3, vox.didType, vox.pageNumber, vox.pageSize);

    }
    catch (ex) {

        logger.error('[DVP-voxbone.ListDIDGroupByDidType] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.post('/DVP/API/' + version + '/voxbone/order/OrderDids', authorization({
    resource: "voxbone",
    action: "write"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.OrderDids] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        var apiKey = config.Services.apiKey;
        var vox = req.params;
        var channelCount = vox.ChannelCount? vox.ChannelCount: 1;
        var customRef = vox.customerReference? vox.customerReference: "Company:"+req.user.company;
        voxboneHandler.OrderDids(req,apiKey, res, customRef, vox.description, vox.didGroupId, vox.quantity, channelCount, vox.countryCodeA3, vox.numberSetupFee, vox.monthlyFee);

    }
    catch (ex) {

        logger.error('[DVP-voxbone.OrderDids] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});




RestServer.get('/DVP/API/' + version + '/voxbone/inventory/liststate/:countryCodeA3', authorization({
    resource: "voxbone",
    action: "write"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.ListState] - [HTTP]  - Request received -  Data - %s -%s', JSON.stringify(req.body), JSON.stringify(req.params));

        /* var uname;
         var pword;
         try {
         var b64string = req.header('Authorization');
         b64string = b64string.replace("Basic ", "");
         var auth = new Buffer(b64string, 'base64').toString('ascii');
         var authInfo = auth.split(":");
         uname = authInfo[0];
         pword = authInfo[1];
         } catch (ex) {
         logger.error('[DVP-voxbone.SetLimitToNumber] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
         var jsonString = messageFormatter.FormatMessage(new Error("Authorization"), "EXCEPTION", false, "Invalid authorization info");
         res.end(jsonString);
         return;
         }
         */
        var vox = req.params;
        var apiKey = config.Services.apiKey;
        var voxboneUrl = config.Services.voxboneUrl;
        inventoryHandler.ListState(voxboneUrl, apiKey,res, vox.countryCodeA3);
    }
    catch (ex) {
        logger.error('[DVP-voxbone.ListState] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/voxbone/inventory/listdidgroup/state/:stateId/:didType/:countryCodeA3/:pageNumber/:pageSize', authorization({
    resource: "voxbone",
    action: "read"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.ListDIDGroupByDidType] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var apiKey = config.Services.apiKey;
        var vox = req.params;
        var voxboneUrl = config.Services.voxboneUrl;
        inventoryHandler.ListDIDGroupByDidTypeAndState(voxboneUrl, apiKey, res, vox.countryCodeA3, vox.didType, vox.stateId, vox.pageNumber, vox.pageSize);

    }
    catch (ex) {

        logger.error('[DVP-voxbone.ListDIDGroupByDidType] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});


RestServer.put('/DVP/API/' + version + '/voxbone/order/ConfigDid', authorization({
    resource: "voxbone",
    action: "write"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.ConfigDid] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        var apiKey = config.Services.apiKey;
        var vox = req.body;

        voxboneHandler.ConfigureDid(apiKey, res, vox.DidId, vox.DidEnabled, vox.CapacityEnabled);

    }
    catch (ex) {

        logger.error('[DVP-voxbone.ConfigDid] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/voxbone/order/DidRequest', authorization({
    resource: "voxbone",
    action: "write"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.order.DidRequest] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));


        didReqHandler.GetAllDidRequest(function(err, isSuccess, msg, obj){
            var jsonString = messageFormatter.FormatMessage(err, msg, isSuccess, obj);
            res.end(jsonString);
        });

    }
    catch (ex) {

        logger.error('[DVP-voxbone.order.DidRequest] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/voxbone/order/DidRequest/status/:status', authorization({
    resource: "voxbone",
    action: "write"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.order.DidRequestByStatus] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));


        didReqHandler.GetAllDidRequestByStatus(req.params.status, function(err, isSuccess, msg, obj){
            var jsonString = messageFormatter.FormatMessage(err, msg, isSuccess, obj);
            res.end(jsonString);
        });

    }
    catch (ex) {

        logger.error('[DVP-voxbone.order.DidRequestByStatus] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/voxbone/order/DidRequest/counts', authorization({
    resource: "voxbone",
    action: "read"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.order.GetAllDidRequestCounts] - [HTTP]  - Request received');


        didReqHandler.GetAllDidRequestCounts(function(err, isSuccess, msg, obj){
            var jsonString = messageFormatter.FormatMessage(err, msg, isSuccess, obj);
            res.end(jsonString);
        });

    }
    catch (ex) {

        logger.error('[DVP-voxbone.order.GetAllDidRequestCounts] - [HTTP]  - Exception occurred:: %s', ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});



