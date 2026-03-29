import axios from 'axios';

async function testGoogle() {
  try {
    const res = await axios.get('https://biobeats-api-dwe8abgwg3e9agcu.francecentral-01.azurewebsites.net/api/auth/google');
    console.log("SUCCESS");
    console.log("Status:", res.status);
    console.log("Data:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log("ERROR");
    if (err.response) {
      console.log("Status:", err.response.status);
      console.log("Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.log("Message:", err.message);
    }
  }
}

testGoogle();
