// Design Process Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const folders = document.querySelectorAll('.folder');
    const projectContent = document.getElementById('project-content');
    
    // Project data
    const projects = {
        'archive-log': {
            title: 'ARCHIVE LOG',
            code: 'CODE_001 //',
            description: 'A systematic approach to documenting daily design processes and creative explorations.',
            content: `
                <div class="project-header">
                    <h2>ARCHIVE LOG</h2>
                    <span class="project-code">CODE_001 //</span>
                </div>
                <div class="project-description">
                    <p>A comprehensive documentation system capturing the evolution of design thinking through daily practice. This project explores the intersection of systematic organization and creative spontaneity.</p>
                </div>
                <div class="project-details">
                    <div class="detail-item">
                        <span class="detail-label">METHODOLOGY:</span>
                        <span class="detail-value">Daily Documentation</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">DURATION:</span>
                        <span class="detail-value">5 Days</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">TOOLS:</span>
                        <span class="detail-value">Grid Systems, Typography</span>
                    </div>
                </div>
            `
        },
        'drift': {
            title: 'DRIFT',
            code: 'CODE_002 //',
            description: 'An exploration of movement and flow in digital interfaces.',
            content: `
                <div class="project-header">
                    <h2>DRIFT</h2>
                    <span class="project-code">CODE_002 //</span>
                </div>
                <div class="project-description">
                    <p>Investigating the concept of digital drift through interactive elements that respond to user behavior. This project examines how interfaces can create a sense of organic movement within structured environments.</p>
                </div>
                <div class="project-details">
                    <div class="detail-item">
                        <span class="detail-label">METHODOLOGY:</span>
                        <span class="detail-value">Interactive Design</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">DURATION:</span>
                        <span class="detail-value">2 Weeks</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">TOOLS:</span>
                        <span class="detail-value">JavaScript, CSS Animations</span>
                    </div>
                </div>
            `
        },
        'falling': {
            title: 'FALLING',
            code: 'CODE_003 //',
            description: 'A study of gravity and spatial relationships in design.',
            content: `
                <div class="project-header">
                    <h2>FALLING</h2>
                    <span class="project-code">CODE_003 //</span>
                </div>
                <div class="project-description">
                    <p>Exploring the visual metaphor of falling through experimental typography and layout design. This project challenges traditional hierarchical structures by embracing downward movement as a design principle.</p>
                </div>
                <div class="project-details">
                    <div class="detail-item">
                        <span class="detail-label">METHODOLOGY:</span>
                        <span class="detail-value">Experimental Typography</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">DURATION:</span>
                        <span class="detail-value">1 Week</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">TOOLS:</span>
                        <span class="detail-value">Typography, Layout Design</span>
                    </div>
                </div>
            `
        },
        'signal': {
            title: 'SIGNAL',
            code: 'CODE_004 //',
            description: 'Communication design focusing on clarity and transmission.',
            content: `
                <div class="project-header">
                    <h2>SIGNAL</h2>
                    <span class="project-code">CODE_004 //</span>
                </div>
                <div class="project-description">
                    <p>A communication design project that examines how visual signals can be optimized for maximum clarity and impact. This work explores the balance between aesthetic appeal and functional communication.</p>
                </div>
                <div class="project-details">
                    <div class="detail-item">
                        <span class="detail-label">METHODOLOGY:</span>
                        <span class="detail-value">Communication Design</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">DURATION:</span>
                        <span class="detail-value">3 Weeks</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">TOOLS:</span>
                        <span class="detail-value">Visual Communication, Branding</span>
                    </div>
                </div>
            `
        },
        'after-work': {
            title: 'AFTER WORK',
            code: 'CODE_005 //',
            description: 'Personal creative explorations beyond professional boundaries.',
            content: `
                <div class="project-header">
                    <h2>AFTER WORK</h2>
                    <span class="project-code">CODE_005 //</span>
                </div>
                <div class="project-description">
                    <p>A collection of personal creative experiments conducted outside of professional constraints. This project represents the intersection of personal expression and design methodology, exploring themes of rest, reflection, and creative freedom.</p>
                </div>
                <div class="project-details">
                    <div class="detail-item">
                        <span class="detail-label">METHODOLOGY:</span>
                        <span class="detail-value">Personal Exploration</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">DURATION:</span>
                        <span class="detail-value">Ongoing</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">TOOLS:</span>
                        <span class="detail-value">Mixed Media, Digital Art</span>
                    </div>
                </div>
            `
        }
    };
    
    // Add click event listeners to folders
    folders.forEach(folder => {
        folder.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project');
            const project = projects[projectId];
            
            if (project) {
                // Add active class to clicked folder
                folders.forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                
                // Update project content
                projectContent.innerHTML = project.content;
                
                // Add fade-in animation
                projectContent.style.opacity = '0';
                projectContent.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    projectContent.style.transition = 'all 0.3s ease';
                    projectContent.style.opacity = '1';
                    projectContent.style.transform = 'translateY(0)';
                }, 50);
            }
        });
        
        // Add hover effects
        folder.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) rotate(2deg)';
            this.style.zIndex = '20';
        });
        
        folder.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = '';
                this.style.zIndex = '';
            }
        });
    });
    
    // Initialize with first project
    if (folders.length > 0) {
        folders[0].click();
    }
});
