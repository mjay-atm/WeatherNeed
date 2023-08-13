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
            ul_data += `<li class="list-item">${e}</li>`
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