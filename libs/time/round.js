module.exports = {
	roundMilliseconds: function (timestamp) {
	  let d = new Date(timestamp)
	  d.setMilliseconds(0)

	  return d.getTime()
	},

	roundSeconds: function (timestamp) {
	  timestamp = roundMilliseconds(timestamp)
	  let d = new Date(timestamp)
	  d.setSeconds(0)

	  return d.getTime()
	},

	roundMinutes: function (timestamp) {
	  timestamp = roundSeconds(timestamp)
	  let d = new Date(timestamp)
	  d.setMinutes(0)

	  return d.getTime()
	},

	roundHours: function (timestamp) {
	  timestamp = roundMinutes(timestamp)
	  let d = new Date(timestamp)
	  d.setHours(0)

	  return d.getTime()
	}

}
