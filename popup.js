document.addEventListener('DOMContentLoaded', function() {  
    var checkPageButton = document.getElementById('mainButt');  
    x = document.getElementById("result");
    checkPageButton.addEventListener('click', function() {  
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0].url != "https://account.subitup.com/employee/default.aspx#" && tabs[0].url != "https://account.subitup.com/employee/default.aspx") {
                console.log(tabs[0].url);
                x.style.display = "inline-block";
                x.innerText = "You must be on SubItUp.com!";
            }
            else {
                chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {

                    x.style.display = "inline-block";
                    if (response.response == "success") {
                        x.style.backgroundColor = "#67CF3E";
                        x.innerText = "Download Sucessful!";
                    }
                    else {
                        x.innerText = "Switch to week view!";
                    }
                });
            }
        }); 
    }, false);  
}, false);  
