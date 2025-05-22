document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadHistory();
});

let currentPage = 1;
let totalPages = 1;

async function checkAuth() {
    try {
        const response = await fetch('/auth/profile', {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            window.location.href = '/login';
            return;
        }

        const { data } = await response.json();

        if (!data || !data.user || !data.role) {
            throw new Error('Invalid profile data');
        }

        if (data.role === 'teacher' && !window.location.pathname.includes('teacher')) {
            window.location.href = '/history/teacher';
        } else if (data.role === 'student' && window.location.pathname.includes('teacher')) {
            window.location.href = '/history';
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = '/login';
    }
}

async function loadHistory(page = 1) {
    try {
        showLoading();
        currentPage = page;

        const response = await fetch(`/api/history?page=${page}`, {
            credentials: 'include'
        });
       

        if (!response.ok) {
            throw new Error('Failed to fetch history');
        }

        const { data, pagination } = await response.json();
        totalPages = pagination?.totalPages || 1;
        console.log('History data:', data);
        renderHistory(data);

    } catch (error) {
        console.error('Error loading history:', error);
        showNoHistoryMessage();
    } finally {
        hideLoading();
    }
}

async function renderHistory(history) {
    const container = document.getElementById('experimentContainer');
    const noHistoryMessage = document.getElementById('noHistoryMessage');
    const paginationContainer = document.getElementById('paginationContainer');

    if (!history || history.length === 0) {
        container.classList.add('hidden');
        paginationContainer.classList.add('hidden');
        noHistoryMessage.classList.remove('hidden');

        return;
    }

    container.innerHTML = history.map(item => `
        <div class="mb-2 border-b border-[#1F2937] pb-4 relative">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-semibold text-white mb-2">${item.experiment_name || `Experiment ${item.user_history_id}`}</h3>
                    <p class="text-[#9CA3AF] text-sm mb-4">Date: ${formatDate(item.action_timestamp)}</p>
                </div>
                <div class="absolute top-0 right-5">
                    ${item.compilation_result === 'success' ? `
                    <img src="../Documents/successful.svg" alt="Success" class="w-15 h-15">
                    ` : `
                    <img src="../Documents/failed.svg" alt="Failed" class="w-14 h-14">
                    `}
                </div>
            </div>
            <div class="bg-[#1F2937] rounded-lg p-4">
              <div id="code-${item.user_history_id}" class="text-[#9CA3AF] p-4 rounded-lg text-sm bg-[#0D131F] whitespace-pre-wrap break-words">Loading code...</div>

                <div class="flex items-center mt-4">
                    <div class="flex items-center">
                        <svg class="w-4 h-4 mr-2 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      
                    </div>
                    <div class="ml-auto flex items-center space-x-4">
                        <div class="flex space-x-2">
     
                            ${item.hex_file_link !== 'not available' ? `
                            <a href="${item.hex_file_link}" target="_blank" class="bg-[#9FEF00] text-[#111927] text-xs px-4 py-2 rounded-lg hover:bg-[#76A900] transition duration-300">
                                Download HEX File
                            </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <hr style="  border: none; border-top: 2px solid #0d131f; margin-bottom: 40px">



    `).join('');
    for (const item of history) {
    if (item.ino_file_link && item.ino_file_link.startsWith("http")) {
        const codeElement = document.getElementById(`code-${item.user_history_id}`);
        if (codeElement) {
            try {
                const res = await fetch(item.ino_file_link);
                if (!res.ok) throw new Error("Failed to fetch code");
                const text = await res.text();
                codeElement.innerText = text;
            } catch (err) {
                codeElement.innerText = "Error loading code from Cloudinary.";
            }
        }
    }
}


    container.classList.remove('hidden');
    noHistoryMessage.classList.add('hidden');

    if (totalPages > 1) {
        renderPagination();
        paginationContainer.classList.remove('hidden');
    } else {
        paginationContainer.classList.add('hidden');
    }
}



function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = `
        <button id="prevBtn" class="bg-[#1F2937] text-white px-6 py-2 rounded-lg hover:bg-[#9FEF00] hover:text-[#111827] transition duration-300" ${currentPage === 1 ? 'disabled' : ''}>
            Previous
        </button>
        ${Array.from({ length: totalPages }, (_, i) => `
            <button class="pagination-button ${i + 1 === currentPage ? 'bg-[#9FEF00] text-[#111827]' : 'bg-[#1F2937] text-white'} w-10 h-10 rounded-xl font-semibold" data-page="${i + 1}">
                ${i + 1}
            </button>
        `).join('')}
        <button id="nextBtn" class="bg-[#1F2937] text-white px-6 py-2 rounded-lg hover:bg-[#9FEF00] hover:text-[#111827] transition duration-300" ${currentPage === totalPages ? 'disabled' : ''}>
            Next
        </button>
    `;

    document.querySelectorAll('.pagination-button').forEach(button => {
        button.addEventListener('click', () => {
            currentPage = parseInt(button.dataset.page);
            loadHistory(currentPage);
        });
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadHistory(currentPage);
        }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadHistory(currentPage);
        }
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDuration(seconds) {
    if (!seconds) return "N/A";
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    return `${Math.floor(seconds / 3600)} hours`;
}

function showLoading() {
    document.getElementById('loadingIndicator').classList.remove('hidden');
    document.getElementById('experimentContainer').classList.add('hidden');
    document.getElementById('noHistoryMessage').classList.add('hidden');
    document.getElementById('paginationContainer').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loadingIndicator').classList.add('hidden');
}

function showNoHistoryMessage() {
    document.getElementById('noHistoryMessage').classList.remove('hidden');
    document.getElementById('experimentContainer').classList.add('hidden');
    document.getElementById('paginationContainer').classList.add('hidden');
}

async function logout() {
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}