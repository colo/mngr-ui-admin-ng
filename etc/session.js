'use strict'

module.exports = {
	cookie: { path: '/', httpOnly: true, maxAge: null, secure: false },
	secret: 'change-secret',
	resave: true,
	saveUninitialized: false,
	name: 'SID',
	unset: 'destroy'
}
