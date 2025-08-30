/* Javascript to manage user interface */

const userList = document.getElementById('deviceList');
const file = document.getElementById('inputFile').files[0];

function joinNewUser(id) {
  const newUser = document.createElement('div');
  newUser.id = id;
  newUser.innerHTML = `
    <div class="device" onclick="selectPeer('${id}')">
        <img src="./assets/svg/broadcast.svg" alt="device icon">
            <span>Unknown</span>
            <span>ID: ${id}</span>
    </div>`;
  userList.appendChild(newUser);
  console.log(`${id} has joined the room`);
}

function leaveUser(id) {
  const user = document.getElementById(id);
  if (user) {
    user.remove();
    console.log(`${id} has left the room`);
  } else {
    console.error(`User with id ${id} not found`);
  }
}

function sendFile() {
  const file = document.getElementById('inputFile').files[0];
  return file;
}

export { joinNewUser, leaveUser, sendFile };