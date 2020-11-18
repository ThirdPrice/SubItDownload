document.addEventListener('DOMContentLoaded', function() {  
    var checkPageButton = document.getElementById('mainButt');  
    checkPageButton.addEventListener('click', function() {  
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
                document.getElementById("results").innerText = response.response;
            });
        }); 
    }, false);  
}, false);  