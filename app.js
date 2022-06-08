const TOKEN = '[YOUR TOKEN HERE]';

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(TOKEN, { polling: true });

const queryString = "https://api.telegram.org/bot" + TOKEN + "/";
const parse_mode = "HTML";

//Invites group ID.
const groupId = "[YOUR GROUP ID HERE]";

async function showStart(chat_id){
	const message = "<b>Hi, I'm Idena's bot. I will help you getting an invitation code.</b> Use <code>/help</code> to learn more about how I can help you or begin with <code>/ask_invite</code>. This is currently under testing, so all invites requests will be sent to <a href='https://t.me/idena_bot_test'>https://t.me/idena_bot_test</a>";

	await fetch(queryString + 'sendMessage?chat_id=' + chat_id + '&text=' + message + '&parse_mode=' + "HTML");
}
async function showError(chat_id, message = "<b>Sorry, I don't know what that command means, please use one of the following:</b>"){

	await fetch(queryString + 'sendMessage?chat_id=' + chat_id + '&text=' + message + '&parse_mode=' + "HTML");
}
async function showHelp(chat_id){
	const messages = [];
  	
	messages.push("<b>Hi, I'm Idena's bot. I will help you getting an invitation code.</b>");
	messages.push("This is currently under testing, so all invites requests will be sent to <a href='https://t.me/idena_bot_test'>https://t.me/idena_bot_test</a>");
	messages.push("Use <code>/ask_invite</code> or <code>/ask_invite [your_idena_address]</code> and I will share your username or address in the group so anyone can send you an invite. <b><i>Example usage: <code>/ask_invite</code> or providing an address<code>/ask_invite 0x456f4b9ac68274e9acb2302b5e893f4e34eb5d4a</code></i></b>.");
	messages.push("Already recieved an invitation code? Use <code>/remove_invite_requests</code> and I will remove the message I sent asking an invite for you.");

	for(message of messages) await fetch(queryString + 'sendMessage?chat_id=' + chat_id + '&text=' + message + '&parse_mode=' + "HTML");
}

async function askInvite(userId, userName, originalMessage){

	if (originalMessage !== '/ask_invite' && !originalMessage.includes(' ')){
		showError(userId);
		return;
	} else if (originalMessage.includes(' ')){
		let validAddress = false;
		let address = originalMessage.split(' ')[1];

		let rx = new RegExp(/0x([0-9]|[a-f])+([0-9a-f]+)$/i);

		if (!rx.test(address) || address.length != 42){
			const message = `<b>The address provided is not valid, please try again.</b>`;
			await fetch(queryString + 'sendMessage?chat_id=' + userId + '&text=' + message + '&parse_mode=' + "HTML");
			return;
		}

		userName = `Identity <a href='https://scan.idena.io/address/${address}'>${address}</a>`;
	} else userName = "@" + userName;


	const message = `<b>${userName} is looking for an invitation code</b>, mind sharing one?`;

	await fetch(queryString + 'sendMessage?chat_id=' + groupId + '&text=' + message + '&parse_mode=' + "HTML");
}

bot.onText(/\//, (msg, match) => {
	//User chat ID.
	const userId = msg.chat.id;
	const userName = msg.from.username;

	//Defines wether the user has chosen to post it's address in the group or not.
	let inviteUsingAddress = true;
	if(String(match.input).includes("/ask_invite")) askInvite(userId, userName, match.input);
	else {
		switch(match.input){
			case("/start"):
			showStart(userId);
			break;
			case("/help"):
			showHelp(userId);
			break;

			/* TODO:
			case("/remove_invite_requests"):
			removeRequests(userName);
			break;
			*/

			default:
			showError(userId);
		}
	}
});