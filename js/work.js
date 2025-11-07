// Work Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const projectItems = document.querySelectorAll('.project-item');
    
    // Add hover effects and interactions
    projectItems.forEach(item => {
        const sidePanel = item.querySelector('.side-panel');
        
        // Add hover effects for projects with side panels
        if (sidePanel) {
            item.addEventListener('mouseenter', function() {
                this.classList.add('hovered');
            });
            
            item.addEventListener('mouseleave', function() {
                this.classList.remove('hovered');
            });
        }
        
        // Add click functionality for projects without side panels (like ECHOSPHERE)
        if (!sidePanel) {
            item.addEventListener('click', function() {
                const projectName = this.getAttribute('data-project');
                showProjectModal(projectName);
            });
        }
    });
    
    // Show project modal for projects without side panels
    function showProjectModal(projectName) {
        const projectData = {
            echosphere: {
                title: 'ECHOSPHERE',
                status: 'IN PROGRESS',
                subtitle: '[one day I will understand]',
                description: 'This project is currently in development. More details will be available soon.'
            }
        };
        
        const project = projectData[projectName];
        if (!project) return;
        
        // Create modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(10px);
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: rgba(20, 20, 20, 0.95);
            padding: 2rem;
            border-radius: 15px;
            border: 1px solid rgba(254, 195, 7, 0.3);
            max-width: 500px;
            text-align: center;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        `;
        
        content.innerHTML = `
            <h2 style="color: #FEC307; font-family: 'Arial'; font-size: 1.5rem; margin-bottom: 1rem;">${project.title}</h2>
            <div style="color: #FEC307; font-family: 'Arial'; font-size: 1rem; font-weight: 600; margin-bottom: 1rem;">${project.status}</div>
            <div style="color: #ccc; font-family: 'Arial'; font-size: 0.9rem; font-style: italic; margin-bottom: 1.5rem;">${project.subtitle}</div>
            <p style="color: #f0f0f0; font-family: 'Arial'; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem;">${project.description}</p>
            <button onclick="this.closest('.modal').remove()" style="background: #FEC307; color: #0a0a0a; border: none; padding: 0.8rem 1.5rem; border-radius: 5px; font-family: 'Arial'; font-weight: 600; cursor: pointer;">Close</button>
        `;
        
        modal.appendChild(content);
        modal.className = 'modal';
        document.body.appendChild(modal);
        
        // Close on click outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // Add staggered animation on page load
    projectItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 200);
    });
});