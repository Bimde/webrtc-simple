document.addEventListener("DOMContentLoaded", function(event) {
  get_ice_candidates();
}, false);

var peer_id;
var username;
var conn;

function get_ice_candidates() {
  fetch('https://kram-twilio.azurewebsites.net/api/kram-twilio-trigger')
    .then(res => initialize(res.json()))
    .then((out) => {
        console.log('Done twilio req: ', out);
  }).catch(err => console.error(err));
}

function initialize(twilio_res) {

  /**
   * Important: the host needs to be changed according to your requirements.
   * e.g if you want to access the Peer server from another device, the
   * host would be the IP of your host namely 192.xxx.xxx.xx instead
   * of localhost.
   * 
   * The iceServers on this example are public and can be used for your project.
   */
  var peer = new Peer({
    'iceServers': twilio_res.ice_servers
  });

  // Once the initialization succeeds:
  // Show the ID that allows other user to connect to your session.
  peer.on('open', function () {
    document.getElementById("peer-id-label").innerHTML = peer.id;
  });

  // When someone connects to your session:
  // 
  // 1. Hide the peer_id field of the connection form and set automatically its value
  // as the peer of the user that requested the connection.
  // 2. Update global variables with received values
  peer.on('connection', function (connection) {
    conn = connection;
    peer_id = connection.peer;

    // Use the handleMessage to callback when a message comes in
    conn.on('data', handleMessage);

    // Hide peer_id field and set the incoming peer id as value
    document.getElementById("peer_id").className += " hidden";
    document.getElementById("peer_id").value = peer_id;
    document.getElementById("connected_peer").innerHTML = connection.metadata.username;
  });

  peer.on('error', function(err){
    alert("An error ocurred with peer: " + err);
    console.error(err);
  });

  /**
  * Handle the send message button
  */
  document.getElementById("send-message").addEventListener("click", function(){
    // Get the text to send
    var text = document.getElementById("message").value;

    // Prepare the data to send
    var data = {
      from: username, 
      text: text 
    };

    // Send the message with Peer
    conn.send(data);

    // Handle the message on the UI
    handleMessage(data);

    document.getElementById("message").value = "";
  }, false);

  /**
   * On click the connect button, initialize connection with peer
   */
  document.getElementById("connect-to-peer-btn").addEventListener("click", function(){
    username = document.getElementById("name").value;
    peer_id = document.getElementById("peer_id").value;

    if (peer_id) {
      conn = peer.connect(peer_id, {
        metadata: {
          'username': username
        }
      });

      conn.on('data', handleMessage);
    }else{
      alert("You need to provide a peer to connect with !");
      return false;
    }

    document.getElementById("chat").className = "";
    document.getElementById("connection-form").className += " hidden";
  }, false);
}

/**
 * Appends the received and sent message to the listview
 * 
 * @param {Object} data 
 */
function handleMessage(data) {
  var orientation = "text-left";

  // If the message is yours, set text to right !
  if(data.from == username){
    orientation = "text-right"
  }

  var messageHTML =  '<a href="javascript:void(0);" class="list-group-item' + orientation + '">';
  messageHTML + '<h4 class="list-group-item-heading">'+ data.from +'</h4>';
  messageHTML += '<p class="list-group-item-text">'+ data.text +'</p>';
  messageHTML += '</a>';

  document.getElementById("messages").innerHTML += messageHTML;
}