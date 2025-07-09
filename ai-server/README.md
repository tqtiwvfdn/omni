# Omni AI Server

Backend service for the Omni AI development platform, providing REST APIs for application management and statistics.

## 🚀 Features

- **Application Management**: CRUD operations for AI assistant applications
- **Statistics API**: Real-time statistics and metrics
- **JSON File Storage**: Simple and reliable data persistence
- **Input Validation**: Comprehensive request validation using Joi
- **Error Handling**: Robust error handling and logging
- **CORS Support**: Cross-origin resource sharing enabled

## 📁 Project Structure

```
ai-server/
├── server.js              # Main application server
├── package.json           # Dependencies and scripts
├── data/                  # JSON data storage
│   ├── applications.json  # Application data
│   ├── users.json        # User data
│   └── stats.json        # Statistics data
└── README.md             # This file
```

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The server will start on port 3000 by default.

## 📡 API Documentation

### Base URL
```
http://localhost:3000
```

### Health Check
```
GET /health
```

### Applications API

#### Get All Applications
```
GET /api/applications
```

Query Parameters:
- `status`: Filter by status (development, testing, production, planned)
- `category`: Filter by category
- `search`: Search in name, description, or appId

#### Get Single Application
```
GET /api/applications/:id
```

#### Create New Application
```
POST /api/applications
```

Request Body:
```json
{
  "name": "应用名称",
  "description": "应用描述",
  "category": "核心服务",
  "template": "qa-assistant",
  "gitRepo": "https://git.company.com/ai-apps/app-name.git",
  "developer": "开发团队",
  "features": ["功能1", "功能2"]
}
```

#### Update Application
```
PUT /api/applications/:id
```

Request Body:
```json
{
  "name": "更新的应用名称",
  "description": "更新的描述",
  "status": "production",
  "version": "v1.0.0"
}
```

#### Delete Application
```
DELETE /api/applications/:id
```

### Statistics API

#### Get Statistics
```
GET /api/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "totalApps": 12,
    "productionApps": 3,
    "developmentApps": 5,
    "testingApps": 2,
    "plannedApps": 2,
    "lastUpdated": "2025-07-09 14:30:00"
  }
}
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

### Application Categories
- 核心服务
- 内容生成
- 数据处理
- 用户体验
- 风控合规
- 流程自动化
- 营销推广
- 数据分析
- 系统服务
- 开发工具
- 质量保证
- 资源管理

### Application Status
- `development`: 开发中
- `testing`: 测试中
- `production`: 生产中
- `planned`: 规划中

## 📊 Data Models

### Application Model
```json
{
  "id": 1,
  "appId": "qa-assistant-001",
  "name": "智能问答助手",
  "description": "AI行员助手核心，提供智能问答和知识检索服务",
  "status": "development",
  "version": "v2.1.3",
  "icon": "🤖",
  "category": "核心服务",
  "lastUpdated": "2025-06-15",
  "developer": "产品团队",
  "features": ["自然语言处理", "知识库检索", "多轮对话", "意图识别"],
  "workspace": "/development/app-workspace/qa-assistant",
  "gitRepo": "https://git.company.com/ai-apps/qa-assistant.git",
  "createdAt": "2025-06-10",
  "updatedAt": "2025-06-15"
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Test specific API endpoint
curl http://localhost:3000/api/applications
```

## 🔒 Security

- Input validation using Joi schema validation
- CORS configuration for cross-origin requests
- Error handling to prevent information leakage
- JSON file storage with proper file permissions

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Using PM2 (recommended for production)
```bash
npm install -g pm2
pm2 start server.js --name "omni-ai-server"
pm2 save
pm2 startup
```

## 📝 Logging

The server includes comprehensive logging:
- Server startup and shutdown
- API request/response logging
- Error logging with stack traces
- Data operation logging

## 🔄 Integration with Frontend

The frontend application can integrate with this backend using standard HTTP requests:

```javascript
// Example: Fetch all applications
fetch('http://localhost:3000/api/applications')
  .then(response => response.json())
  .then(data => console.log(data));

// Example: Create new application
fetch('http://localhost:3000/api/applications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: '新应用',
    description: '应用描述',
    category: '核心服务',
    template: 'blank'
  })
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For questions or issues:
- Check the API documentation above
- Review the error logs in the console
- Contact the development team

---

**Note**: This backend service is designed to work with the Omni AI development platform frontend. Make sure both services are running for full functionality.