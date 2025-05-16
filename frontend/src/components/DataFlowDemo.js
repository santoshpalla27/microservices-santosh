import React, { useState } from 'react';
import { ArrowRight, Database, Server, Globe, HardDrive, CheckCircle, XCircle } from 'lucide-react';

const Demo = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [storage, setStorage] = useState('postgres');
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [demoData, setDemoData] = useState({
    postgres: [
      { id: 1, key: 'sample_key_1', value: 'This is sample data 1 in PostgreSQL', created_at: '2024-05-16T10:30:00Z' },
      { id: 2, key: 'sample_key_2', value: 'This is sample data 2 in PostgreSQL', created_at: '2024-05-16T10:35:00Z' }
    ],
    redis: [
      { key: 'redis_key_1', value: 'Cache data 1' },
      { key: 'redis_key_2', value: 'Cache data 2' }
    ]
  });
  
  const [formData, setFormData] = useState({
    key: '',
    value: ''
  });
  
  const steps = [
    { name: 'User Input', description: 'Enter key-value data' },
    { name: 'Storage Selection', description: 'Choose where to store data' },
    { name: 'Transmission', description: 'Data sent to backend' },
    { name: 'Processing', description: 'Backend processes request' },
    { name: 'Storage', description: 'Data stored in database' },
    { name: 'Response', description: 'Success confirmation' }
  ];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleStorageChange = (e) => {
    setStorage(e.target.value);
  };
  
  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
      
      // Add animations/effects based on the step
      if (activeStep === 4) {
        // Add data to the demo data
        const newData = {
          key: formData.key,
          value: formData.value
        };
        
        if (storage === 'postgres') {
          const postgresData = [...demoData.postgres];
          postgresData.push({
            id: postgresData.length + 1,
            ...newData,
            created_at: new Date().toISOString()
          });
          setDemoData({
            ...demoData,
            postgres: postgresData
          });
          setStatusMessage('Data saved successfully to PostgreSQL');
        } else {
          const redisData = [...demoData.redis];
          redisData.push(newData);
          setDemoData({
            ...demoData,
            redis: redisData
          });
          setStatusMessage('Data saved successfully to Redis');
        }
        
        setShowStatus(true);
      }
    }
  };
  
  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      setShowStatus(false);
    }
  };
  
  const resetDemo = () => {
    setActiveStep(0);
    setFormData({ key: '', value: '' });
    setShowStatus(false);
  };
  
  const isFormValid = formData.key.trim() !== '' && formData.value.trim() !== '';
  const isStepActionable = activeStep !== 0 || isFormValid;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6 text-center">Data Flow Application Demo</h2>
      
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className={`flex flex-col items-center ${idx <= activeStep ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${idx <= activeStep ? 'border-blue-600 bg-blue-100' : 'border-gray-300'}`}>
                  {idx < activeStep ? (
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className="text-xs mt-1 text-center hidden md:block">{step.name}</span>
              </div>
              
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${idx < activeStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="text-center text-gray-700 font-medium">
          {steps[activeStep].description}
        </div>
      </div>
      
      {/* Content based on current step */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        {activeStep === 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Enter Key-Value Data</h3>
            <div>
              <label className="block text-gray-700 mb-1">Key</label>
              <input
                type="text"
                name="key"
                value={formData.key}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Enter key"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Value</label>
              <textarea
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows="3"
                placeholder="Enter value"
              ></textarea>
            </div>
          </div>
        )}
        
        {activeStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Select Storage Type</h3>
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="storage"
                  value="postgres"
                  checked={storage === 'postgres'}
                  onChange={handleStorageChange}
                  className="mr-2"
                />
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-purple-600 mr-2" />
                  <span>PostgreSQL (Persistent Storage)</span>
                </div>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="storage"
                  value="redis"
                  checked={storage === 'redis'}
                  onChange={handleStorageChange}
                  className="mr-2"
                />
                <div className="flex items-center">
                  <HardDrive className="h-5 w-5 text-red-600 mr-2" />
                  <span>Redis (In-memory Cache)</span>
                </div>
              </label>
            </div>
          </div>
        )}
        
        {activeStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Data Transmission</h3>
            <div className="flex flex-col md:flex-row items-center justify-center py-6">
              <div className="flex flex-col items-center mb-4 md:mb-0">
                <Globe className="h-12 w-12 text-blue-600" />
                <span className="text-sm mt-1">Frontend</span>
              </div>
              
              <div className="w-16 flex justify-center items-center animate-pulse">
                <ArrowRight className="h-8 w-8 text-gray-600" />
              </div>
              
              <div className="flex flex-col items-center">
                <Server className="h-12 w-12 text-green-600" />
                <span className="text-sm mt-1">Backend</span>
              </div>
            </div>
            <div className="bg-gray-100 p-3 rounded mt-4">
              <p className="text-sm font-mono">
                POST /api/data/{storage} <br />
                {`{ "key": "${formData.key}", "value": "${formData.value}" }`}
              </p>
            </div>
          </div>
        )}
        
        {activeStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Backend Processing</h3>
            <div className="p-3 bg-gray-100 rounded font-mono text-sm">
              {storage === 'postgres' ? (
                <div>
                  <p className="mb-2">// Handling request in controller</p>
                  <p>const {"{"} key, value {"}"} = req.body;</p>
                  <p className="mb-2">// Preparing SQL query</p>
                  <p className="text-green-600">const query = 'INSERT INTO data_items (key, value) VALUES ($1, $2)';</p>
                  <p className="mb-2">// Execute database operation</p>
                  <p className="text-blue-600">await db.query(query, ["{formData.key}", "{formData.value}"]);</p>
                </div>
              ) : (
                <div>
                  <p className="mb-2">// Handling request in controller</p>
                  <p>const {"{"} key, value {"}"} = req.body;</p>
                  <p className="mb-2">// Execute Redis operation</p>
                  <p className="text-red-600">await redisClient.set("{formData.key}", "{formData.value}");</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeStep === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Data Storage</h3>
            {storage === 'postgres' ? (
              <div className="flex flex-col items-center">
                <Database className="h-16 w-16 text-purple-600 mb-2" />
                <p className="text-center mb-2">PostgreSQL Database</p>
                <div className="w-full bg-white p-3 rounded border border-gray-300 overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {demoData.postgres.slice(0, 2).map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 text-sm">{item.id}</td>
                          <td className="px-3 py-2 text-sm">{item.key}</td>
                          <td className="px-3 py-2 text-sm">{item.value}</td>
                          <td className="px-3 py-2 text-sm">{new Date(item.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-green-50">
                        <td className="px-3 py-2 text-sm">{demoData.postgres.length}</td>
                        <td className="px-3 py-2 text-sm font-semibold">{formData.key}</td>
                        <td className="px-3 py-2 text-sm">{formData.value}</td>
                        <td className="px-3 py-2 text-sm">{new Date().toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <HardDrive className="h-16 w-16 text-red-600 mb-2" />
                <p className="text-center mb-2">Redis Cache</p>
                <div className="w-full bg-white p-3 rounded border border-gray-300">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {demoData.redis.slice(0, 2).map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-sm">{item.key}</td>
                          <td className="px-3 py-2 text-sm">{item.value}</td>
                        </tr>
                      ))}
                      <tr className="bg-green-50">
                        <td className="px-3 py-2 text-sm font-semibold">{formData.key}</td>
                        <td className="px-3 py-2 text-sm">{formData.value}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeStep === 5 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Operation Complete</h3>
            <div className="flex justify-center p-4">
              <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center">
                <CheckCircle className="h-8 w-8 mr-3" />
                <div>
                  <p className="font-semibold">Success!</p>
                  <p>{statusMessage}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 p-3 rounded mt-2">
              <p className="text-sm font-mono">
                Response: 201 Created <br />
                {storage === 'postgres' ? 
                  `{ "id": ${demoData.postgres.length}, "key": "${formData.key}", "value": "${formData.value}", "created_at": "${new Date().toISOString()}" }` : 
                  `{ "key": "${formData.key}", "value": "${formData.value}" }`}
              </p>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-blue-800 font-medium mb-2">What happened?</h4>
              <p className="text-sm text-gray-800">
                {storage === 'postgres' ? (
                  <>Your data was sent to the backend, which saved it in the PostgreSQL database for long-term persistent storage. The database assigned an ID and timestamp to your record.</>
                ) : (
                  <>Your data was sent to the backend, which saved it in the Redis in-memory store for fast access. Redis provides high-performance caching with optional persistence.</>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={activeStep === 0}
          className={`px-4 py-2 rounded ${
            activeStep === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>
        
        {activeStep === steps.length - 1 ? (
          <button
            onClick={resetDemo}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Start Over
          </button>
        ) : (
          <button
            onClick={nextStep}
            disabled={!isStepActionable}
            className={`px-4 py-2 rounded ${
              !isStepActionable
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default Demo;