document.addEventListener("DOMContentLoaded", function() {
    const shareLink = document.getElementById('shareLink');
    const copyIcon = document.getElementById('copyIcon');
    const generatedLink = document.getElementById('generatedLink');
    const linkContainer = document.getElementById('shareableLinkContainer');

    if (shareLink) {
        shareLink.addEventListener('click', function(event) {
            event.preventDefault();
            const khataId = shareLink.getAttribute('data-id');
            fetch(`/generate-share-link/${khataId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.shareableLink) {
                    generatedLink.href = data.shareableLink;
                    generatedLink.textContent = data.shareableLink;
                    linkContainer.style.display = 'block';
                    console.log("link generated successfully")
                } else {
                    alert('Failed to generate shareable link');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while generating the shareable link');
            });
        });
    }
});
