import express, { request, response } from 'express'
import morgan from 'morgan';
import {z} from "zod";
import formData from 'form-data'
import Mailgun from "mailgun.js"
import 'dotenv/config'

const mailgun = new Mailgun(formData)
const mailgunClient = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY})

// setup up and configured our middleware
const app = express()

//registered Morgan as a middleware with express
// middleware allows for modifying incoming requests and customizing our responses
app.use(morgan('dev'))

// setup express to use json responses and parse json requests
app.use(express.json())

// Created a router so that we can have custom paths for different resources in our application
const indexRoute = express.Router()

const firstHandler = async (request, response, next) => {
	const schema = z.object({
		name: z.string({required_error: 'name is a required field'}).min(1, {message: 'name is a required field'}).max(64, {message: 'Name cannot' +
					' be greater than 64 characters'}),
		email: z.string({required_error: 'email is a required field'}).email({message: 'invalid email address'}).min(1, {message: 'email is a required field'}).max(128, {message: 'email cannot be greater than 128 characters'}),
		subject: z.string().min(1, {message: 'name is a required field'}).max(64, {message: 'subject cannot be greater than 64 characters'}).optional(),
		message: z.string({required_error: 'message is a required field'}).min(1, {message: 'message is a required' +
					' field'}).max(500, {message: 'message cannot be greater than 500 characters'}),
	})
	const result = schema.safeParse(request.body)

	if(result.error) {
		return response.json({status: 418, message: result.error.issues[0].message})
	}

	if(request.body.website !== "") {
		return response.json({status: 201, message: 'email sent successfully'})
	}

	try{
		const subject = result.data.subject ?? undefined
		const mailgunMessage = {
			from: `${result.data.email} <postmaster@${process.env.MAILGUN_DOMAIN}>`,
			subject,
			text: `from ${result.data.name}`,
			to: process.env.MAILGUN_RECIPIENT
		}
		await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, mailgunMessage)
		return response.json({status: 200, message: 'email sent successfully'})
	} catch (error) {
		console.error(error)
		return response.json({status: 500, message: 'internal server error try again later'})
	}
}

indexRoute.route('/').post(firstHandler).get((request, response) => {
	response.json({status: 200, message: 'hello world'})
})

app.use('/apis', indexRoute)

// app.listen tells express what port to run on
app.listen(4200, () => {
	console.log('server is running')
})