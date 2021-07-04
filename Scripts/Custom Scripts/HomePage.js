﻿var userChatAccountsList = [];
var messageList = [];

let commonBridge;
let currentChatUserName = '';
let isConversationWindowOpen = false;

function getAllUserChatAccounts() { // Gets all active Chats on the left hand side
    $("#custom-table-body1").empty();
    let chatAccounts = userChatAccountsList;
    for (i = 0; i < chatAccounts.length; i++) {
        $("#custom-table-body1").append(`
        <tr class="clickable" onclick="openCoversation(this)">
            <td style="padding: 3px; border-bottom: 1px solid grey">
                <div class="card-body dflex">
                    <div class="img-circle fake-img">
                        <img src="/assets/chat-avatar.png" class="image" alt="chat-avatar" />
                    </div>
                    <div class="dflexcol card-details">
                        <h3 id="${'user' + i}" class="custom-margin-block custom-header">${chatAccounts[i].userName}</h3>
                        <label id="${'label' + i}" class="custom-label">${chatAccounts[i].message[chatAccounts[i].message.length - 1] ? chatAccounts[i].message[chatAccounts[i].message.length - 1].message : '' }</label>
                    </div>
                </div>
            </td>
        </tr>`);
    }

    if (isConversationWindowOpen) {
        // Load all chat messages - call function for it!
        getUserChat();
    }
}

function getUserConversationWindow() {
    $('#custom-card-header').empty().append(`
        <div class="card-content dflex" style="padding: 5px 7px; border-bottom: 1px solid grey">
            <div class="img-circle fake-img" style="flex: 3%;"></div>
            <div class="dflexcol card-details" style="flex: 90%;">
                <h3 id="currentConvoUserName" class="custom-margin-block"></h3>
                <label id="currentConvoLabel"></label>
            </div>
        </div>
    `);
}

function getUserChat() {
    let userChat = userChatAccountsList.filter((item, index) => item.userName == currentChatUserName);
    if (userChat && userChat.length > 0) {
        let chats = userChat[0].message;
        $("#custom-table-body2").empty();
        for (i = 0; i < chats.length; i++) {
            if (chats[i].senderUserName == localStorage.getItem('userName')) {
                $("#custom-table-body2").append(
                    `
                    <tr>
                        <td colspan="2" style="display: flex; justify-content: flex-end;">
                            <div class="custom-card-body">
                                <span>
                                    ${chats[i].message}
                                </span>
                            </div>
                        </td>
                    </tr>
                `
                );
            }
            else {
                $("#custom-table-body2").append(
                    `
                    <tr>
                        <td colspan="2" style="display: flex; justify-content: flex-start;">
                            <div class="custom-card-body">
                                <span>
                                    ${chats[i].message}
                                </span>       
                            </div>
                        </td>
                    </tr>
                `
                );
            }
        }
    }
}

function openModal() {
    $("#modal-exhibit").load("RegisterLoginModal");
}

function showModal() {
    if (localStorage.getItem('access_token')) {
        let expiryDate = new Date(localStorage.getItem('expires'));
        let currentDate = new Date();
        if (expiryDate.getTime() < currentDate.getTime()) {
            $("#registerModal").modal('show');
        }
    }
    else {
        $("#registerModal").modal('show');
    }
}

function establishConnection() {
    if (!validator()) {
        alert("Please fill all the required fields");
        return;
    }
    getToken();
}

function validator() {
    let userName = $('#userName').val();
    let password = $('#password').val();
    if ((userName && userName.trim().length > 0) && (password && password.trim().length > 0)) {
        return true;
    }
    else {
        return false;
    }
}

function registerUser() {
    if (!validator()) {
        alert("Please fill all the required fields");
        return;
    }
    $("#loaderClass").removeClass('hide');
    $.ajax({
        url: window.location.origin + '/api/account/register',
        headers: {
            'content-type': 'application/json; charset=utf8'
        },
        method: 'POST',
        data: JSON.stringify({
            'UserName': $('#userName').val(),
            'Email': $('#userName').val() + "@noreply.com",
            'Password': $('#password').val()
        }),
        success: function () {
            getToken();
            $("#loaderClass").addClass('hide');
        },
        error: function (jqXHR) {
            alert(JSON.parse(jqXHR.responseText).error_description);
            $("#loaderClass").addClass('hide');
        }
    });
}

function getToken() {
    $("#loaderClass").removeClass('hide');
    let _data = 'username=' + $('#userName').val() + '&password=' + $('#password').val() + '&grant_type=password';
    $.ajax({
        url: window.location.origin + '/token',
        method: 'POST',
        data: _data,
        success: function (jqXHR) {
            localStorage.setItem('access_token', jqXHR['access_token']);
            localStorage.setItem('expires', jqXHR['.expires']);
            localStorage.setItem('issued', jqXHR['.issued']);
            localStorage.setItem('userName', jqXHR['userName']);
            $("#registerModal").modal('hide');
            $("#loaderClass").addClass('hide');
        },
        error: function (jqXHR) {
            alert(JSON.parse(jqXHR.responseText).error_description);
            $("#loaderClass").addClass('hide');
        },
    });
}

