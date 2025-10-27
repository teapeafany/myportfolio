// Headspace Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const scatteredItems = document.querySelectorAll('.scattered-item');
    const flipPageBtn = document.getElementById('flip-page');
    const addEntryBtn = document.getElementById('add-entry');
    const journalPages = document.querySelectorAll('.journal-page');
    
    let currentPage = 0;
    
    // Scattered items interaction
    scatteredItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(1.2) rotate(10deg)';
            this.style.zIndex = '20';
            
            // Show placeholder content
            showPlaceholderContent(this);
            
            // Reset after animation
            setTimeout(() => {
                this.style.transform = '';
                this.style.zIndex = '';
            }, 300);
        });
        
        // Add random floating animation
        setInterval(() => {
            if (!item.style.transform.includes('scale')) {
                const randomFloat = Math.random() * 4 - 2; // -2 to 2 degrees
                item.style.transform = `rotate(${randomFloat}deg)`;
            }
        }, 3000 + index * 500);
    });
    
    // Flip page functionality
    flipPageBtn.addEventListener('click', function() {
        journalPages.forEach(page => {
            page.style.transform = 'rotateY(180deg)';
            page.style.opacity = '0';
        });
        
        setTimeout(() => {
            // Add new content or reset
            addNewJournalContent();
            
            journalPages.forEach(page => {
                page.style.transform = 'rotateY(0deg)';
                page.style.opacity = '1';
            });
        }, 500);
    });
    
    // Add entry functionality
    addEntryBtn.addEventListener('click', function() {
        const randomPage = Math.random() > 0.5 ? journalPages[0] : journalPages[1];
        addNewEntry(randomPage);
    });
    
    // Show placeholder content for scattered items
    function showPlaceholderContent(item) {
        const label = item.querySelector('.item-label').textContent;
        
        // Create temporary overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            cursor: pointer;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 10px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        `;
        
        content.innerHTML = `
            <h3 style="color: #2c2c2c; margin-bottom: 1rem; font-family: 'Instrument Sans', sans-serif;">${label}</h3>
            <div style="width: 200px; height: 150px; background: #f0f0f0; border: 2px dashed #ccc; margin: 1rem auto; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                <span style="color: #999; font-size: 0.9rem;">Placeholder Image</span>
            </div>
            <p style="color: #666; font-size: 0.9rem; margin-top: 1rem;">This would contain your ${label.toLowerCase()} content.</p>
        `;
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        // Close on click
        overlay.addEventListener('click', function() {
            document.body.removeChild(overlay);
        });
    }
    
    // Add new journal content
    function addNewJournalContent() {
        const entries = [
            {
                title: "NEW DISCOVERY",
                content: "Found inspiration in unexpected places today...",
                sketch: "sketch-1"
            },
            {
                title: "CREATIVE BREAKTHROUGH",
                content: "The pieces finally came together...",
                sketch: "sketch-2"
            },
            {
                title: "QUIET MOMENT",
                content: "Sometimes the best ideas come in silence...",
                sketch: "sketch-3"
            }
        ];
        
        const randomEntry = entries[Math.floor(Math.random() * entries.length)];
        
        // Update random page with new content
        const randomPage = Math.random() > 0.5 ? journalPages[0] : journalPages[1];
        const existingEntries = randomPage.querySelectorAll('.journal-entry');
        
        if (existingEntries.length > 0) {
            const randomEntryElement = existingEntries[Math.floor(Math.random() * existingEntries.length)];
            randomEntryElement.querySelector('.entry-title').textContent = randomEntry.title;
            randomEntryElement.querySelector('.handwritten-text').textContent = randomEntry.content;
        }
    }
    
    // Add new entry to journal
    function addNewEntry(page) {
        const newEntry = document.createElement('div');
        newEntry.className = 'journal-entry';
        
        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        newEntry.innerHTML = `
            <h3 class="entry-title">NEW ENTRY - ${timestamp}</h3>
            <div class="entry-content">
                <p class="handwritten-text">A fresh thought captured in this moment...</p>
                <div class="sketch-container">
                    <div class="simple-sketch"></div>
                </div>
            </div>
        `;
        
        // Add with animation
        newEntry.style.opacity = '0';
        newEntry.style.transform = 'translateY(20px)';
        page.appendChild(newEntry);
        
        setTimeout(() => {
            newEntry.style.transition = 'all 0.3s ease';
            newEntry.style.opacity = '1';
            newEntry.style.transform = 'translateY(0)';
        }, 100);
        
        // Remove oldest entry if too many
        const entries = page.querySelectorAll('.journal-entry');
        if (entries.length > 3) {
            entries[0].style.transition = 'all 0.3s ease';
            entries[0].style.opacity = '0';
            entries[0].style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                if (entries[0].parentNode) {
                    entries[0].parentNode.removeChild(entries[0]);
                }
            }, 300);
        }
    }
    
    // Add subtle page breathing animation
    setInterval(() => {
        const journalSpread = document.querySelector('.journal-spread');
        journalSpread.style.transform = 'scale(1.001)';
        
        setTimeout(() => {
            journalSpread.style.transform = 'scale(1)';
        }, 2000);
    }, 5000);
});
