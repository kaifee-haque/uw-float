// Validates course URLs from the UWaterloo Undergraduate Calendar.
//	(string) -> (bool)
//	url must be a valid URL.
function isValidCourse(url) {
	return (url.includes('ucalendar.uwaterloo.ca/') && url.includes('COURSE') && url.includes('#')) || (url.includes('ugradcalendar.uwaterloo.ca/') && url.includes('/courses/'));
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
async function getCourseInfo(courseCode) {
	let courseObj = fetch('https://uwflow.com/graphql', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			operationName: "getCourse", query: `query getCourse($code: String, $user_id: Int) {\n  course(where: {code: {_eq: $code}}) {\n    ...CourseInfo\n    ...CourseRequirements\n    ...CourseRating\n    __typename\n  }\n}\n\nfragment CourseInfo on course {\n  code\n  name\n  description\n  __typename\n}\n\n\nfragment CourseRequirements on course {\n  antireqs\n  prereqs\n  coreqs\n  __typename\n}\n\nfragment CourseRating on course {\n  rating {\n    liked\n    easy\n    useful\n    filled_count\n    comment_count\n    __typename\n  }\n  __typename\n}\n`,
			variables: { code: courseCode, user_id: 0 }
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

// Creates an info card for the given course link.
//  (string) -> (Promise<HTMLDivElement>)
//  anchor must be a valid course link.
async function createInfoCard(anchor) {
	const course = await getCourseInfo(getCourseCode(anchor.href));

	// Info card
	const infoCard = document.createElement('div');
	infoCard.setAttribute('id', 'info-card');
	// Align the info card's left edge with the link's left edge
	const linkRect = anchor.getBoundingClientRect();
	infoCard.style.left = `${linkRect.left + window.scrollX}px`;
	infoCard.style.top = `${linkRect.bottom + window.scrollY + 0}px`;

	// Course code
	let title = document.createElement('H1');
	title.setAttribute('id', 'course-code');
	title.appendChild(createAnchor("https://uwflow.com/course/" + course.code, course.code.match(/[a-z]+|[^a-z]+/gi).join(' ').toUpperCase()));
	infoCard.append(title);

	// Full course name
	let subtitle = document.createElement('H2');
	subtitle.setAttribute('id', 'course-name');
	subtitle.innerHTML = course.name;
	infoCard.append(subtitle);

	// Course description
	let description = document.createElement('p');
	description.innerHTML = course.description;
	infoCard.append(description);

	console.log(infoCard)
	return infoCard;
};

// Event handler for hovering over a course link.
async function onMouseEnterLink(event) {
	const trigger = event.target;
	if (trigger.tagName === 'A' && isValidCourse(trigger.href)) {
		document.body.appendChild(await createInfoCard(trigger));
	}
};

// Event handler for moving away from the course link.
function onMouseLeaveLink(event) {
	const trigger = event.relatedTarget;
	const infoCard = document.getElementById('info-card');
	if (infoCard !== null && trigger !== infoCard && (trigger === null || !infoCard.contains(trigger))) {
		document.body.removeChild(infoCard);
	}
};

document.addEventListener('mouseenter', onMouseEnterLink, true);
document.addEventListener('mouseleave', onMouseLeaveLink, true);