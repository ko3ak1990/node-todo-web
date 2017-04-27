const baseUrl = 'https://gentle-sands-92165.herokuapp.com';

var authToken;
var container = document.getElementById('todosContainer');

$(document).ready(function () {
    $("#todosView").hide();

    $('#btnCreate').click(function () {
        createUser($('#emailCreateEditText').val(), $('#passCreateEditText').val());
    });

    $('#btnLogin').click(function () {
        login($('#emailEditText').val(), $('#passEditText').val()).then(function (data) {
            getNotes(data).then(data => {
                console.log("getNotes done" + JSON.stringify(data, 2, 2));
                console.log(data.todos.toString());
                var elems = [];
                var fragment = document.createDocumentFragment();
                $.each(data.todos, function (i, item) {
                    var div = document.createElement("div");
                    var h = document.createElement("h1");
                    var t = document.createTextNode(item['text']);
                    h.appendChild(t);
                    $(div).addClass("grid-item");
                    $(div).data('todoObj', item);
                    $(div).append(h);
                    fragment.appendChild(div);
                    elems.push(div);
                });
                // append elements to container
                container.appendChild(fragment);
                $("#loginView").hide();
                $("#todosView").show();

            }).fail(function (error) {
                console.log("error" + JSON.stringify(error, 2, 2));
            })
        });
    });


    $("#btnLogout").click(function () {
        $('form')[0].reset();
        $("#todosContainer").empty();
        $("#loginView").show();
        $("#todosView").hide();
    });


    $('.message a').click(function () {
        $('form').animate({height: "toggle", opacity: "toggle"}, "fast");
    });

    var $grid = $('.grid').masonry({
        itemSelector: '.grid-item',
        columnWidth: 160,
        stagger: 30,
    });

    $grid.on('click', '.grid-item', function () {

        // // change size of item via class
        // $(this).toggleClass('grid-item--gigante');
        // var todo =  $(this).data('todoObj');
        // console.log('click todoID :' +todo._id);
        // // trigger layout
        // $grid.masonry();
        $(this).attr('contenteditable', 'true');
    });

    $grid.on('keypress', '.grid-item', function (e) {

        // // change size of item via class
        // $(this).toggleClass('grid-item--gigante');
        // var todo =  $(this).data('todoObj');
        // console.log('click todoID :' +todo._id);
        // // trigger layout
        // $grid.masonry();
        if (e.which === 13) {
            let text = $(this).text();
            let todo = $(this).data('todoObj');
            if (!text.isEmpty()) {
                todo.text = text;
                updateNote(todo).then(function () {
                    alert('your note is updated');
                    $(':text').blur();
                }).fail(function (error) {
                    alert("updated failed");
                    $(':text').blur();
                });
            } else {
                alert('your note is empty. Would you like to delete it');
            }
        }
    });
});

String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
};

function updateNote(todo) {
    console.log("update note token | noteId ", authToken + " " + todo._id);
    return $.ajax({
        //The URL to process the request
        url: baseUrl + '/todos/' + todo._id,
        //The type of request, also known as the "method" in HTML forms
        //Can be 'GET' or 'POST'
        type: 'PATCH',
        crossDomain: true,
        contentType: "application/json; charset=utf-8",
        headers: {
            "x-auth": authToken
        },
        data: JSON.stringify({
            text: todo.text
        })
    });
}
function getNotes(user) {
    authToken = user.authToken;
    return $.ajax({
        //The URL to process the request
        url: baseUrl + '/todos',
        //The type of request, also known as the "method" in HTML forms
        //Can be 'GET' or 'POST'
        type: 'GET',
        headers: {
            "x-auth": user.authToken
        }
    });
}

function writeMessage(msg) {
    $("#para").append(msg + "<br>");
}

function login(email, password) {
    console.log("login in email" + email + "|" + "password:" + password);
    return $.ajax({
        accepts: {
            mycustomtype: 'application/x-some-custom-type'
        },
        //The URL to process the request
        url: baseUrl + '/users/login',
        //The type of request, also known as the "method" in HTML forms
        //Can be 'GET' or 'POST'
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        //Any post-data/get-data parameters
        //This is optional
        data: JSON.stringify({
            email: email,
            password: password
        })
        // //The response from the server
        // error: function (response) {
        //     return new Promise.reject(response);
        // },
        // success: function (response) {
        //     return new Promise.resolve(response);
        // }
    });
}


function createUser(email, password) {
    $.ajax({
        //The URL to process the request
        url: baseUrl + '/users',
        //The type of request, also known as the "method" in HTML forms
        //Can be 'GET' or 'POST'
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        //Any post-data/get-data parameters
        //This is optional
        data: JSON.stringify({
            email: email,
            password: password
        }),
        error: function (response) {
            console.log(response);
            alert(response.responseJSON.message);
        },
        success: function (response) {
            authToken = response.headers['x-auth'];
        }
    });
}

