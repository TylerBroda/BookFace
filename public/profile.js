var hostURL = "http://localhost:3000/";
var imgURL = "http://localhost:3000/images/";
var sessionUsername;

async function makePosts() {
    var jsonData = JSON.parse(this.responseText);
    //console.log(jsonData);
    for (var i = jsonData.length - 1; i > -1; i--) {
        addPostToPage(jsonData[i].username,
            jsonData[i].postText,
            jsonData[i].imageURL,
            jsonData[i].time,
            jsonData[i]._id,
            jsonData[i].likes,
            jsonData[i].comments,
        );
    }

    commentButton();
}

function addPostToPage(username, postText, imageName, postTime, postID, numLikes, comments){
    // if an image exists in the post we want to add it to the post. otherwise we want image to remain an empty string
    var image = "";
    if(imageName != undefined && imageName != ""){
        image = `<p><img class="attachedpicture" id="attachedpicture" src=${imageName} height="200" width="200"/></p>`;
    }

    var iLikedImg = `<img id="likeImage" src="images/heart.png" height="20">`;
    for (i = 0; i < numLikes.length; i++){
        if(sessionUsername == numLikes[i]){
            iLikedImg = `<img id="likeImage" src="images/hearted.png" height="20">`;
        }
    }
    
    // displays the actual original post to the page
    var postHTML =  `
                <div id="post">
                    <a href="/profile?user=${username}">
                        <image id="postpic" src="${hostURL+"getProfilePic?user="+username}" height="35" />
                    </a>
                    <a id="postname" href="/profile?user=${username}">${username}</a>
                    <div id="posttime">${formatDate(postTime)}</div>
                    <p id="postcontent">${postText}</p>`

    if (imageName != "" && imageName != undefined)
        postHTML += `<div><img class="attachedpicture" id="attachedpicture" src=${imgURL + "useruploads/" + imageName} height="200" width="200"/></p>`

    postHTML += `
                    <input class="postID" type="hidden" name="postID" id="test" value="${postID}">
                    <button class="likebutton" type="submit" formaction="/like" style="background:transparent; border:none; color:transparent;">
                        ${iLikedImg}
                    </button>
                    <a class="likecount" id="likes">${numLikes.length}</a>
                    <a class="commentbutton" type="submit" style="background:transparent; border:none; color:transparent;">
                        <img src="images/comment.png" height="20" width="20">
                    </a>
                    <form method="POST">
                        <a id="comments">`;

    for(var i = 0; i < comments.length; i++){
        postHTML += `<div id="comment">
            <a href=/profile?user=${comments[i].username}>
                <image id="postpic" src="${hostURL+"getProfilePic?user="+comments[i].username}" height="35" />
            </a>
            <a id="postname" href=/profile?user=${comments[i].username}>${comments[i].username}</a>
            <div id="posttime">${formatDate(comments[i].time)}</div>
            <p id="postcontent">Re: ${comments[i].comment}</p>
        </div>`;
    }

    postHTML += `</a>
            </form>
            <!--share button-->
        </div>
        `; 

    // add the post to the html
    $('#posts').append(postHTML);

    // first element will be the post which was just appended
    //var post = $('#posts')[0].children[$('#posts')[0].children.length - 1];
    //commentButton(post, postID);
}

function formatDate(d){
    // this function returns the post's date in a from we want to display
    var date = new Date(d);
    var dateString = "";
    var mins = "";

    // this is to ensure if it's x:00 we display x:00 instead of x:0 which is the default of getMinutes()
    if (date.getMinutes() < 10){
        mins = `0${date.getMinutes()}`;
    }
    else {
        mins = date.getMinutes();
    }

    // decides how to display the hour (0 is 12am and we don't want a 24 hour clock)
    if (date.getHours() == 0) {
        dateString += `12:${mins}am `;
    }
    else if (date.getHours() < 12) {
        dateString += `${date.getHours()}:${mins}am `;
    }
    else {
        dateString += `${date.getHours() - 12}:${mins}pm `;
    }

    // add the date
    dateString += `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    return dateString;
}

function getUsername(data) {
    sessionUsername = data.srcElement.responseText;

    // if this profile is the user's profile
    if(username == sessionUsername){
        var pageheader = document.getElementById('pageheader');
        pageheader.innerHTML += `
        <form method="POST" action="changeProfilePic" id="profilePicForm" enctype="multipart/form-data">
            <input type="hidden" name="username" id="test" value="${sessionUsername}">
            <input id="fileimage" type="file" name="newProfilePic"/>
        </form>`;
    
        document.getElementById("fileimage").onchange = function () {
            //console.log('submit form');
            document.getElementById("profilePicForm").submit();
        };
    }
}

function commentButton(){
    var commentButtonDOM = document.getElementsByClassName("commentbutton");
    for (i = 0; i < commentButtonDOM.length; i++){
        commentButtonDOM[i].onclick = function(){
            // add input box
            this.parentElement.innerHTML +=   `
                <form id="commentwrap">
                    <input id="commentmessage" type="text" name="textfield" placeholder="Type comment here:"/>
                    <a id="button">Post</a>
                </form>`;

            var commentForm = document.getElementById("button");//this.parentElement[this.childElementCount - 1];
            commentForm.onclick = function() {
                var comment = commentForm.parentElement.children[0].value;

                if (comment != ""){
                    // this gets the id of the parent post
                    var thisPost = commentForm.parentElement.parentElement.children[4].value;
                    var inner = commentForm.parentElement.parentElement;

                    // erase the text box by removing its surrounding div tag
                    commentForm.parentElement.remove();

                    // add the new comment to the html
                    inner.innerHTML += `
                        <div id="comment">
                            <a href=/profile?user=${sessionUsername}>
                                <image id="postpic" src="${hostURL+"getProfilePic?user="+sessionUsername}" height="35" />
                            </a>
                            <a href=/profile?user=${sessionUsername} id="postname">${sessionUsername}</a>
                            <div id="posttime">${formatDate(new Date())}</div>
                            <p id="postcontent">Re: ${comment}</p>
                        </div>`;

                    // add the new comment to the database
                    var postCommentReq = new XMLHttpRequest();
                    postCommentReq.addEventListener("load", (d)=>{console.log('sent')});
                    postCommentReq.open("POST", '/postComment');
                    postCommentReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    postCommentReq.send(JSON.stringify({"comment": comment, "postID": thisPost}));
                }

                // call commentButton again to allow multiple comments
                commentButton();
            }
        }
    }
}

window.onload = function () {
    var address = window.location.href;
    username = address.substr(address.search('user=') + 5, address.length - (address.search('#user=') + 6));

    // Get username from server
    var usernameReq = new XMLHttpRequest();
    usernameReq.addEventListener("load", getUsername);
    usernameReq.open("GET", "/getUsername");
    usernameReq.send();
    
    // find posts
    var postReq = new XMLHttpRequest();
    postReq.addEventListener("load", makePosts);
    postReq.open("GET", "/getUserPosts?user="+username);
    postReq.send();

    // set profilePic
    var profilePic = document.getElementById('profilepicture');
    profilePic.setAttribute("src", hostURL + "getProfilePic?user=" + username);

    // set username field
    $('#username').html(username);
 
}
