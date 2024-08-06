
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchbar');
    const allFiles = document.querySelector('.allfiles');
    let files = []; // Initialize an empty array to store file names
    fetch('/api/files')
        .then(response => {
            return response.json();
        })
        .then(data => {
            files = data.files 
            renderFile(files)
        })
        .catch(error => console.error('Error fetching files:', error));
        function renderFile(files) {
            let filelist = '';
            files.forEach(file => {
                filelist += `
                    <div class="file-item px-4 py-4 w-1/3 bg-blue-500 mt-5 rounded-md text-white flex justify-between text-xl">
                        <div>
                            <h3 class="inline mr-4">${file}</h3>
                            <a href="/hisaab/${file}"><i class="ri-arrow-right-line text-green-700 p-1 bg-white rounded-full"></i></a>
                        </div>
                        <div>
                            <a href="/edit/${file}"><i class="ri-pencil-line mr-4 text-xl p-2"></i></a>
                            <a href="/delete/${file}"><i class="ri-delete-bin-2-line bg-white text-red-700 rounded-full p-1"></i></a>
                        </div>
                    </div>
                `;
            });
            allFiles.innerHTML = filelist;
        }

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const matchingFiles = files.filter(file => {
                return file.toLowerCase().startsWith(query)
            });
            renderFile(matchingFiles);
        });
        
});
