// Simple test script to verify backend is working
const testBackend = async () => {
  const baseUrl = 'http://localhost:5000';
  
  try {
    // Test server health
    console.log('Testing server health...');
    const healthResponse = await fetch(`${baseUrl}/`);
    const healthData = await healthResponse.text();
    console.log('Server response:', healthData);
    
    // Test message saving
    console.log('\nTesting message saving...');
    const testMessages = [
      {
        chat_title: "Test Chat",
        sender: "test_user@example.com",
        content: "Hello, this is a test message",
        has_code: false,
        sequence: 1
      },
      {
        chat_title: "Test Chat",
        sender: "bot",
        content: "This is a test response from the bot",
        has_code: false,
        sequence: 2
      }
    ];
    
    const saveResponse = await fetch(`${baseUrl}/api/messages/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: testMessages })
    });
    
    if (saveResponse.ok) {
      const savedMessages = await saveResponse.json();
      console.log('Messages saved successfully:', savedMessages.length);
    } else {
      console.error('Failed to save messages:', saveResponse.status);
    }
    
    // Test loading conversation titles
    console.log('\nTesting conversation titles loading...');
    const titlesResponse = await fetch(`${baseUrl}/api/messages/titles/test_user@example.com`);
    
    if (titlesResponse.ok) {
      const titles = await titlesResponse.json();
      console.log('Conversation titles:', titles);
    } else {
      console.error('Failed to load titles:', titlesResponse.status);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testBackend();
