document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    loadHistory();

    document.getElementById('refreshBtn').addEventListener('click', loadHistory);
    document.getElementById('logoutBtn').addEventListener('click', logout);
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
        renderHistory(data);

    } catch (error) {
        console.error('Error loading history:', error);
        showNoHistoryMessage();
    } finally {
        hideLoading();
    }
}

function renderHistory(history) {
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
        <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-xl font-semibold text-white">
                    ${item.compilation_result === 'success' ?
        '<i class="fas fa-check-circle text-green-500 mr-2"></i>' :
        '<i class="fas fa-times-circle text-red-500 mr-2"></i>'}
                    ${formatDate(item.action_timestamp)}
                </h3>
                <button class="delete-btn bg-red-600 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-800 transition duration-300" 
                        data-id="${item.user_history_id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="bg-[#111827] rounded-lg p-4">
                <div class="flex space-x-4 mb-4">
                    <div>
                        <p class="text-sm text-[#9CA3AF]">INO File</p>
                        <a href="${item.ino_file_link}" target="_blank" class="text-[#9FEF00] hover:underline">
                            View File <i class="fas fa-external-link-alt ml-1"></i>
                        </a>
                    </div>
                    ${item.hex_file_link !== 'not available' ? `
                    <div>
                        <p class="text-sm text-[#9CA3AF]">HEX File</p>
                        <a href="${item.hex_file_link}" target="_blank" class="text-[#9FEF00] hover:underline">
                            View File <i class="fas fa-external-link-alt ml-1"></i>
                        </a>
                    </div>
                    ` : ''}
                </div>
                <div class="flex items-center text-[#9CA3AF] text-sm">
                    <i class="fas fa-clock mr-2"></i>
                    <span>${formatTime(item.action_timestamp)}</span>
                    <span class="ml-4 ${item.compilation_result === 'success' ? 'text-green-500' : 'text-red-500'}">
                        ${item.compilation_result === 'success' ? 'Success' : 'Failed'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.id;
            if (confirm('Are you sure you want to delete this history item?')) {
                try {
                    const response = await fetch(`/api/history/${id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });

                    if (response.ok) {
                        loadHistory(currentPage);
                    }
                } catch (error) {
                    console.error('Error deleting history:', error);
                }
            }
        });
    });

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
        <button id="prevBtn" class="bg-[#1F2937] text-white px-4 py-2 rounded-lg hover:bg-[#9FEF00] hover:text-[#111827] transition duration-300" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
        <span class="text-white">Page ${currentPage} of ${totalPages}</span>
        <button id="nextBtn" class="bg-[#1F2937] text-white px-4 py-2 rounded-lg hover:bg-[#9FEF00] hover:text-[#111827] transition duration-300" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

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
/*const experiments = Object.values({
    1: [
        { title: "Experiment 1", date: "January 15, 2025", duration: "15min" },
        { title: "Experiment 2", date: "January 20, 2025", duration: "1min" },
        { title: "Experiment 3", date: "February 2, 2025", duration: "3min" },
        { title: "Experiment 4", date: "February 10, 2025", duration: "2min" },
        { title: "Experiment 5", date: "February 18, 2025", duration: "1min" },
    ],
    2: [
        { title: "Experiment 6", date: "March 5, 2025", duration: "2min" },
        { title: "Experiment 7", date: "March 15, 2025", duration: "3min" },
        { title: "Experiment 8", date: "March 22, 2025", duration: "2min" },
        { title: "Experiment 9", date: "April 5, 2025", duration: "1min" },
        { title: "Experiment 10", date: "March 5, 2025", duration: "2 hours" },
    ],
    3: [
        { title: "Experiment 11", date: "April 10, 2025", duration: "5min" },
        { title: "Experiment 12", date: "April 15, 2025", duration: "7min" },
    ],
});

let currentPage = 1;
const totalPages = experiments.length;


function renderExperiments() {
    const container = document.getElementById("experimentContainer");
    container.innerHTML = experiments[currentPage - 1]
        .map(exp => `
            <div class="mb-6">
                <h3 class="text-xl font-semibold text-white mb-4">${exp.title}</h3>
                <h1 class="text-[#9CA3AF] text-sm">Date: ${exp.date}</h1>
                <div class="bg-[#111827] rounded-lg mt-3 p-4">
                    <pre class="text-[#9CA3AF] p-4 rounded-lg overflow-auto text-sm">
int ledPin = 13;
void setup() { pinMode(ledPin, OUTPUT); }
void loop() { digitalWrite(ledPin, HIGH); delay(1000); digitalWrite(ledPin, LOW); delay(1000); }
                    </pre>
                    <div class="flex  items-center   ">
                        <img src="../Documents/clockr.svg" alt="clock" class="w-4 h-4">
                        <span class="text-[#9CA3AF] ml-3 text-sm">Duration: ${exp.duration}</span>
                        <button class="bg-[#9FEF00] text-[#111927] text-xs px-4 py-2 rounded-lg hover:bg-[#76A900] transition duration-300 ml-auto">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        `).join('');


    const paginationContainer = document.getElementById("paginationContainer");
    paginationContainer.innerHTML = `
        <button id="prevBtn" class="bg-[#1F2937] text-white px-6 py-2 rounded-lg hover:bg-[#9FEF00] hover:text-[#111827] transition duration-300" ${currentPage === 1 ? "disabled" : ""}>Previous</button>
        ${Array.from({ length: totalPages }, (_, i) => `
            <button class="pagination-button ${i + 1 === currentPage ? 'bg-[#9FEF00] text-[#111827]' : 'bg-[#1F2937] text-white'} w-10 h-10 rounded-xl font-semibold" data-page="${i + 1}">${i + 1}</button>
        `).join('')}
        <button id="nextBtn" class="bg-[#1F2937] text-white px-6 py-2 rounded-lg hover:bg-[#9FEF00] hover:text-[#111827] transition duration-300" ${currentPage === totalPages ? "disabled" : ""}>Next</button>
    `;


    attachPaginationEventListeners();
}


function attachPaginationEventListeners() {
    document.querySelectorAll(".pagination-button").forEach(button => {
        button.addEventListener("click", () => {
            currentPage = parseInt(button.dataset.page);
            renderExperiments();
        });
    });

    document.getElementById("prevBtn").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderExperiments();
        }
    });

    document.getElementById("nextBtn").addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderExperiments();
        }
    });
}


renderExperiments();

 */
