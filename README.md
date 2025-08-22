# WealthWise 💰
**Plan Smart, Retire Confident.**

A comprehensive pension optimization platform that combines AI-powered financial advice, document analysis, and predictive modeling to help users make informed retirement planning decisions.

## 🌟 Features

### 🤖 AI-Powered Chatbot
- **Intelligent Conversations**: Context-aware chatbot with conversation history
- **Document Analysis**: Upload PDFs for information extraction or Q&A
- **RAG (Retrieval-Augmented Generation)**: Semantic search through uploaded documents using Pinecone
- **Multi-Intent Processing**: Handles questions, document extraction, and general queries

### 📊 Financial Analytics
- **Portfolio Analysis**: Track and analyze investment portfolios
- **Risk Assessment**: Evaluate risk tolerance and investment preferences
- **Retirement Planning**: Calculate retirement needs and projections
- **Stock Market Integration**: Real-time financial data integration

### 🔮 Predictive Modeling
- **Life Expectancy Prediction**: ML models for health-based life expectancy estimation
- **Retirement Optimization**: Predictive algorithms for optimal retirement strategies
- **Risk Profiling**: Advanced risk assessment using machine learning

### 📱 Modern Web Interface
- **Responsive Design**: Built with React and Tailwind CSS
- **Interactive Charts**: Data visualization with Chart.js
- **Real-time Updates**: Live data synchronization
- **User-friendly UX**: Intuitive interface for all user types

## 🏗️ Architecture

```
WealthWise/
├── frontend/          # React.js web application
├── backend/           # Django REST API
├── predictions/       # FastAPI ML service
└── README.md
```

### Backend (Django)
- **Users App**: User management, authentication, profile data
- **Chatbot App**: AI conversation engine with RAG capabilities
- **Financial Data App**: Market data and portfolio management
- **RESTful APIs**: Comprehensive API endpoints

### Frontend (React)
- **Modern Stack**: React 19, Redux Toolkit, React Router
- **Styling**: Tailwind CSS with responsive design
- **Charts**: Interactive visualizations with Chart.js
- **State Management**: Redux for global state

### ML Service (FastAPI)
- **Prediction Models**: XGBoost, Scikit-learn models
- **Health Analytics**: Life expectancy and risk assessment
- **Fast API**: High-performance ML inference endpoints

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd WealthWise
```

### 2. Backend Setup (Django)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements_rag.txt

# Environment setup
cp .env.example .env
# Edit .env with your API keys (see Configuration section)

# Database setup
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

# Run server
python manage.py runserver
```

### 3. Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. ML Service Setup (FastAPI)

```bash
cd predictions

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
python app.py
```

## ⚙️ Configuration

### Environment Variables

Create `.env` file in the `backend/` directory:

