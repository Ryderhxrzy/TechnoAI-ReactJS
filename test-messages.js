// Test script to verify message loading
const testMessageLoading = async () => {
  const baseUrl = 'http://localhost:5000';
  const userId = 'ryderhxrzy@gmail.com';
  const chatTitle = 'Hello World With Python';
  
  try {
    console.log('Testing message loading...');
    console.log('User ID:', userId);
    console.log('Chat Title:', chatTitle);
    
    const response = await fetch(`${baseUrl}/api/messages/chat/${encodeURIComponent(userId)}/${encodeURIComponent(chatTitle)}`);
    
    if (response.ok) {
      const messages = await response.json();
      console.log('\n✅ Messages loaded successfully!');
      console.log('Number of messages:', messages.length);
      
      messages.forEach((msg, index) => {
        console.log(`\nMessage ${index + 1}:`);
        console.log('  ID:', msg._id);
        console.log('  Sender:', msg.sender);
        console.log('  Sequence:', msg.sequence);
        console.log('  Content:', msg.content.substring(0, 100) + '...');
        console.log('  Has Code:', msg.has_code);
        console.log('  Timestamp:', msg.timestamp);
      });
    } else {
      console.error('❌ Failed to load messages:', response.status);
      const errorData = await response.json();
      console.error('Error details:', errorData);
    }
  } catch (error) {
    console.error('❌ Error testing message loading:', error);
  }
};

// Run the test
testMessageLoading();
