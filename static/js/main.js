let nutritionChart = null;
let recommendationCharts = [];

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(uploadForm);
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '<p class="analyzing">Analyzing...</p>';
            showLoadingSpinner();
            
            try {
                const response = await fetch('/predict', {
                    method: 'POST',
                    body: formData
                });
                
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const result = await response.json();
                    if (response.ok) {
                        displayResults(result);
                        createNutritionChart(result.nutritional_info);
                        displayUserProfile();
                        displayRecommendations(result.recommendations);
                        scrollToResults();
                    } else {
                        throw new Error(result.error || 'Unknown error occurred');
                    }
                } else {
                    const text = await response.text();
                    throw new Error(`Invalid response format. Status: ${response.status}, Body: ${text}`);
                }
            } catch (error) {
                console.error('Error:', error);
                resultsDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
            } finally {
                hideLoadingSpinner();
            }
        });
    }
});

function displayResults(result) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h3>Predicted Dish: ${result.predicted_dish}</h3>
        <p class="confidence">Confidence: ${(result.confidence * 100).toFixed(2)}%</p>
        <p><strong>Ingredients:</strong> ${result.nutritional_info.Ingredients || 'Not available'}</p>
        <div class="chart-container">
            <canvas id="nutrition-chart"></canvas>
        </div>
        <h4>Nutritional Information</h4>
        <ul>
            ${Object.entries(result.nutritional_info).map(([key, value]) => {
                if (key === 'Ingredients') return '';
                if (value === null) return `<li><strong>${key}:</strong> N/A</li>`;
                if (typeof value === 'number') {
                    if (key.includes('(g)')) return `<li><strong>${key}:</strong> ${value.toFixed(1)} g</li>`;
                    if (key.includes('(mg)')) return `<li><strong>${key}:</strong> ${value.toFixed(1)} mg</li>`;
                    if (key.includes('(%DV)')) return `<li><strong>${key}:</strong> ${value.toFixed(1)}%</li>`;
                    if (key === 'Calories') return `<li><strong>${key}:</strong> ${value.toFixed(0)} kcal</li>`;
                }
                return `<li><strong>${key}:</strong> ${value}</li>`;
            }).join('')}
        </ul>
    `;
}

function createNutritionChart(nutritionalInfo) {
    const ctx = document.getElementById('nutrition-chart').getContext('2d');
    
    if (nutritionChart) {
        nutritionChart.destroy();
    }

    nutritionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Calories (kcal)', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Fiber (g)'],
            datasets: [{
                label: 'Amount',
                data: [
                    nutritionalInfo['Calories'],
                    nutritionalInfo['Protein (g)'],
                    nutritionalInfo['Carbs (g)'],
                    nutritionalInfo['Total Fat (g)'],
                    nutritionalInfo['Fiber (g)']
                ],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Nutritional Content'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(1);
                                if (context.label.includes('Calories')) {
                                    label += ' kcal';
                                } else {
                                    label += ' g';
                                }
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function calculateBMI(weight, height) {
    return weight / ((height / 100) ** 2);
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
}

function displayUserProfile() {
    const userProfileDiv = document.getElementById('user-profile');
    // This is a mock profile. In a real application, you would fetch this data from the server.
    const userProfile = {
        age: 30,
        gender: 'Female',
        height: 160,
        weight: 70,
        activityLevel: 'Moderately Active',
        healthGoal: 'Lose Weight',
        dietaryRestrictions: ['Lactose Intolerant']
    };

    const bmi = calculateBMI(userProfile.weight, userProfile.height);
    const bmiCategory = getBMICategory(bmi);

    userProfileDiv.innerHTML = `
        <div class="profile-info">
            <h3>Personal Information</h3>
            <p><strong>Age:</strong> ${userProfile.age} years</p>
            <p><strong>Gender:</strong> ${userProfile.gender}</p>
            <p><strong>Height:</strong> ${userProfile.height} cm</p>
            <p><strong>Weight:</strong> ${userProfile.weight} kg</p>
            <p><strong>Activity Level:</strong> ${userProfile.activityLevel}</p>
            <p><strong>Health Goal:</strong> ${userProfile.healthGoal}</p>
            <p><strong>Dietary Restrictions:</strong> ${userProfile.dietaryRestrictions.join(', ')}</p>
        </div>
        <div class="bmi-info">
            <h3>BMI Information</h3>
            <p><strong>BMI:</strong> ${bmi.toFixed(1)}</p>
            <p><strong>Category:</strong> <span class="bmi-category ${bmiCategory.toLowerCase().replace(' ', '-')}">${bmiCategory}</span></p>
        </div>
    `;
}

function displayRecommendations(recommendations) {
    const recommendationsListDiv = document.getElementById('recommendations-list');
    const recommendationReasonsDiv = document.getElementById('recommendation-reasons');

    recommendationReasonsDiv.innerHTML = `
        <h3>Recommendation Criteria</h3>
        <p>Based on your profile and health goals, we recommend dishes that:</p>
        <ul>
            <li>Are rich in protein to support muscle maintenance during weight loss</li>
            <li>Have a good balance of complex carbohydrates for sustained energy</li>
            <li>Include healthy fats for hormone balance and nutrient absorption</li>
            <li>Are high in fiber to promote satiety and digestive health</li>
            <li>Do not contain lactose, aligning with your dietary restrictions</li>
        </ul>
    `;

    recommendationsListDiv.innerHTML = recommendations.map((dish, index) => `
        <div class="recommendation-card">
            <h3>${dish.Name}</h3>
            <p>Calories: ${dish.Calories.toFixed(0)} kcal</p>
            <canvas id="recommendation-chart-${index}" width="200" height="200"></canvas>
        </div>
    `).join('');

    // Create pie charts for each recommendation
    recommendationCharts.forEach(chart => chart.destroy());
    recommendationCharts = [];
    recommendations.forEach((dish, index) => {
        const ctx = document.getElementById(`recommendation-chart-${index}`).getContext('2d');
        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Protein', 'Carbs', 'Fat', 'Fiber'],
                datasets: [{
                    data: [
                        dish['Protein (g)'],
                        dish['Carbs (g)'],
                        dish['Total Fat (g)'],
                        dish['Fiber (g)']
                    ],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += context.parsed.toFixed(1) + 'g';
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
        recommendationCharts.push(chart);
    });
}

function scrollToResults() {
    const resultsSection = document.getElementById('results-section');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function showLoadingSpinner() {
    document.getElementById('loading-spinner').classList.remove('hidden');
}

function hideLoadingSpinner() {
    document.getElementById('loading-spinner').classList.add('hidden');
}
