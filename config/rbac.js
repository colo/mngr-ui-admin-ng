module.exports = {
  "roles":[
	{
	  "id": "admin",
	  "name": "Administrator",
	  "roles": ["user"],
	  "permissions":[]
	},
	{
	  "id": "user",
	  "name": "User",
	  "roles": ["anonymous"],
	  "permissions":[]
	},
	{
	  "id": "anonymous",
	  "name": "Anonymous",
	  "permissions":[]
	}
  ],
  "subjects":[
	{
	  "id": "anonymous",
	  "roles":["anonymous"]
	}
  ],
  "operations":[
	{
	  "id": "view",
	  "name": "View"
	}
  ],
  "constrains":[
	{
	  "type": "RC",
	  "id": "rc",
	  "name": "Only allow n Subjects in a Role, set by cardinality",
	  "cardinality": 1,
	  "roles": ["admin"]
	},
	{
	  "type": "SSD",
	  "id": "ssd",
	  "name": "A user is authorized for a role only if that role is not mutually exclusive with any of the other roles for which the user is already authorized.",
	  "roles": ["anonymous", "user"]
	}
  ]
}
