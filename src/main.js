function choice(item) {
    
    const choice = document.getElementById('choice-response');
    const choiceField = document.getElementById('choice-response-field');

    choice.style.zIndex = 999;
    choice.classList.remove('d-op');
    choiceField.innerHTML = '';
    
    const ul = document.createElement('ul');
    ul.classList.add('list');
    
    fetch('/data/prepromt.json')
    .then( data => {
        return data.json()
    }).then( result => {

        let ul_data = '';

        if (result[item] == undefined){
            disableChoice();
            alert("Not Yet Implemented!");
            return;
        }
        
        result[item].forEach( e => {
            ul_data += `<li class="list-item" onclick="disableChoice();askQuestion('${e}');">${e}</li>`
        });

        ul_data = ul_data.replace(/(\blist-item\b)(?!.*[\r\n]*.*\1)/, "list-item border-none");
        
        ul.innerHTML = ul_data;
        console.log(ul);
        choiceField.appendChild(ul);
        choiceField.classList.remove('choice-drop');

    });
    
}

function disableChoice() {
    
    const choice = document.getElementById('choice-response');
    const choiceField = document.getElementById('choice-response-field');

    choice.style.zIndex = -999;
    choice.classList.add('d-op');
    choiceField.classList.add('choice-drop');

}

function sendMsg(){

    const typeField = document.getElementById('chat-prompt');
    askQuestion(typeField.value);

}

function askQuestion(question){
    const main = document.querySelector('main');
    const inputField = document.getElementById('chat-prompt');
    const userField = document.createElement('div');
    const aiField = document.createElement('div');

    userField.classList.add("chat-item");
    userField.classList.add("chat-user");
    aiField.classList.add('chat-item');

    userField.innerHTML = `
        <div class="chat-body user">
            ${question}
        </div>
    `

    inputField.value = '';
    main.appendChild(userField);

    aiField.innerHTML = `
    <div class="img-container">
        <img class="need-icon" height="30px" width="45px" src="/img/need.png" alt="need-icon">
    </div>
    <div class="chat-body ai">
        ...
    </div>
    `
    main.appendChild(aiField);
    main.scrollTop = main.scrollHeight;

    fetch(`https://api-wn.tsmc.n0b.me/ask?question=${encodeURIComponent(question)}`)
    .then( result => { return result.json() })
    .then( data => {
        aiField.innerHTML = `
        <div class="img-container">
            <img class="need-icon" height="30px" width="45px" src="/img/need.png" alt="need-icon">
        </div>
        <div class="chat-body ai">
            ${data.data[1][0][1]}
        </div>
        `
        main.scrollTop = main.scrollHeight;
    });

}