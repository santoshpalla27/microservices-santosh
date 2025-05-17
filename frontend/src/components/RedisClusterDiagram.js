import React from 'react';

const RedisClusterDiagram = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-8">Redis Cluster Architecture</h2>
      
      <div className="relative w-full h-96 mb-8">
        {/* Network background */}
        <div className="absolute inset-0 bg-gray-100 rounded-lg border border-gray-300"></div>
        
        <div className="text-xs absolute top-2 left-4 text-gray-600 font-medium">redis-network</div>
        
        {/* Master Nodes */}
        <div className="absolute top-12 left-8 w-24 h-24 bg-red-100 rounded-lg border border-red-400 flex flex-col items-center justify-center shadow-md">
          <div className="text-lg mb-1">🔴</div>
          <div className="font-bold text-red-700">Master 0</div>
          <div className="text-xs text-gray-600">redis-node-0</div>
          <div className="text-xs mt-1">Hash Slots</div>
          <div className="text-xs">0-5460</div>
        </div>
        
        <div className="absolute top-12 left-40 w-24 h-24 bg-red-100 rounded-lg border border-red-400 flex flex-col items-center justify-center shadow-md">
          <div className="text-lg mb-1">🔴</div>
          <div className="font-bold text-red-700">Master 1</div>
          <div className="text-xs text-gray-600">redis-node-1</div>
          <div className="text-xs mt-1">Hash Slots</div>
          <div className="text-xs">5461-10922</div>
        </div>
        
        <div className="absolute top-12 left-72 w-24 h-24 bg-red-100 rounded-lg border border-red-400 flex flex-col items-center justify-center shadow-md">
          <div className="text-lg mb-1">🔴</div>
          <div className="font-bold text-red-700">Master 2</div>
          <div className="text-xs text-gray-600">redis-node-2</div>
          <div className="text-xs mt-1">Hash Slots</div>
          <div className="text-xs">10923-16383</div>
        </div>
        
        {/* Replica Nodes */}
        <div className="absolute bottom-12 left-8 w-24 h-24 bg-blue-100 rounded-lg border border-blue-400 flex flex-col items-center justify-center shadow-md">
          <div className="text-lg mb-1">🔵</div>
          <div className="font-bold text-blue-700">Replica 0</div>
          <div className="text-xs text-gray-600">redis-node-3</div>
          <div className="text-xs mt-1">Replicates</div>
          <div className="text-xs">Master 0</div>
        </div>
        
        <div className="absolute bottom-12 left-40 w-24 h-24 bg-blue-100 rounded-lg border border-blue-400 flex flex-col items-center justify-center shadow-md">
          <div className="text-lg mb-1">🔵</div>
          <div className="font-bold text-blue-700">Replica 1</div>
          <div className="text-xs text-gray-600">redis-node-4</div>
          <div className="text-xs mt-1">Replicates</div>
          <div className="text-xs">Master 1</div>
        </div>
        
        <div className="absolute bottom-12 left-72 w-24 h-24 bg-blue-100 rounded-lg border border-blue-400 flex flex-col items-center justify-center shadow-md">
          <div className="text-lg mb-1">🔵</div>
          <div className="font-bold text-blue-700">Replica 2</div>
          <div className="text-xs text-gray-600">redis-node-5</div>
          <div className="text-xs mt-1">Replicates</div>
          <div className="text-xs">Master 2</div>
        </div>
        
        {/* Replication Lines */}
        <div className="absolute top-36 left-20 h-40 w-px bg-red-500 border-l-2 border-dashed border-red-400"></div>
        <div className="absolute top-36 left-52 h-40 w-px bg-red-500 border-l-2 border-dashed border-red-400"></div>
        <div className="absolute top-36 left-84 h-40 w-px bg-red-500 border-l-2 border-dashed border-red-400"></div>
        
        {/* Initializer */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-32 h-32 bg-green-100 rounded-lg border border-green-400 flex flex-col items-center justify-center shadow-md">
          <div className="text-lg mb-1">⚙️</div>
          <div className="font-bold text-green-700">Cluster Init</div>
          <div className="text-xs text-gray-600">redis-cluster-init</div>
          <div className="text-xs mt-2 text-center">Configures cluster</div>
          <div className="text-xs text-center">REPLICA=1</div>
        </div>
        
        {/* Backend connection */}
        <div className="absolute top-1/4 right-48 w-24 h-24 bg-indigo-100 rounded-lg border border-indigo-400 flex flex-col items-center justify-center shadow-md">
          <div className="text-lg mb-1">🖥️</div>
          <div className="font-bold text-indigo-700">Backend</div>
          <div className="text-xs text-gray-600">Node.js</div>
          <div className="text-xs mt-1 text-center">Connects to all nodes</div>
        </div>
        
        {/* Connection lines from backend */}
        <svg className="absolute inset-0 w-full h-full" style={{zIndex: 5}}>
          <line x1="320" y1="84" x2="280" y2="84" stroke="#6366F1" strokeWidth="1" strokeDasharray="4" />
          <line x1="320" y1="84" x2="280" y2="64" stroke="#6366F1" strokeWidth="1" strokeDasharray="4" />
          <line x1="320" y1="84" x2="280" y2="104" stroke="#6366F1" strokeWidth="1" strokeDasharray="4" />
        </svg>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Key Features</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <span className="text-red-600 mr-2">•</span>
            <span><strong>Master Nodes:</strong> Store and serve data, each responsible for a subset of hash slots</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span><strong>Replica Nodes:</strong> Maintain copies of master data for failover protection</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2">•</span>
            <span><strong>Cluster Initializer:</strong> Sets up the cluster topology and relationship between nodes</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            <span><strong>Backend Connection:</strong> Node.js application connects to all nodes and redirects as needed</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-600 mr-2">•</span>
            <span><strong>Hash Slots:</strong> 16,384 slots distributed across master nodes for data sharding</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RedisClusterDiagram;