class CountdownTimer {
    constructor() {
        // Migration window dates (Sep 23, 2025 12:00 PM ET to Sep 30, 2025 12:00 PM ET)
        this.openDate = new Date('2025-09-23T16:00:00.000Z'); // 12:00 PM ET in UTC
        this.closeDate = new Date('2025-09-30T16:00:00.000Z'); // 12:00 PM ET in UTC
        
        this.elements = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds'),
            statePill: document.getElementById('state-pill'),
            stateText: document.getElementById('state-text'),
            eventDescription: document.getElementById('event-description'),
            progressSection: document.getElementById('progress-section'),
            progressFill: document.getElementById('progress-fill'),
            progressLabel: document.getElementById('progress-label'),
            ctaSection: document.getElementById('cta-section'),
            localTimeDisplay: document.getElementById('local-time-display')
        };
        
        this.previousValues = { days: null, hours: null, minutes: null, seconds: null };
        this.currentState = 'PRE_OPEN';
        
        this.init();
    }
    
    init() {
        this.updateLocalTimezone();
        this.updateCountdown();
        this.startTimer();
    }
    
    updateLocalTimezone() {
        this.updateCurrentTime();
        // Update time every second
        setInterval(() => {
            this.updateCurrentTime();
        }, 1000);
    }
    
    updateCurrentTime() {
        const now = new Date();
        
        // Calculate EST/EDT manually to avoid timezone detection issues
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const estOffset = -5; // EST is UTC-5
        const edtOffset = -4; // EDT is UTC-4
        
        // Simple DST calculation (second Sunday in March to first Sunday in November)
        const year = now.getFullYear();
        const dstStart = new Date(year, 2, 1); // March 1st
        dstStart.setDate(dstStart.getDate() + (7 - dstStart.getDay()) + 7); // Second Sunday
        const dstEnd = new Date(year, 10, 1); // November 1st
        dstEnd.setDate(dstEnd.getDate() + (7 - dstEnd.getDay())); // First Sunday
        
        const isDST = now >= dstStart && now < dstEnd;
        const offset = isDST ? edtOffset : estOffset;
        const estTime = new Date(utc + (offset * 3600000));
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const dayName = days[estTime.getDay()];
        const monthName = months[estTime.getMonth()];
        const date = estTime.getDate();
        const yearNum = estTime.getFullYear();
        
        let hours = estTime.getHours();
        const minutes = estTime.getMinutes().toString().padStart(2, '0');
        const seconds = estTime.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        
        const timezone = isDST ? 'EDT' : 'EST';
        const formattedTime = `${dayName}, ${monthName} ${date}, ${yearNum}, ${hours}:${minutes}:${seconds} ${ampm} ${timezone}`;
        
        this.elements.localTimeDisplay.textContent = formattedTime;
    }
    
    getCurrentState() {
        const now = new Date();
        
        if (now < this.openDate) {
            return 'PRE_OPEN';
        } else if (now >= this.openDate && now <= this.closeDate) {
            return 'OPEN';
        } else {
            return 'CLOSED';
        }
    }
    
    updateCountdown() {
        const now = new Date();
        const state = this.getCurrentState();
        
        // Update state if changed
        if (this.currentState !== state) {
            this.currentState = state;
            this.updateStateDisplay();
        }
        
        let targetDate;
        let timeRemaining;
        
        switch (state) {
            case 'PRE_OPEN':
                targetDate = this.openDate;
                timeRemaining = targetDate - now;
                this.elements.eventDescription.textContent = 'Opens Sep 23, 2025 • 12:00 PM ET';
                break;
                
            case 'OPEN':
                targetDate = this.closeDate;
                timeRemaining = targetDate - now;
                this.elements.eventDescription.textContent = 'Closes Sep 30, 2025 • 12:00 PM ET';
                this.updateProgress();
                break;
                
            case 'CLOSED':
                timeRemaining = 0;
                this.elements.eventDescription.textContent = 'Migration window has closed';
                break;
        }
        
        if (timeRemaining > 0) {
            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
            
            this.updateTimeDisplay('days', days);
            this.updateTimeDisplay('hours', hours);
            this.updateTimeDisplay('minutes', minutes);
            this.updateTimeDisplay('seconds', seconds);
        } else {
            this.updateTimeDisplay('days', 0);
            this.updateTimeDisplay('hours', 0);
            this.updateTimeDisplay('minutes', 0);
            this.updateTimeDisplay('seconds', 0);
        }
    }
    
    updateTimeDisplay(unit, value) {
        const formattedValue = value.toString().padStart(2, '0');
        const element = this.elements[unit];
        
        if (this.previousValues[unit] !== formattedValue) {
            // Add flip animation
            element.style.animation = 'numberFlip 0.6s ease-in-out';
            
            setTimeout(() => {
                element.textContent = formattedValue;
            }, 300);
            
            setTimeout(() => {
                element.style.animation = '';
            }, 600);
            
            this.previousValues[unit] = formattedValue;
        }
    }
    
    updateStateDisplay() {
        const pill = this.elements.statePill;
        const text = this.elements.stateText;
        const progressSection = this.elements.progressSection;
        const ctaSection = this.elements.ctaSection;
        
        // Remove all state classes
        pill.classList.remove('open', 'closed');
        
        switch (this.currentState) {
            case 'PRE_OPEN':
                text.textContent = 'OPENS IN';
                progressSection.style.display = 'none';
                ctaSection.style.display = 'none';
                break;
                
            case 'OPEN':
                pill.classList.add('open');
                text.textContent = 'OPEN NOW';
                progressSection.style.display = 'block';
                ctaSection.style.display = 'block';
                break;
                
            case 'CLOSED':
                pill.classList.add('closed');
                text.textContent = 'CLOSED';
                progressSection.style.display = 'none';
                ctaSection.style.display = 'none';
                break;
        }
    }
    
    updateProgress() {
        const now = new Date();
        const totalDuration = this.closeDate - this.openDate;
        const elapsed = now - this.openDate;
        const percentage = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
        
        this.elements.progressFill.style.width = `${percentage}%`;
        this.elements.progressLabel.textContent = `${Math.round(percentage)}% of window elapsed`;
    }
    
    startTimer() {
        // Update immediately
        this.updateCountdown();
        
        // Then update every second
        setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }
}

// Initialize the countdown timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CountdownTimer();
    
    // Add click handler for CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            // Add your migration logic here
            console.log('Migration button clicked');
            // For demo purposes, you could redirect to a migration page
            // window.location.href = '/migrate';
        });
    }
});

// Add some extra visual effects
document.addEventListener('DOMContentLoaded', () => {
    // Add subtle mouse movement parallax effect
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        const orbs = document.querySelectorAll('.glow-orb');
        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;
            
            orb.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
    
    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe countdown cards for staggered animation
    const cards = document.querySelectorAll('.countdown-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
});