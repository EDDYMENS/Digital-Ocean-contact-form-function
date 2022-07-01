const https = require('https');
const GitHUBURL = 'api.github.com';
const gistID = '<GIST_ID>'; //https://gist.github.com/username/<GIST_ID>
const GitHubToken = '<GITHUB_TOKEN>'; //https://github.com/settings/tokens
const gistFileName = '<GIST_FILE_NAME>'; //https://gist.github.com
const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `token ${GitHubToken}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'node'
};

async function main(args) {
  let name = args.name || '';
  let email = args.email || '';
  let message = args.message || '';
  let validation = validateInput(name, email, message);
  if(!validation.passed) {
      return validation;
  }

  //add new message
  messageList = await getOldMessages();
  var incomingMessage = { name: name, email: email, message: message }
  messageList.push(incomingMessage);
  await updateMessageList(messageList);
  return {status:true, message: "message saved"};
}

async function updateMessageList(updatedMessages) {
    let payload = {};
    payload[fileName] =  { content: JSON.stringify(updatedMessages) };
    var postData = JSON.stringify({
        description: 'Add new contact',
        files: payload
    });

    var params = {
        hostname: GitHUBURL,
        path: `/gists/${gistID}`,
        method: 'POST',
        headers: headers
    };

    output = await requestProcessor(params, postData);
    return output;

}

async function getOldMessages() {
    var params = {
        hostname: GitHUBURL,
        path: `/gists/${gistID}`,
        method: 'GET',
        headers: headers,
    };
    output = await requestProcessor(params);
    return JSON.parse(output.files[fileName].content);
}


function validateInput(name, email, message) {
    if(!name.length || !email.length || !message.length) {
        return {status:false, message: "All fields must be filled"};
    }
    let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    if(!regex.test(email)) {
        return {status:false, message: "Please provide a valid email"};
    }
    return {passed:true, message: ""};
}

function requestProcessor(options, results) {
    return new Promise((resolve, reject) => {
        var req = https.request(options, function (res) {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error('statusCode=' + res.statusCode));
            }
            var body = [];
            res.on('data', (chunk) => {
                body.push(chunk);
            });
            res.on('end', () => {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                } catch (e) {
                    reject(e);
                }
                resolve(body);
            });
        });
        req.on('error', () => {
            reject(err);
        });
        if (results) {
            req.write(results);
        }
        req.end();
    });
}  