'use strict'
const rooms = {};
const stdColor = {
	'normal' : 'rgba(54, 162, 235)',
	'warning': 'rgba(255, 206, 86)',
	'alert' : 'rgba(255, 99, 132)',
};


function updateDashboard(roomNumber) {
	const data = [];
	const labels = [];
	const colors = [];
	let current = 0;
	let currentHour = null;

	// push "current" into "data" for the number oh hours that separate "from" to "to"
	function pushData(from, to) {
		let curr = new Date(from.getTime());
		const color = current >= rooms[roomNumber].peopleLimitNumber ?
			stdColor['alert']
			: current >= rooms[roomNumber].peopleLimitNumber * 0.7 ?
				stdColor['warning']
				: stdColor['normal'];
		do {
			data.push(current);
			labels.push(curr.toLocaleString());
			colors.push(color);
			curr = curr.add("1h");
		} while(curr.getTime() < to.getTime());
		return to;
	}

	// fill the data from the oldest movements
	for(let m of rooms[roomNumber].movements.sort((a,b) => a.timestamp-b.timestamp)) {
		if(currentHour === null)
			currentHour = m.timestamp.trim('y','h');
		
		if(currentHour.getTime() !== m.timestamp.trim('y','h').getTime())
			currentHour = pushData(currentHour, m.timestamp.trim('y','h'));
		
		current += m.entrata ? +1 : -1;
	}

	// fill the data form the latest movements to now
	pushData(currentHour, new Date().trim('y','h'));
	
	console.log(data)


	let chartContainer = document.getElementById("room_"+roomNumber);
	const chart = document.createElement('canvas');
	chart.height = "400px";

	if(!chartContainer) {
		chartContainer = document.createElement('div');
		chartContainer.className = "chart";
		chartContainer.id = "room_"+roomNumber;	
		document.getElementById('dashboard').appendChild(chartContainer);
	} else {
		while(chartContainer.firstChild)
			chartContainer.firstChild.remove();
	}
	chartContainer.appendChild(chart);

	new Chart(chart, {
		type: 'bar',
		data: {
			labels: labels,
			datasets: [{
				data: data,
				backgroundColor: colors,
				borderWidth: 1
			}]
		},
		options: {
			title: {
				display: true,
            	text: 'Room '+roomNumber+' (max capacity: '+rooms[roomNumber].peopleLimitNumber+')',
			},
			legend: {
				display: false
			},
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
			const startingTime = new Date();
			startingTime.setDate(startingTime.getDate() - 7);
			rooms[roomNumber] = {movements: [], last: startingTime};
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