module.exports = {
    "DB": {
        "Type":"postgres",
        "User":"duo",
        "Password":"DuoS123",
        "Port":5432,
        "Host":"104.236.231.11",//104.131.105.222
        "Database":"duo" //duo
    },
    "Mongo":
    {
        "ip":"45.55.142.207",
        "port":"27017",
        "dbname":"dvpdb",
        "password":"DuoS123",
        "user":"duo"
    },
    "Redis":
    {
        "ip": "45.55.142.207",
        "port": 6389,
        "password":"DuoS123",
        "redisdb":8,
        "ardsData":6
    },
    "Security":
    {
        "ip": "45.55.142.207",
        "port": 6389,
        "user": "DuoS123",
        "password": "DuoS123"
    },
    "Host": {
        "domain": "0.0.0.0",
        "port": 8832,
        "version": "1.0.0.0",
        "hostpath": "./config",
        "logfilepath": ""
    },

    "Services": {
        "authToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdWtpdGhhIiwianRpIjoiYWEzOGRmZWYtNDFhOC00MWUyLTgwMzktOTJjZTY0YjM4ZDFmIiwic3ViIjoiNTZhOWU3NTlmYjA3MTkwN2EwMDAwMDAxMjVkOWU4MGI1YzdjNGY5ODQ2NmY5MjExNzk2ZWJmNDMiLCJleHAiOjE5MDIzODExMTgsInRlbmFudCI6LTEsImNvbXBhbnkiOi0xLCJzY29wZSI6W3sicmVzb3VyY2UiOiJhbGwiLCJhY3Rpb25zIjoiYWxsIn1dLCJpYXQiOjE0NzAzODExMTh9.Gmlu00Uj66Fzts-w6qEwNUz46XYGzE8wHUhAJOFtiRo",
        "apiKey": "Basic bXVodW50aGFuGiOkR1b3ZveEAxMjMh",
        "limitServiceHost": "192.168.0.54",
        "limitServicePort": 8084,
        "limitServiceVersion": "6.0",
        "trunkServiceHost": "phonenumbertrunkservice.app.veery.cloud",
        "trunkServicePort":9898 ,
        "trunkServiceVersion": "1.0.0.0",
        "billingserviceHost": "192.168.5.188",
        "billingservicePort": "4444",
        "billingserviceVersion": "1.0.0.0",
        "walletserviceHost": "192.168.0.39",
        "walletservicePort": "3333",
        "walletserviceVersion": "1.0.0.0",
        "voxboneUrl": "https://api.voxbone.com/ws-voxbone/services/rest"

    }
};
