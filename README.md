# NutriSmart-WebApp

NutriSmart-WebApp is an innovative web application designed to provide personalized nutrition guidance and support non-communicable disease (NCD) prevention efforts in Rwanda. The app leverages artificial intelligence to recognize local Rwandan dishes and integrates with both Google authentication and traditional email/password sign-up methods.

## Features

- **AI-powered food recognition**: Advanced convolutional neural networks identify local Rwandan dishes from user-uploaded images.
- **Personalized nutritional analysis**: Detailed nutritional breakdowns of recognized meals tailored to individual user profiles.
- **Culturally relevant meal recommendations**: Suggestions for healthier alternatives and balanced meal plans based on traditional Rwandan cuisine.
- **Google Authentication**: Sign in using Google account for a seamless experience.
- **Email/Password Authentication**: Sign up and log in using traditional email and password credentials.
- **Integration with local health systems**: Designed to work in conjunction with Rwanda's existing healthcare infrastructure to support coordinated NCD prevention efforts.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/NutriSmart-WebApp.git
Navigate to the project directory:


cd NutriSmart-WebApp
Create a virtual environment (optional but recommended):


python3 -m venv venv
source venv/bin/activate
Install the required dependencies:


pip install -r requirements.txt
Set up environment variables:

Create a .env file in the root directory of the project.
Add the following environment variables:

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url

Run the Flask application:


python app.py
The application should now be accessible at http://localhost:5000.

Usage

Navigate to the home page (/) in your web browser.
Sign in using Google authentication or create a new account with email and password.
Upload an image of a Rwandan dish using the provided file input.
The application will analyze the image, provide a prediction of the dish, and display its nutritional information.
Based on the user's profile and the nutritional data, the application will also suggest personalized meal recommendations.
Dependencies
Flask
Flask-Login
Flask-Session
Flask-MongoEngine
Flask-Dotenv
Flask-Cors
Google OAuth 2.0
Cloudinary
Bcrypt
Multer
Contributing
Contributions to the NutriSmart-WebApp project are welcome. If you find any issues or have suggestions for improvements, please feel free to open a new issue or submit a pull request.

License
This project is licensed under the MIT License.