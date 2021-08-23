// Validates course URLs from the UWaterloo Undergraduate Calendar.
//	(string) -> (bool)
//	url must be a valid URL.
function isValidCourse(url) {
	return (url.includes('ucalendar.uwaterloo.ca/') && url.includes('COURSE') && url.includes('#')) || (url.includes('ugradcalendar.uwaterloo.ca/') &&url.includes('/courses/'));
}

// Extracts the course code from a URL.
// (string) -> (string)
// url must be a valid course URL from the Undergraduate Calendar.
function getCourseCode(url) {
	if (url.includes('COURSE')) {
		return url.substring(url.indexOf('#') + 1).toLowerCase();
	} else {
		return url.substring(url.indexOf('/courses/') + 9).split('/').join('').toLowerCase();
	}
}

// Returns an object that contains information about the course.
//	(string) -> (object)
//	courseCode must be in the form <department><number>, where department is lowercase.
function getCourseInfo(courseCode) {
	//let course;

	fetch('https://uwflow.com/graphql', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ operationName: "getCourse", query: `query getCourse($code: String, $user_id: Int) {\n  course(where: {code: {_eq: $code}}) {\n    ...CourseInfo\n    ...CourseRequirements\n    ...CourseRating\n    __typename\n  }\n}\n\nfragment CourseInfo on course {\n  code\n  name\n  description\n  __typename\n}\n\n\nfragment CourseRequirements on course {\n  antireqs\n  prereqs\n  coreqs\n  __typename\n}\n\nfragment CourseRating on course {\n  rating {\n    liked\n    easy\n    useful\n    filled_count\n    comment_count\n    __typename\n  }\n  __typename\n}\n`, variables: {code: courseCode, user_id: 0}
		}),
	})
	.then(res => res.json())
	.then(res => course = res.data.course[0]);

	return course;
}

// Appends an info card to the course hyperlink.
function popup(link) {
	course = getCourseInfo(getCourseCode(link.href));
	
	// Preview card
	let card = document.createElement('div');
	link.appendChild(card);
	card.removeAttribute('href');
	
	// Course code
	let title = document.createElement('H1');
	title.innerHTML = course.code.match(/[a-z]+|[^a-z]+/gi).join(' ').toUpperCase();
	card.appendChild(title);
	
	// Full course name
	let subtitle = document.createElement('H2');
	subtitle.innerHTML = course.name;
	card.appendChild(subtitle);
	
	// Course description
	let description = document.createElement('p');
	description.innerHTML = course.description;
	card.appendChild(description);
	
	/*let liked = document.createElement('p');
	title.innerHTML = course.rating.liked * 100;
	card.appendChild(liked);*/

	/*let element = document.createElement('');
	card.appendChild(image);*/
}

// Store each link, loop over them and add a hover listener if it's a valid course
let links = document.getElementsByTagName('a');
for (let i = 0; i < links.length; i++) {
	if (isValidCourse(links[i].href)) {
		links[i].addEventListener("mouseover", () => popup(links[i]));
	}
}
