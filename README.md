## Redis Cluster Architecture

The application utilizes a production-ready Redis Cluster with:

- **6 Redis Nodes**: 3 master nodes and 3 replica nodes
- **Automatic Data Sharding**: Data is automatically distributed across nodes
- **High Availability**: Failover capability with replica nodes
- **Dedicated Network**: All Redis nodes are on an isolated network
- **Data Persistence**: Each node has its own persistent volume

The Redis Cluster is initialized using Bitnami's clustering capabilities, creating a robust and scalable in-memory data store. For more details, see [REDIS_CLUSTER.md](./docs/REDIS_CLUSTER.md).# Data Flow Application

A full-stack demo application that demonstrates the connectivity between frontend, backend, PostgreSQL, and a multi-node Bitnami Redis Cluster, with the ability to store and view data in both storage systems.

![Application Architecture](https://via.placeholder.com/800x400?text=Data+Flow+Application)

## Features

- **Visual Architecture Representation**: Interactive diagram showing how components connect
- **Dual Storage Options**: Store data in either PostgreSQL (persistent) or Redis Cluster (in-memory)
- **Separate Data Views**: View data from PostgreSQL and Redis Cluster separately
- **Status Monitoring**: Real-time monitoring of database connection status
- **Docker Containerization**: Easy deployment with Docker Compose
- **Graceful Error Handling**: Robust error handling for database connectivity issues
- **Multi-Node Redis Cluster**: Production-ready 6-node Redis Cluster with replication

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express
- **Databases**: PostgreSQL, Bitnami Redis Cluster
- **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Installation and Running

1. Clone the repository
```bash
git clone https://github.com/yourusername/data-flow-app.git
cd data-flow-app
```

2. Run the application using Docker Compose
```bash
docker-compose up
```

3. Access the application at [http://localhost:3000](http://localhost:3000)

## Application Structure

```
data-flow-app/
├── docker-compose.yml        # Docker Compose configuration
├── .env                      # Environment variables
├── README.md                 # Project documentation
├── frontend/                 # React frontend
│   ├── Dockerfile            # Frontend container configuration
│   ├── package.json          # Frontend dependencies
│   ├── public/               # Static assets
│   └── src/                  # React source code
│       ├── App.js            # Main application component
│       ├── index.js          # Entry point
│       ├── components/       # React components
│       └── services/         # API services
├── backend/                  # Node.js/Express backend
│   ├── Dockerfile            # Backend container configuration
│   ├── package.json          # Backend dependencies
│   ├── server.js             # Express server
│   ├── startup.sh            # Server startup script
│   ├── routes/               # API routes
│   ├── controllers/          # Request handlers
│   ├── models/               # Data models
│   └── config/               # Database configurations
└── db/                       # Database initialization
    └── init.sql              # PostgreSQL initialization script
```

## API Endpoints

### PostgreSQL Operations
- `POST /api/data/postgres` - Store key-value pair in PostgreSQL
- `GET /api/data/postgres` - Retrieve all data from PostgreSQL

### Redis Operations
- `POST /api/data/redis` - Store key-value pair in Redis Cluster
- `GET /api/data/redis` - Retrieve all data from Redis Cluster

### Service Status
- `GET /health` - Check health status of all services

## Application Pages

- **Home**: Architecture diagram and data input form
- **PostgreSQL Data**: View and refresh data stored in PostgreSQL
- **Redis Cluster Data**: View and refresh data stored in Redis Cluster

## Error Handling

The application includes robust error handling for various scenarios:

- Automatic reconnection to databases
- Graceful degradation when services are unavailable
- User-friendly error messages
- Status monitoring with visual indicators

## Development

### Running in Development Mode

For development without Docker:

1. Start PostgreSQL and Redis separately
2. Configure backend environment variables in `.env`
3. Start the backend:
```bash
cd backend
npm install
npm run dev
```

4. Start the frontend:
```bash
cd frontend
npm install
npm start
```

## Troubleshooting

### Common Issues

- **Database Connection Errors**: Check that PostgreSQL and Redis Cluster containers are running
- **Frontend Cannot Connect to Backend**: Ensure the `REACT_APP_API_URL` is set correctly
- **Redis Cluster Configuration**: If Redis errors occur, ensure the cluster is properly initialized
- **Docker Networking Issues**: Try restarting Docker or rebuilding containers

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The React team for their excellent frontend framework
- Express.js for the backend API framework
- PostgreSQL and Redis teams for their database technologies
- Bitnami for their production-ready Redis Cluster image
- Docker for containerization capabilities