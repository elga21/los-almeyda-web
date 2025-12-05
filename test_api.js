async function testApi() {
    try {
        console.log('📡 Solicitando productos...');
        const response = await fetch('http://localhost:3000/api/productos');

        console.log('Status:', response.status);
        if (!response.ok) {
            console.log('Error Text:', await response.text());
        } else {
            console.log('Success:', await response.json());
        }
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

testApi();
