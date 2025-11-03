/* public/js/portal.js */
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    fetchUserData(headers);
    fetchProjects(headers);
    fetchLoyaltyData(headers);
});

async function fetchUserData(headers) {
    // ... (fetch user data and set #welcome-message)
}

async function fetchProjects(headers) {
    try {
        const res = await fetch('/api/projects', { headers });
        if (!res.ok) throw new Error('Failed to fetch projects');
        
        const projects = await res.json();
        const container = document.getElementById('projects-container');
        container.innerHTML = ''; // Clear loading state

        if (projects.length === 0) {
            container.innerHTML = '<p>You have no active projects.</p>';
            return;
        }

        projects.forEach(project => {
            const projectEl = document.createElement('div');
            projectEl.className = 'project-card';
            projectEl.innerHTML = `
                <h3>${project.title}</h3>
                <p>Package: ${project.package}</p>
                <p>Status: <span class="project-status">${project.status.replace('_', ' ')}</span></p>
                ${createProgressBar(project.status)}
            `;
            container.appendChild(projectEl);
        });

    } catch (error) {
        console.error('Error fetching projects:', error);
    }
}

async function fetchLoyaltyData(headers) {
    try {
        const res = await fetch('/api/users/loyalty', { headers }); // Assuming this endpoint exists
        if (!res.ok) throw new Error('Failed to fetch loyalty data');

        const data = await res.json();
        
        document.getElementById('loyalty-projects').textContent = data.loyalty.projects_completed || 0;
        document.getElementById('loyalty-referrals').textContent = data.loyalty.referrals_completed || 0;

        const vouchersList = document.getElementById('vouchers-list');
        vouchersList.innerHTML = '';
        if (data.vouchers && data.vouchers.length > 0) {
            data.vouchers.forEach(v => {
                if (!v.is_redeemed) {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${v.code}</strong>: ${v.description}`;
                    vouchersList.appendChild(li);
                }
            });
        } else {
            vouchersList.innerHTML = '<li>No active vouchers.</li>';
        }

    } catch (error) {
        console.error('Error fetching loyalty data:', error);
    }
}

function createProgressBar(currentStatus) {
    const steps = [
        'intake', 'in_progress', 'static_mix', 'final_mix', 
        'mastered', 'review', 'revisions', 'delivered'
    ];
    
    // 'revisions' is a loop, so we'll cap progress at 'review' unless 'delivered'
    let progressSteps = [
        'intake', 'in_progress', 'static_mix', 'final_mix', 
        'mastered', 'review', 'delivered'
    ];
    
    let currentIndex = progressSteps.indexOf(currentStatus);
    if (currentStatus === 'revisions') {
        currentIndex = progressSteps.indexOf('review'); // Show as "in review"
    }

    const percent = currentIndex >= 0 ? (currentIndex / (progressSteps.length - 1)) * 100 : 0;

    let stepsHtml = progressSteps.map((step, index) => {
        const isActive = index <= currentIndex ? 'active' : '';
        const label = step.replace('_', ' ');
        return `<div class="progress-bar-step ${isActive}">${label}</div>`;
    }).join('');

    return `
        <div class="progress-bar-steps">
            ${stepsHtml}
        </div>
        <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${percent}%;"></div>
        </div>
    `;
}
