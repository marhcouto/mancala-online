import { $ } from './utils.js'

export class MessageNotifier {
    static clearMessageBox() {
        $("message-area").innerHTML = "";
    }

    static addTextMessage(msg) {
        let messageArea = $("message-area");
        let newMessage = document.createElement("p");
        newMessage.innerText = msg;
        messageArea.appendChild(newMessage);
        messageArea.scrollTop = messageArea.scrollHeight; 
    }

    static addRichMessage(msgElm) {
        $("message-area").appendChild(msgElm);
    }

    static addMessageWithAction(normalText, actionText, callback) {
        let normalMessage = document.createElement('p');
        normalMessage.innerText = normalText;
        let actionMessage = document.createElement('strong');
        actionMessage.style.textDecoration = "underline";
        actionMessage.innerText = actionText;
        actionMessage.style.cursor = "pointer"
        actionMessage.addEventListener('click', callback);
        normalMessage.appendChild(actionMessage);
        $('message-area').appendChild(normalMessage)
    }
}