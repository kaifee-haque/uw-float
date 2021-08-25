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

	let courseObj = fetch('https://uwflow.com/graphql', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ operationName: "getCourse", query: `query getCourse($code: String, $user_id: Int) {\n  course(where: {code: {_eq: $code}}) {\n    ...CourseInfo\n    ...CourseRequirements\n    ...CourseRating\n    __typename\n  }\n}\n\nfragment CourseInfo on course {\n  code\n  name\n  description\n  __typename\n}\n\n\nfragment CourseRequirements on course {\n  antireqs\n  prereqs\n  coreqs\n  __typename\n}\n\nfragment CourseRating on course {\n  rating {\n    liked\n    easy\n    useful\n    filled_count\n    comment_count\n    __typename\n  }\n  __typename\n}\n`,
							   variables: {code: courseCode, user_id: 0}
		}),
	})
	.then(res => res.json())
	.then(res => res.data.course[0]);

	return courseObj;
}

// Creates an anchor tag with the given url and text.
//	(string) (string) -> (HTMLAnchorElement)
//	url must be a valid URL.
function createAnchor(url, text) {
	let anchor = document.createElement('a');
	anchor.href = url;
	anchor.innerText = text;
	return anchor;
}

// Attaches an info card to the given link.
// (HTMLDivElement) -> (void)
async function addInfoCard(link) {
	let course = await getCourseInfo(getCourseCode(link.firstChild.href));

	// Info card
	let infoCard = document.createElement('span');
	infoCard.classList.add('InfoCard');

	// Course code
	let title = document.createElement('H1');
	title.classList.add('CourseCode');
	title.appendChild(createAnchor("https://uwflow.com/course/" + course.code, course.code.match(/[a-z]+|[^a-z]+/gi).join(' ').toUpperCase()));
	infoCard.append(title);
	
	// Full course name
	let subtitle = document.createElement('H2');
	subtitle.classList.add('CourseName');
	subtitle.innerHTML = course.name;
	infoCard.append(subtitle);
	
	// Course description
	let description = document.createElement('p');
	description.innerHTML = course.description;
	infoCard.append(description);
	
	link.appendChild(infoCard);
}

// Modifies all course links to include an info card.
//	(void) -> (void)
function modifyLinks() {
	let links = document.getElementsByTagName('a');
	// Add a div parent to each valid course link
	for (let i = 0; i < links.length; i++) {
		if (isValidCourse(links[i].href)) {
			let oldLink = links[i];
			let url = oldLink.href;

			// Create and initalize the new link
			let newLink = document.createElement('div');
			newLink.classList.add('Course');
			newLink.appendChild(createAnchor(url, oldLink.innerHTML));

			addInfoCard(newLink);

			oldLink.replaceWith(newLink);
			newLink.parentElement.classList.add('LinkContainer');
		}
	}
}

window.addEventListener('load', modifyLinks);