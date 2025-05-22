
document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndRole();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    loadAllStudentHistory();
});

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

async function checkAuthAndRole() {
    try {
        const response = await fetch('/auth/profile', {
            credentials: 'include'
        });

        if (!response.ok) {
            window.location.href = '/login';
            return;
        }

        const { data } = await response.json();
        console.log('User data:', data);

        const isTeacherHistoryPage = window.location.pathname === '/history/teacher';

        if (data.role === 'teacher') {
            if (!isTeacherHistoryPage) {
                window.location.href = '/history/teacher';
                return;
            }
            loadAllStudentHistory();
        } else {
            window.location.href = '/history';
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = '/login';
    }
}


let currentPage = 1;
let totalPages = 1;

async function loadAllStudentHistory(page = 1) {
    try {
        showLoading();
        currentPage = page;

        const response = await fetch(`/api/history/teacher/all?page=${page}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch history');
        }

        const { data, pagination } = await response.json();
        totalPages = pagination?.totalPages || 1;
        renderTeacherHistory(data);

    } catch (error) {
        console.error('Error loading history:', error);
        showNoHistoryMessage();
    } finally {
        hideLoading();
    }
}

function renderTeacherHistory(history) {
    const container = document.querySelector('tbody');
    const noHistoryMessage = document.getElementById('noHistoryMessage');
    const paginationContainer = document.getElementById('paginationContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');

    loadingIndicator.classList.add('hidden');

    if (!history || history.length === 0) {
        container.innerHTML = '<tr><td colspan="7">No history found</td></tr>';
        noHistoryMessage.classList.remove('hidden');
        paginationContainer.classList.add('hidden');
        return;
    }

    container.innerHTML = history.map(item => `
        <tr>
            <td>${item.user.first_name} ${item.user.last_name}</td>
            <td>${formatDate(item.action_timestamp)}</td>
            <td>${formatTime(item.action_timestamp)}</td>
            <td class="${item.compilation_result === 'success' ? 'completed' : 'failed'}">
                ${item.compilation_result === 'success' ? 'Completed' : 'Failed'}
            </td>
            <td>${item.user.user_id}</td>
            <td>
                <a href="${item.ino_file_link}" target="_blank" class="file-link">
                    <span class="file-link-text">View INO</span>
                    <i class="fas fa-external-link-alt ml-1"></i>
                </a>
            </td>
            <td>
                ${item.hex_file_link !== 'not available' ? `
                <a href="${item.hex_file_link}" target="_blank" class="file-link">
                    <span class="file-link-text">Download HEX File</span>
                    <i class="fas fa-external-link-alt ml-1"></i>
                </a>
                ` : '<span class="text-[#9CA3AF]">N/A</span>'}
            </td>
        </tr>
    `).join('');

    noHistoryMessage.classList.add('hidden');
    container.classList.remove('hidden');

    if (totalPages > 1) {
        renderPagination();
        paginationContainer.classList.remove('hidden');
    } else {
        paginationContainer.classList.add('hidden');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
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
    document.querySelector('tbody').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loadingIndicator').classList.add('hidden');
    document.querySelector('tbody').classList.remove('hidden');
}

function showNoHistoryMessage() {
    document.getElementById('noHistoryMessage').classList.remove('hidden');
    document.querySelector('tbody').classList.add('hidden');
}

function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = `
        <button id="prevBtn" class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button id="nextBtn" class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadAllStudentHistory(currentPage);
        }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadAllStudentHistory(currentPage);
        }
    });
}