function addEventListeners() {
    document.getElementById('messageBox').addEventListener("keyup", function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode == 13 && !event.shiftKey) {
            // Cancel the default action, if needed
            event.preventDefault();

            sendMessage();
        }
    }); 
}

function sendMessage() {
    let message = $('#messageBox').val();

    if (!(localStorage.getItem('userName') == currentChatUserName)) {
        let currentUserChat = userChatAccountsList.find((item, index) => item.userName == currentChatUserName);
        currentUserChat.message.push({ receiverUserName: currentChatUserName, senderUserName: localStorage.getItem('userName'), message: message });
    }

    commonBridge.invoke('sendMessageTo', localStorage.getItem('userName'), currentChatUserName, message).then(() => {
        console.log('Invoked sendMessageTo successfully!');
        $('#messageBox').val('');
        getUserChat();
    }).catch( (err) => console.log(err));
}

function connectUser() {
    if (!($('#connectToUserName').val() && $('#connectToUserName').val().trim().length > 0)) {
        alert("Please fill all the required fields");
        return;
    }
    let enteredUserName = userChatAccountsList.find((item, index) => item.userName == $('#connectToUserName').val());
    if (enteredUserName) {
        currentChatUserName = $('#connectToUserName').val();
        $('#currentConvoUserName')[0].innerText = currentChatUserName;
        $('#currentConvoLabel')[0].innerText = 'online';

        $('#connectToUserName').val('');
        closeModal('chatConnectionModal');

        // Load all chat messages - call function for it!
        getUserChat();

        return;
    }

    $("#loaderClass").removeClass('hide');
    $.ajax({
        url: window.location.origin + '/home/startNewChat',
        method: 'POST',
        data: {
            userName: $('#connectToUserName').val()
        },
        success: function (jqXHR) {
            let response = jqXHR;
            userChatAccountsList.push({ userId: jqXHR[0].Value, userName: jqXHR[1].Value, message: _.cloneDeep(messageList) });
            getAllUserChatAccounts();
            $('#connectToUserName').val('')
            closeModal('chatConnectionModal');
            $("#loaderClass").addClass('hide');
        },
        error: function (jqXHR) {
            console.error(JSON.parse(jqXHR));
            $('#connectToUserName').val('');
        }
    })
}

function startNewChat() {
    $("#chatConnectionModal").modal('show');
}

function openCoversation(elem) {
    $('#currentConvoUserName')[0].innerText = elem.children[0].children[0].children[1].children[0].innerText;
    $('#currentConvoLabel')[0].innerText = 'online';

    currentChatUserName = elem.children[0].children[0].children[1].children[0].innerText;

    $('#custom-card-header').removeClass('hidden');
    $('#cardFooter').removeClass('hidden');
    $('#img-div').removeClass('hidden');

    isConversationWindowOpen = true;

    // Load all chat messages - call function for it!
    getUserChat();

}

function closeModal(modalId) {
    $('#' + modalId).modal('hide');
}

$(document).ready(() => {
    getAllUserChatAccounts();
    getUserChat();
    showModal();
    initiateSignalR();
    addEventListeners();
}); 


function initiateSignalR() {
    var connection = $.hubConnection();
    connection.logging = true;
    connection.connectionSlow(function () {
        console.log('We are currently experiencing difficulties with the connection.')
    });
    commonBridge = connection.createHubProxy('commonBridge');

    commonBridge.on('messageReceived', (senderUserName, receiverUserName, message) => {
        // We sent the message to server and received the response here.
        console.log('messageReceived', senderUserName, receiverUserName, message);

        if (localStorage.getItem('userName') == receiverUserName) {
            // Create list of Users on left panel

            if (userChatAccountsList.length == 0) {
                userChatAccountsList.push({ userId: '', userName: senderUserName, message: _.cloneDeep(messageList) });
            }
            else if (userChatAccountsList.length > 0 && userChatAccountsList.find(x => x.userName == senderUserName).length == 0) {
                userChatAccountsList.push({ userId: '', userName: senderUserName, message: _.cloneDeep(messageList) });
            }

            let currentUserChat = userChatAccountsList.find((item, index) => item.userName == senderUserName);
            currentUserChat.message.push({ receiverUserName: receiverUserName, senderUserName: senderUserName, message: message });

            getAllUserChatAccounts();
        }
    });

    connection.start().done().fail(function (error) {
        console.log('Invocation of start failed. Error:' + error)
    }).catch(err => console.error(err.toString())).then(function () {});
}