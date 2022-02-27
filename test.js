fetch("http://localhost:3000/handle", {
    method: "POST",
    headers: {
        "Content-type": "application/json"
    },
    body: JSON.stringify({run: "console.log('test')"}),
}).then(function (response) {
    return response.json();
}).then(function (data) {
    console.log('Request succeeded with JSON response', data);
}).catch(function (error) {
    console.log('Request failed', error);
});