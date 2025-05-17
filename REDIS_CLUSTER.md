# Redis Cluster Configuration

This document explains how the Bitnami Redis Cluster is configured in the application.

## Overview

The application uses Bitnami's Redis Cluster with a 6-node setup, providing:

- Data sharding across multiple Redis nodes
- Automatic failover for high availability
- Horizontal scaling capabilities
- Master-replica architecture with 3 masters and 3 replicas

## Docker Compose Configuration

In the `docker-compose.yml` file, Redis Cluster is configured with 6 Redis nodes and a cluster initializer service:

```yaml
redis-node-0:
  image: bitnami/redis-cluster:latest
  environment:
    - REDIS_PASSWORD=redis_password
  ports:
    - "7000:6379"
  volumes:
    - redis-node-0-data:/bitnami
  networks:
    - redis-network

# (similar configuration for redis-node-1 through redis-node-5)

redis-cluster-init:
  image: bitnami/redis-cluster:latest
  depends_on:
    - redis-node-0
    - redis-node-1
    - redis-node-2
    - redis-node-3
    - redis-node-4
    - redis-node-5
  environment:
    - REDIS_CLUSTER_CREATOR=yes
    - REDIS_CLUSTER_REPLICAS=1
    - REDIS_NODES=redis-node-0 redis-node-1 redis-node-2 redis-node-3 redis-node-4 redis-node-5
    - REDIS_PASSWORD=redis_password
  networks:
    - redis-network
```

### Key Components

- **6 Redis Nodes**: Each running in its own container with persistent storage
- **Cluster Initializer**: A separate container that configures the cluster
- **REDIS_CLUSTER_REPLICAS=1**: Each master node has 1 replica (3 masters, 3 replicas)
- **Dedicated Network**: All Redis nodes are connected via a dedicated `redis-network`

## Cluster Architecture

The Redis Cluster is configured as follows:

- **Number of Nodes**: 6 total nodes
- **Replication Factor**: 1 replica per master
- **Master Nodes**: 3 (Redis nodes 0, 1, 2 by default)
- **Replica Nodes**: 3 (Redis nodes 3, 4, 5 by default)
- **Hash Slots**: 16384 slots distributed evenly across the 3 master nodes

## Backend Configuration

The backend connects to all Redis Cluster nodes:

```javascript
const getClusterNodes = () => {
  const nodesString = process.env.REDIS_CLUSTER_NODES || 'redis-node-0:6379,redis-node-1:6379,...';
  return nodesString.split(',').map(nodeStr => ({
    url: `redis://:${process.env.REDIS_PASSWORD}@${nodeStr}`
  }));
};

const redisClient = createCluster({
  rootNodes: getClusterNodes(),
  // other configuration
});
```

## Data Persistence

Each Redis node has its own volume for data persistence:

```yaml
volumes:
  redis-node-0-data:
  redis-node-1-data:
  redis-node-2-data:
  redis-node-3-data:
  redis-node-4-data:
  redis-node-5-data:
```

## Cluster Initialization Process

1. All 6 Redis nodes start up independently
2. The `redis-cluster-init` container starts once all nodes are running
3. The initializer configures the cluster with the specified replicas
4. Hash slots are distributed across the 3 master nodes
5. The backend connects to all nodes and can start using the cluster

## Troubleshooting

### Checking Cluster Status

```bash
# Connect to any Redis node
docker exec -it  redis-cli -a redis_password

# Check cluster info
> CLUSTER INFO

# View cluster nodes
> CLUSTER NODES

# Check if cluster is operational
> CLUSTER SLOTS
```

### Common Issues

1. **Cluster Not Forming**: 
   - Check logs of the initializer: `docker-compose logs redis-cluster-init`
   - Ensure all nodes are on the same network

2. **Connectivity Issues**:
   - Try pinging each node: `docker exec <container_id> ping redis-node-0`
   - Check that port mappings are correct

3. **Failed Initialization**:
   - Reset the cluster by removing volumes: `docker-compose down -v`
   - Restart with: `docker-compose up -d`