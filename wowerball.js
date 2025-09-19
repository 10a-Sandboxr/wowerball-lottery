document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('lotteryForm');
    const numberInputs = document.querySelectorAll('.number-input');
    const playerName = document.getElementById('playerName');
    const playerEmail = document.getElementById('playerEmail');
    
    // Auto-focus next input when current is filled
    numberInputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            // Ensure only 1-2 digits
            if (this.value.length > 2) {
                this.value = this.value.slice(0, 2);
            }
            
            // Auto-focus next input
            if (this.value.length === 2 && index < numberInputs.length - 1) {
                numberInputs[index + 1].focus();
            }
        });
        
        // Handle backspace to go to previous input
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                numberInputs[index - 1].focus();
            }
        });
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get all numbers
        const numbers = Array.from(numberInputs).map(input => parseInt(input.value) || 0);
        const name = playerName.value.trim();
        const email = playerEmail.value.trim();
        
        // Validate all fields
        if (!name || !email) {
            alert('Please fill in your name and email!');
            return;
        }
        
        // Check if all numbers are filled and valid
        const invalidNumbers = numbers.filter(num => num < 1 || num > 99 || isNaN(num));
        if (invalidNumbers.length > 0) {
            alert('Please enter all 9 numbers between 1-99!');
            return;
        }
        
        // Check for duplicate numbers
        const uniqueNumbers = [...new Set(numbers)];
        if (uniqueNumbers.length !== numbers.length) {
            alert('Please enter 9 different numbers - no duplicates allowed!');
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '🎲 SUBMITTING YOUR LUCKY NUMBERS... 🎲';
        submitBtn.disabled = true;
        
        // Submit to Formspree
        const formData = {
            name: name,
            email: email,
            luckyNumbers: numbers.join(', '),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        fetch('https://formspree.io/f/mgvlgzyg', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (response.ok) {
                showSuccessMessage(name, numbers);
                form.reset();
            } else {
                throw new Error('Submission failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Something went wrong! Please try again.');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });
    
    function showSuccessMessage(name, numbers) {
        const successHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(45deg, #ffd700, #ffed4e);
                border: 5px solid #ff69b4;
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                z-index: 1000;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                max-width: 500px;
                animation: celebrateAnimation 0.6s ease-out;
            ">
                <h2 style="color: #8b0000; font-size: 2rem; margin-bottom: 20px;">
                    🎉 SUCCESS! 🎉
                </h2>
                <p style="color: #333; font-size: 1.2rem; font-weight: 600; margin-bottom: 15px;">
                    Thank you, ${name}!
                </p>
                <p style="color: #333; font-size: 1.1rem; margin-bottom: 20px;">
                    Your lucky numbers: <br>
                    <strong style="font-size: 1.3rem; color: #8b0000;">${numbers.join(' - ')}</strong>
                </p>
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 20px;">
                    Your entry has been submitted! Good luck! 🍀
                </p>
                <button onclick="this.parentElement.remove()" style="
                    background: #ff69b4;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: bold;
                ">Close</button>
            </div>
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                z-index: 999;
            " onclick="this.remove(); document.querySelector('[style*=z-index]:nth-of-type(1000)').remove()"></div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', successHTML);
    }
    
    // Add random number generator button
    const randomBtn = document.createElement('button');
    randomBtn.type = 'button';
    randomBtn.className = 'random-btn';
    randomBtn.innerHTML = '🎲 QUICK PICK (Random Numbers) 🎲';
    randomBtn.style.cssText = `
        width: 100%;
        padding: 15px;
        font-size: 1.2rem;
        font-weight: 700;
        color: #fff;
        background: linear-gradient(45deg, #32cd32, #00ff00);
        border: none;
        border-radius: 25px;
        cursor: pointer;
        margin-bottom: 20px;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(50,205,50,0.4);
    `;
    
    randomBtn.addEventListener('click', function() {
        const usedNumbers = new Set();
        numberInputs.forEach(input => {
            let randomNum;
            do {
                randomNum = Math.floor(Math.random() * 99) + 1;
            } while (usedNumbers.has(randomNum));
            
            usedNumbers.add(randomNum);
            input.value = randomNum;
            
            // Add animation
            input.style.animation = 'none';
            setTimeout(() => {
                input.style.animation = 'pulse 0.5s ease-in-out';
            }, Math.random() * 500);
        });
    });
    
    // Insert random button before submit button
    form.insertBefore(randomBtn, document.querySelector('.submit-btn'));
});

// Add CSS animation for success message
const style = document.createElement('style');
style.textContent = `
    @keyframes celebrateAnimation {
        0% { transform: translate(-50%, -50%) scale(0.5) rotate(-10deg); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.1) rotate(5deg); }
        100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
    }
`;
document.head.appendChild(style);