import {z} from 'zod'

export function contactForm() {
	// validation rules in place
	const schema = z.object({
		name: z.string({required_error: 'name is a required field'}).min(1, {message: 'name is a required field'}).max(64, {message: 'Name cannot' +
					' be greater than 64 characters'}),
		email: z.string({required_error: 'email is a required field'}).email({message: 'invalid email address'}).min(1, {message: 'email is a required field'}).max(128, {message: 'email cannot be greater than 128 characters'}),
		subject: z.string().min(1, {message: 'name is a required field'}).max(64, {message: 'subject cannot be greater than 64 characters'}).optional(),
		message: z.string({required_error: 'message is a required field'}).min(1, {message: 'message is a required' +
					' field'}).max(500, {message: 'message cannot be greater than 500 characters'}),
	})

	// grab the form to convert it into a form-data object and add event listener for the submit event
	const form = document.getElementById('contact-form')

	// grab the required input fields so that we can add/remove a red border if an error occurs
	const nameInput = document.getElementById('name')
	const emailInput = document.getElementById('email')
	const messageInput = document.getElementById('message')
	const subjectInput = document.getElementById('subject')

	// grab the error display elements to display error messages
	const nameError = document.getElementById('nameError')
	const emailError = document.getElementById('emailError')
	const messageError = document.getElementById('messageError')
	const subjectError = document.getElementById('subjectError')

	// grab the status output element to show a success message on a successful submit or a backend error message
	const statusOutput = document.getElementById('status')

	// define success and error classes to give user a quick visual hint on if the request was successful or not
	const successClasses = ['text-green-800', 'bg-green-50']
	const errorClasses = ['text-red-800', 'bg-red-50']

	// define what happens on submit
	form.addEventListener('submit', (e) => {
		// prevent default html behavior
		e.preventDefault()

		// create an object from the form using form data
		const formData = new FormData(form)

		// hide error messages and remove styling from previous submissions
		const errorArray = [nameError, emailError, messageError, subjectError];
		errorArray.forEach(element => {element.classList.add('hidden')})

		const inputArray = [nameInput, emailInput, messageInput, subjectInput];
		inputArray.forEach(input => {input.classList.remove('border-red-500')})

		// if the website input is set a bot most likely filled out the form, so provide a fake success message to
		// trick the bot into thinking it succeeded
		if(formData.get('website') !== '') {
			form.reset()
			statusOutput.innerHTML = 'message sent successfully'
			statusOutput.classList.add(...successClasses)
			statusOutput.classList.remove('hidden')
			return
		}

		// convert formData into an object so that validation can be performed
		const values = Object.fromEntries(formData.entries())

		// if email is an empty string set it to undefined
		values.email = values.email === '' ? undefined : values.email

		// check for zod errors related to validating inputs and provide feedback to users if an error occurred
		const result = schema.safeParse(values)

		if(result.success === false) {
			const errorsMap = {
				name: {inputError: nameInput, errorElement: nameError},
				email: {inputError: emailInput, errorElement: emailError},
				message: {inputError: messageInput, errorElement: messageError},
				subject: {inputError: subjectInput, errorElement: subjectError},
			}

			result.error.errors.forEach(error => {
				const {errorElement, inputError} = errorsMap[error.path[0]]
				errorElement.innerHTML = error.message
				errorElement.classList.remove('hidden')
				inputError.classList.add('border-red-500')
			})
			return
		}
		// if everything is valid submit the form
		fetch('./apis', {
			method:'post',
			headers: {'Content-Type': 'application/json'},
			body:JSON.stringify(values)
		}).then(response => response.json()).then(data =>  {
			statusOutput.innerHTML = data.message
			if (data.status === 200) {
				statusOutput.classList.add(...successClasses)
				form.reset()
			}
			statusOutput.classList.add(...errorClasses)
			statusOutput.classList.remove('hidden')
		}).catch(error => {
			console.error(error)
			statusOutput.innerHTML = 'Internal server error try again later'
			statusOutput.add(...errorClasses)
		})
	})
}