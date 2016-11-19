/**
 * Created by Heshan.i on 11/11/2016.
 */

var dbConn = require('dvp-dbmodels');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;

var AddVoxDidRequest = function(tenant, company, orderDetails, capacity, setup100, monthly100, callback){
    try{
        dbConn.VoxboneDIDRequest.find({where: [{Company: company},{Tenant: tenant},{DidId: orderDetails.didId.toString()}]})
            .then(function (didRequest)
            {

                if(didRequest && capacity > didRequest.CapacityRequested)
                {
                    //allow update
                    didRequest.updateAttributes({CapacityRequested: capacity, RequestStatus: 'processing'}).then(function (rslt)
                    {
                        logger.info('[DVP-VoxboneAPI.AddVoxDidRequest] PGSQL Update voxbone request query success');
                        callback(undefined, true, "Update Voxbone DID Request Success, Your Request in Processing State");


                    }).catch(function(err)
                    {
                        logger.error('[DVP-VoxboneAPI.AddVoxDidRequest] PGSQL Update voxbone request query failed', err);
                        callback(err, false, "Update Voxbone DID Request Failed");
                    });
                }
                else
                {
                    //Save
                    var voxboneRequest = dbConn.VoxboneDIDRequest.build({
                        Company: company,
                        Tenant: tenant,
                        DidId:orderDetails.didId,
                        DidNumber:orderDetails.e164,
                        TrunkId:orderDetails.trunkId,
                        CapacityRequested:capacity,
                        CapacityEnabled:0,
                        DidSetupPrice100:setup100,
                        DidMonthlyPrice100: monthly100,
                        DidEnabled:false,
                        RequestStatus:'requested'
                    });
                    voxboneRequest
                        .save()
                        .then(function (rslt)
                        {
                            logger.debug('[DVP-VoxboneAPI.AddVoxDidRequest] - [%s] - PGSQL query success', rslt);
                            callback(undefined, true, "Add Voxbone DID Request Success");

                        }).catch(function(err)
                        {
                            logger.error('[DVP-VoxboneAPI.AddVoxDidRequest] - PGSQL query failed', err);
                            callback(err, false, "Add Voxbone DID Request Failed");
                        })
                }


            }).catch(function(err)
            {
                logger.error('[DVP-VoxboneAPI.AddVoxDidRequest] - PGSQL query failed', err);
                callback(err, false, "Add Voxbone DID Request Failed");
            });
    }catch(ex){
        logger.error('[DVP-VoxboneAPI.AddVoxDidRequest] - PGSQL query failed', ex);
        callback(ex, false, "Error in Add Voxbone DID Request");
    }
};

var EnableCapacity = function(tenant, company, didId, enabledCapacity, didEnabled, callback){
    try{
        dbConn.VoxboneDIDRequest.find({where: [{Company: company},{Tenant: tenant},{DidId: didId}]})
            .then(function (didRequest)
            {

                if(didRequest)
                {
                    //allow update
                    didRequest.updateAttributes({CapacityEnabled: enabledCapacity, RequestStatus: 'completed', DidEnabled: didEnabled}).then(function (rslt)
                    {
                        logger.info('[DVP-VoxboneAPI.AddVoxDidRequest] PGSQL Update voxbone request query success');
                        callback(undefined, true, "Enable Capacity for DID Success");


                    }).catch(function(err)
                    {
                        logger.error('[DVP-VoxboneAPI.AddVoxDidRequest] PGSQL Update voxbone request query failed', err);
                        callback(err, false, "Enable Capacity for DID Failed");
                    });
                }
                else
                {
                    logger.error('[DVP-VoxboneAPI.EnableCapacity] - PGSQL query failed');
                    callback(undefined, false, "No DID Request Found");
                }


            }).catch(function(err)
            {
                logger.error('[DVP-VoxboneAPI.EnableCapacity] - PGSQL query failed', err);
                callback(err, false, "Error in EnableCapacity");
            });
    }catch(ex){
        logger.error('[DVP-VoxboneAPI.AddVoxDidRequest] - PGSQL query failed', ex);
        callback(ex, false, "Error in EnableCapacity");
    }
};

var SetTrunk = function(tenant, company, orderDetails, trunkId, callback){
    try{
        dbConn.VoxboneDIDRequest.find({where: [{Company: company},{Tenant: tenant},{DidId: orderDetails.didId}]})
            .then(function (didRequest)
            {

                if(didRequest)
                {
                    //allow update
                    didRequest.updateAttributes({TrunkId: trunkId, RequestStatus: 'processing'}).then(function (rslt)
                    {
                        logger.info('[DVP-VoxboneAPI.SetTrunk] PGSQL Update set trunk query success');
                        callback(undefined, true, "Set trunk for DID Success, Your Request in Processing State");


                    }).catch(function(err)
                    {
                        logger.error('[DVP-VoxboneAPI.SetTrunk] PGSQL Update set trunk query failed', err);
                        callback(err, false, "Set trunk for DID Failed");
                    });
                }
                else
                {
                    logger.error('[DVP-VoxboneAPI.SetTrunk] - PGSQL query failed');
                    callback(undefined, false, "No DID Request Found");
                }


            }).catch(function(err)
            {
                logger.error('[DVP-VoxboneAPI.SetTrunk] - PGSQL query failed', err);
                callback(err, false, "Error in EnableCapacity");
            });
    }catch(ex){
        logger.error('[DVP-VoxboneAPI.SetTrunk] - PGSQL query failed', ex);
        callback(ex, false, "Error in EnableCapacity");
    }
};

var SetRequestStatus = function(tenant, company, didId, status, callback){
    try{
        dbConn.VoxboneDIDRequest.find({where: [{Company: company},{Tenant: tenant},{DidId: didId}]})
            .then(function (didRequest)
            {

                if(didRequest)
                {
                    //allow update
                    didRequest.updateAttributes({RequestStatus: status}).then(function (rslt)
                    {
                        logger.info('[DVP-VoxboneAPI.SetRequestStatus] PGSQL Update request status query success');
                        callback(undefined, true, "Set Status for DID Success");


                    }).catch(function(err)
                    {
                        logger.error('[DVP-VoxboneAPI.SetRequestStatus] PGSQL Update request status query failed', err);
                        callback(err, false, "Set Status for DID Failed");
                    });
                }
                else
                {
                    logger.error('[DVP-VoxboneAPI.SetRequestStatus] - PGSQL query failed');
                    callback(undefined, false, "No DID Request Found");
                }


            }).catch(function(err)
            {
                logger.error('[DVP-VoxboneAPI.SetRequestStatus] - PGSQL query failed', err);
                callback(err, false, "Error in EnableCapacity");
            });
    }catch(ex){
        logger.error('[DVP-VoxboneAPI.SetRequestStatus] - PGSQL query failed', ex);
        callback(ex, false, "Error in EnableCapacity");
    }
};

module.exports.AddVoxDidRequest = AddVoxDidRequest;
module.exports.EnableCapacity = EnableCapacity;
module.exports.SetTrunk = SetTrunk;
module.exports.SetRequestStatus = SetRequestStatus;