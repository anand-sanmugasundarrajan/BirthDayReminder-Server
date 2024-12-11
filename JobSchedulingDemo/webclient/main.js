document.addEventListener('DOMContentLoaded', function () {

    window.birthdayReminder = function (event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const birthday = document.getElementById('birthday').value;
        const message = document.getElementById('message').value;
        const bemail = document.getElementById('bemail').value;

        // Validate that all fields are filled out
        if (!name || !birthday || !message || !bemail) {
            alert('Please fill out all fields');
            return;
        }

        // Create the config object used to execute the function
        var config = {
            "args": {
                "name": name,
                "birthday": birthday,
                "message": message,
                "bemail": bemail
            },
            "method": "GET"
        };

        // Execute the function by passing the config object
        var functions = catalyst.function;
        var functionObject = functions.functionId('24071000000022033');

        console.log(functionObject);
        var functionPromise = functionObject.execute(config);

        functionPromise
            .then((response) => {
                response.json().then(responseBody => {
                    console.log(responseBody);
                });
            })
            .catch((err) => {
                console.log(err);
                alert('Failed to send birthday reminder');
            });
    }
});
