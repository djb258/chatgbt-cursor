import React from 'react';

interface TestComponentProps {
  message?: string;
}

export const TestComponent: React.FC<TestComponentProps> = ({ 
  message = "Hello from the collaboration system!" 
}) => {
  return (
    <div className="test-component">
      <h2>Test Component</h2>
      <p>{message}</p>
      <p>This component was created via ChatGPT ↔ Cursor AI collaboration!</p>
      <div className="test-info">
        <small>Created: {new Date().toLocaleString()}</small>
      </div>
    </div>
  );
};

export default TestComponent; 