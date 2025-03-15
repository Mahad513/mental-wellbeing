// Hide/show navbar on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 200) {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }
});

// Search functionality
document.getElementById('search-btn').addEventListener('click', function() {
    var query = document.getElementById('search-input').value.toLowerCase();
    resetHighlights();

    var sections = document.querySelectorAll('h1, h2, h3, p');
    var found = false;
    var firstMatch = null;

    sections.forEach(function(section) {
        var text = section.innerHTML.toLowerCase();
        var index = text.indexOf(query);
        if (index !== -1) {
            var originalText = section.innerHTML;
            var highlightedText = highlightText(originalText, query);
            section.innerHTML = highlightedText;
            if (!firstMatch) firstMatch = section;
            found = true;
        }
    });

    if (found && firstMatch) {
        firstMatch.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
        alert('No matching content found!');
    }
});

function highlightText(text, query) {
    var regex = new RegExp(query, "gi");
    return text.replace(regex, function(match) {
        return `<span class="highlight">${match}</span>`;
    });
}

function resetHighlights() {
    var highlighted = document.querySelectorAll('.highlight');
    highlighted.forEach(function(span) {
        span.outerHTML = span.innerHTML;
    });
}

// Prevent Enter key from reloading page on search input
document.getElementById('search-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
});

// Forum logic
function initForum() {
    const loginForm = document.querySelector('.login-section');
    const commentInput = document.querySelector('#comment-input-section');
    const commentsWrapper = document.querySelector('.comments-wrp');
    const loginUsername = document.querySelector('#login-username');
    const loginBtn = document.querySelector('#login-btn');
    const logoutBtn = document.querySelector('#logout-btn');

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    function updateLoginStatus() {
        if (currentUser) {
            // If user is logged in:
            loginUsername.style.display = 'none';
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline';
            commentInput.style.display = 'block';
        } else {
            // If user is logged out:
            loginUsername.style.display = 'inline';
            loginBtn.style.display = 'inline';
            logoutBtn.style.display = 'none';
            commentInput.style.display = 'none';
        }
    }

    function showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }

    async function loadComments() {
        try {
            const response = await fetch('/api/comments');
            if (!response.ok) throw new Error('Failed to load comments');
            const comments = await response.json();
            displayComments(comments);
        } catch (error) {
            showMessage('Failed to load comments', 'error');
        }
    }

    function displayComments(comments) {
        commentsWrapper.innerHTML = '';
        comments.forEach(comment => {
            const commentElement = createCommentElement(comment);
            commentsWrapper.appendChild(commentElement);
        });
    }

    function createCommentElement(comment) {
        const div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = `
            <div class="comment-header">
                <img src="${comment.user.image?.png || 'images/profile.png'}" alt="avatar" class="usr-img">
                <div class="usr-name">${comment.user.username}</div>
                <div class="cmnt-at">${new Date(comment.createdAt).toLocaleString()}</div>
            </div>
            <p class="c-body">${comment.content}</p>
            <div class="comment-actions">
                <div class="score">
                    <button class="score-plus" onclick="handleVote('${comment._id}', 'up')">
                        <i class="fas fa-plus"></i>
                    </button>
                    <span>${comment.score}</span>
                    <button class="score-minus" onclick="handleVote('${comment._id}', 'down')">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
                ${
                  currentUser?.username === comment.user.username 
                    ? `
                      <button onclick="editComment('${comment._id}')" class="edit">
                          <i class="fas fa-edit"></i> Edit
                      </button>
                      <button onclick="deleteComment('${comment._id}')" class="delete">
                          <i class="fas fa-trash"></i> Delete
                      </button>
                    `
                    : ''
                }
            </div>
        `;
        return div;
    }

    // Handle login
    loginBtn.addEventListener('click', () => {
        const username = loginUsername.value.trim();
        if (!username) {
            showMessage('Please enter a username', 'error');
            return;
        }
        currentUser = { username, image: { png: 'images/profile.png' } };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateLoginStatus();
        showMessage('Logged in successfully');
        loadComments();
    });

    // Handle logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        currentUser = null;
        updateLoginStatus();
        showMessage('Logged out successfully');
        loadComments();
    });

    // Handle posting a new comment
    commentInput.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) {
            showMessage('Please log in first', 'error');
            return;
        }

        const content = commentInput.querySelector('.cmnt-input').value.trim();
        if (!content) {
            showMessage('Please enter a comment', 'error');
            return;
        }

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    user: currentUser
                })
            });

            if (!response.ok) throw new Error('Failed to post comment');

            commentInput.querySelector('.cmnt-input').value = '';
            showMessage('Comment posted successfully');
            loadComments();
        } catch (error) {
            showMessage('Failed to post comment', 'error');
        }
    });

    // Initialize
    updateLoginStatus();
    loadComments();
}

// Attach to DOMContentLoaded
document.addEventListener('DOMContentLoaded', initForum);

// The following functions are placeholders (edit, delete, vote).
// You can flesh these out similarly to the 'post' logic.

window.handleVote = async (commentId, voteType) => {
    try {
        const response = await fetch(`/api/comments/${commentId}/vote`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: voteType })
        });
        if (!response.ok) throw new Error('Failed to vote');
        // Reload comments to reflect updated scores
        document.dispatchEvent(new Event('DOMContentLoaded'));
    } catch (error) {
        console.error(error);
    }
};

window.deleteComment = async (commentId) => {
    try {
        const response = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete comment');
        document.dispatchEvent(new Event('DOMContentLoaded'));
    } catch (error) {
        console.error(error);
    }
};

window.editComment = async (commentId) => {
    // Example placeholder function for editing a comment
    const newContent = prompt('Edit your comment:');
    if (!newContent) return;

    try {
        const response = await fetch(`/api/comments/${commentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newContent })
        });
        if (!response.ok) throw new Error('Failed to edit comment');
        document.dispatchEvent(new Event('DOMContentLoaded'));
    } catch (error) {
        console.error(error);
    }
};
