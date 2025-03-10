fetch('http://localhost:4200/apis', {
	method:'post',
	headers: {'Content-Type': 'application/json'},
	body:JSON.stringify({name: 'Marty', email: 'marty@skingisbetter.snow', message: 'I secretly like skiing', subject: 'did it work', website: ''})
}).then(response => response.json()).then(data =>  {console.log(data)})