'use strict'
const rooms = {};

function updateDashboard(roomNumber) {
	let chart = document.getElementById("room_"+roomNumber);
	
	if(!chart) { //create a new one
		const container = document.createElement('div');
		container.className = "chart"
		chart = document.createElement('canvas');
		chart.id = "room_"+roomNumber;
		chart.height = "400px";
		
		container.appendChild(chart);
		document.getElementById('dashboard').appendChild(container);
	}

	const data = [];
	let current = 0;
	for(let m of rooms[roomNumber].movements.sort((a,b) => a.timestamp-b.timestamp)) {
		current += m.entrata ? +1 : -1;
		data.push(current);
	}
	console.log(data)

	new Chart(chart, { // TODO: dates on x axis!
		type: 'line',
		data: {	// BUG: it shows only the first 2 entry
			datasets: [{
				label: 'Number of peoples',
				data: data,
				borderWidth: 1
			}]
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true
					}
				}]
			}
		}
	});
}

const db = firebase.firestore();
console.log(db? 'database connected' : 'fail to retrieve database');

db.collection('rooms').onSnapshot((snapshot) => {
	snapshot.forEach(doc => {
		const {roomNumber, currentNumberOfPeople, peopleLimitNumber} = doc.data();
		console.log('room data', {roomNumber, currentNumberOfPeople, peopleLimitNumber});
		if(!rooms[roomNumber]) { //initialize the data for this room
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			rooms[roomNumber] = {movements: [], last: yesterday};
			console.log('init', roomNumber, rooms[roomNumber]);
		}
		rooms[roomNumber].currentNumberOfPeople = currentNumberOfPeople;
		rooms[roomNumber].peopleLimitNumber = peopleLimitNumber;

		doc.ref.collection('movimenti').where("timestamp",">",rooms[roomNumber].last).get().then(mSnapshot =>{
			mSnapshot.forEach(mDoc => {
				let {entrata, timestamp, userId2} = mDoc.data();
				timestamp = new Date(timestamp.seconds*1000);
				rooms[roomNumber].movements.push({entrata, timestamp, userId2});
				console.log('movements', {entrata, timestamp, userId2});

				if(rooms[roomNumber].last < timestamp)
					rooms[roomNumber].last = timestamp;
			});
			console.log('rooms updated:', roomNumber, rooms[roomNumber])
			updateDashboard(roomNumber);
		});
	});
});