```env
# Django Settings
SECRET_KEY=your_django_secret_key
DEBUG=True

# Google AI Configuration
GOOGLE_API_KEY=your_google_api_key_here

# Pinecone Configuration (for RAG)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=pension-chatbot

# Database (SQLite by default)
# For production, configure PostgreSQL/MySQL

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### API Keys Required

1. **Google AI API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create new API key
   - Add to `GOOGLE_API_KEY` in `.env`

2. **Pinecone API Key** (for RAG functionality)
   - Sign up at [Pinecone](https://www.pinecone.io/)
   - Create new project and get API key
   - Add to `PINECONE_API_KEY` in `.env`

## 🔧 Usage

### Chatbot Features

#### 1. Document Information Extraction
```
User: "Extract my personal information from this PDF"
System: Processes PDF and returns structured JSON with:
- Personal details (name, age, location)
- Financial information (salary, investments)
- Health data (BMI, medical conditions)
- Retirement plans
```

#### 2. Document Q&A (RAG)
```
User: "What does my pension document say about early retirement?"
System: 
1. Processes PDF into chunks
2. Stores embeddings in Pinecone
3. Retrieves relevant sections
4. Provides contextual answers
```

#### 3. Financial Advice
```
User: "Should I increase my pension contribution?"
System: Analyzes user profile and provides personalized advice
```

### API Endpoints

#### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout

#### User Management
- `GET /api/users/profile/` - Get user profile
- `PUT /api/users/profile/` - Update user profile
- `POST /api/users/income-status/` - Add income information
- `POST /api/users/retirement-info/` - Add retirement plans

#### Chatbot
- `POST /api/chatbot/chat/` - Send message to chatbot
- `GET /api/chatbot/history/` - Get conversation history
- `DELETE /api/chatbot/history/` - Clear conversation history

#### Financial Data
- `GET /api/financial/stocks/` - Get stock data
- `POST /api/financial/portfolio/` - Add portfolio data

#### ML Predictions
- `POST /predictions/life-expectancy/` - Predict life expectancy
- `POST /predictions/risk-profile/` - Calculate risk profile

## 🧠 AI & ML Features

### Conversation Intelligence
- **Intent Classification**: Automatically categorizes user requests
- **Context Awareness**: Maintains conversation history
- **Multi-turn Conversations**: Handles complex, ongoing discussions

### Document Processing
- **PDF Text Extraction**: Extracts text from uploaded documents
- **Information Extraction**: Uses LLM to extract structured data
- **Semantic Search**: Vector-based document search with Pinecone

### Predictive Analytics
- **Health-based Life Expectancy**: ML model considering lifestyle factors
- **Risk Assessment**: Portfolio risk analysis
- **Retirement Projections**: Financial planning algorithms

## 📊 Data Models

### User Data Structure
```json
{
  "personal": {
    "name": "string",
    "age": "number",
    "dateOfBirth": "date",
    "gender": "string",
    "location": "string",
    "maritalStatus": "string",
    "numberOfDependants": "number"
  },
  "financial": {
    "currentSalary": "number",
    "yearsOfService": "number",
    "employerType": "string",
    "pensionScheme": "string",
    "pensionBalance": "number",
    "portfolioValue": "number"
  },
  "health": {
    "height": "number",
    "weight": "number",
    "bmi": "number",
    "physicalActivity": "string",
    "smokingStatus": "string",
    "medicalConditions": "object"
  }
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **User Isolation**: Each user's data and documents are isolated
- **API Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive data validation
- **CORS Configuration**: Secure cross-origin requests

## 🚀 Deployment

### Production Setup

1. **Backend (Django)**
   ```bash
   # Set production environment variables
   DEBUG=False
   ALLOWED_HOSTS=your-domain.com
   
   # Use production database (PostgreSQL recommended)
   # Configure static files serving
   python manage.py collectstatic
   
   # Use production WSGI server (Gunicorn)
   pip install gunicorn
   gunicorn wealthwise.wsgi:application
   ```

2. **Frontend (React)**
   ```bash
   # Build for production
   npm run build
   
   # Serve with nginx or deploy to Vercel/Netlify
   ```

3. **ML Service (FastAPI)**
   ```bash
   # Use production ASGI server (Uvicorn)
   pip install uvicorn
   uvicorn app:app --host 0.0.0.0 --port 8001
   ```

### Docker Deployment (Optional)
```dockerfile
# Example Dockerfile for backend
FROM python:3.10
WORKDIR /app
COPY requirements*.txt ./
RUN pip install -r requirements.txt -r requirements_rag.txt
COPY . .
CMD ["gunicorn", "wealthwise.wsgi:application"]
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### API Testing
Use tools like Postman or curl to test API endpoints:
```bash
# Test chatbot endpoint
curl -X POST http://localhost:8000/api/chatbot/chat/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Hello", "file": null}'
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Write comprehensive tests
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Pinecone Connection Error**
   ```
   Solution: Check PINECONE_API_KEY and PINECONE_ENVIRONMENT in .env
   ```

2. **Google AI API Error**
   ```
   Solution: Verify GOOGLE_API_KEY and check API quotas
   ```

3. **CORS Issues**
   ```
   Solution: Update CORS_ALLOWED_ORIGINS in Django settings
   ```

4. **Database Migration Errors**
   ```bash
   python manage.py makemigrations --empty appname
   python manage.py migrate --fake-initial
   ```

### Performance Optimization

- **Database**: Use connection pooling for production
- **Caching**: Implement Redis for session and query caching
- **CDN**: Use CDN for static assets
- **Monitoring**: Set up application monitoring (Sentry, New Relic)

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review troubleshooting section

---

**Built with ❤️ for better financial planning and retirement security.**
