/**
 * Created by fantsay on 05.02.2017.
 */
function GO(wsurl) {
    if (!wsurl)
        wsurl = "ws://nuclear.t.javascript.ninja";
    GO.socket = new WebSocket(wsurl)
        GO.socket.onopen = function (event) {
        GO.getID();

     };
    GO.getID = function() {

    GO.socket.onmessage = function (event) {
        var dt = event.data;
        var obj = JSON.parse(dt);
        chkstate(obj.stateId);

    }
    };



    
   }




function chkstate(stateId) {
    var query1 = {action: "check", "lever1": 0, "lever2": 1, stateId: stateId };
    var query2 = {action: "check", "lever1": 2, "lever2": 3, stateId: stateId };
    var query3 = {action: "check", "lever1": 0, "lever2": 3, stateId: stateId };
    var run  = function goo () {
    GO.socket.send(JSON.stringify(query1));
    GO.socket.send(JSON.stringify(query2));
    GO.socket.send(JSON.stringify(query3));

    }
}
