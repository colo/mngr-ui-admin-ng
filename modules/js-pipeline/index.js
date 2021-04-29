'use strict'

const	mootools = require('mootools')
			// Poller = require('./input/poller'),
			// Pusher = require('./input/pusher');
			//CradleOutput = require('./output/cradle');

const debug = require('debug')('js-pipeline'),
			debug_internals = require('debug')('js-pipeline:Internals'),
			debug_events = require('debug')('js-pipeline:Events')

module.exports = new Class({
  Implements: [Options, Events],

	// ON_INIT: 'onInit',

	// ON_CONNECT: 'onConnect',

	ON_SUSPEND: 'onSuspend',
	ON_RESUME: 'onResume',
	ON_EXIT: 'onExit',

	ON_ONCE: 'onOnce',
	ON_RANGE: 'onRange',

	ON_DOC: 'onDoc',
	ON_DOC_ERROR: 'onDocError',

	ON_ONCE_DOC: 'onOnceDoc',
	ON_ONCE_DOC_ERROR: 'onOnceDocError',

	ON_PERIODICAL_DOC: 'onPeriodicalDoc',
	ON_PERIODICAL_DOC_ERROR: 'onPeriodicalDocError',

	ON_SAVE_DOC: 'onSaveDoc',
	ON_SAVE_MULTIPLE_DOCS: 'onSaveMultipleDocs',

	ON_DOC_SAVED: 'onDocSaved',

	inputs: undefined,
	filters: [],
	outputs: undefined,

	options: {
		input: null,
		filters: null,
		output: null,

	},
	initialize: function(options){


		//console.log(options);
		debug_internals('Inputs %o', options.input);
		// if(options.NS === 'a22cf722-6ea9-4396-b2b3-9440dd677dd0')
		// process.exit(1)

		if(options.input){
			if(Array.isArray(options.input)){//on array maybe use input.id as object.key
				if(this.inputs === undefined) this.inputs = []
				Array.each(options.input, function(input, index){
					// let _input = this.__process_input(input)
					// if(_input) this.inputs.push(_input)
					this.inputs.push(input)
					// debug_internals('PollerInputs %s %o', index, _input)
				}.bind(this));
			}
			else{
				if(this.inputs === undefined) this.inputs = {}
				Object.each(options.input, function(input, name){
					// let _input = this.__process_input(input)
					// if(_input) this.inputs[name] = _input
					this.inputs[name] = input
					// debug_internals('PollerInputs %s %o', name, _input)
				}.bind(this))
			}


		}

		if(options.output){
			// Array.each(options.output, function(output){
			// 	let type = Object.keys(output)[0];
			//
			// 	if(typeof(output) == 'function'){
			// 		output = output.bind(this)
			// 		this.outputs.push(output);
			// 	}
			// 	else if(output[type].module){
			// 		debug_internals('output %o', output[type])
			// 		this.outputs.push(new output[type].module(output[type]));
			// 	}
			// 	else{
			// 		throw new Error('Output ['+type+'] not implemented');
			// 	}
			//
			//
			// }.bind(this));
			if(Array.isArray(options.output)){//on array maybe use output.id as object.key
				if(this.outputs === undefined) this.outputs = []
				Array.each(options.output, function(output, index){
					// let _output = this.__process_output(output)
					// if(_output) this.outputs.push(_output)
					this.outputs.push(output)
					// debug_internals('PollerInputs %s %o', index, _output)
				}.bind(this));
			}
			else{
				if(this.outputs === undefined) this.outputs = {}
				Object.each(options.output, function(output, name){
					// let _output = this.__process_output(output)
					// if(_output) this.outputs[name] = _output
					this.outputs[name] = output
					// debug_internals('PollerInputs %s %o', name, _output)
				}.bind(this))
			}
		}

		if(options.filters){

			if(!Array.isArray(options.filters)){//on array maybe use output.id as object.key
				options.filters = [options.filters]
			}

			this.filters.combine(options.filters)
		}

		this.setOptions(options);

		this.start();


	},
	get_input_by_id(id){
		let _input
		// Array.each(this.inputs, function(input, index){
		// 	if(input.options.id == id){
		// 		// debug_internals('get_input_by_id', input.options.id, id)
		// 		_input = input
		// 	}
		//
		// })
		for (const index in this.inputs) {
			const input = this.inputs[index]
			if(index === id || ( input.options && input.options.id === id )){
				// debug_internals('get_input_by_id', input.options.id, id)
				_input = input
			}
		}
		return _input
	},
	get_output_by_id(id){
		let _output

		for (const index in this.outputs) {
			const output = this.outputs[index]
			if(index === id || (output.options && output.options.id === id)){
				// debug_internals('get_output_by_id', output.options.id, id)
				_output = output
			}
		}
		return _output
	},
	// __process_input: function(input){
	// 	let type = Object.keys(input)[0];
	// 	let result = undefined
	//
	// 	switch (type){
	// 		case 'poll':
	// 			debug_internals('Adding PollerInput %o', input[type]);
	// 			result = new Poller(input[type])
	// 			break;
	//
	// 		case 'push':
	// 			debug_internals('Adding PusherInput %o', input[type]);
	// 			result = new Pusher(input[type])
	// 			break;
	//
	// 		default:
	// 			throw new Error('Input ['+type+'] not implemented');
	// 	}
	//
	// 	return result
	// },
	__start_input: function(input){
		debug('__start_input', input, input.connect)
		// process.exit(1)
		// this.addEvent(this.ON_SUSPEND, function(req){
		// 	if(Array.isArray(req))
		// 		req = [req]
		//
		// 	input.fireEvent(input.ON_SUSPEND, req);
		// });
		this.addEvent(this.ON_SUSPEND, req => input.fireEvent(input.ON_SUSPEND, [req]))

		// this.addEvent(this.ON_RESUME, function(req){
		// 	if(Array.isArray(req))
		// 		req = [req]
		//
		// 	input.fireEvent(input.ON_RESUME, req);
		// });
		this.addEvent(this.ON_RESUME, req => input.fireEvent(input.ON_RESUME, [req]))

		// this.addEvent(this.ON_EXIT, function(req){
		// 	if(Array.isArray(req))
		// 		req = [req]
		//
		// 	input.fireEvent(input.ON_EXIT, req);
		// });
		this.addEvent(this.ON_EXIT, req => input.fireEvent(input.ON_EXIT, [req]))

		// this.addEvent(this.ON_RANGE, function(req){
		// 	// console.log('js-pipeline ON_RANGE', req)
		// 	if(Array.isArray(req))
		// 		req = [req]
		//
		// 	input.fireEvent(input.ON_RANGE, req);
		// });
		this.addEvent(this.ON_RANGE, req => input.fireEvent(input.ON_RANGE, [req]))

		// this.addEvent(this.ON_ONCE, function(req){
		// 	if(Array.isArray(req))
		// 		req = [req]
		//
		// 	input.fireEvent(input.ON_ONCE, req);
		// });
		this.addEvent(this.ON_ONCE, req => input.fireEvent(input.ON_ONCE, [req]))

		// this.addEvent(this.ON_DOC_SAVED, function(err, result){
		// 	// debug_internals('this.ON_DOC_SAVED', err, result)
		// 	input.fireEvent(input.ON_DOC_SAVED, [err, result]);
		// });
		this.addEvent(this.ON_DOC_SAVED, (err, result) => input.fireEvent(input.ON_DOC_SAVED, [err, result]))

		// if(input.ON_DOC_ERROR)
		// 	input.addEvent(input.ON_DOC_ERROR, function(err, resp){
		// 		debug_events('input.ON_DOC_ERROR %o', err, resp);
		//
		// 		this.fireEvent(this.ON_DOC_ERROR, [err, resp]);
		// 	}.bind(this));

		if(input.ON_DOC_ERROR) input.addEvent(input.ON_DOC_ERROR, (err, resp) => this.fireEvent(this.ON_DOC_ERROR, [err, resp]))

		// if(input.ON_ONCE_DOC_ERROR)
		// 	input.addEvent(input.ON_ONCE_DOC_ERROR, function(err, resp){
		// 		debug_events('input.ON_ONCE_DOC_ERROR %o', err, resp);
		//
		// 		this.fireEvent(this.ON_ONCE_DOC_ERROR, [err, resp]);
		// 	}.bind(this));
		if(input.ON_ONCE_DOC_ERROR) input.addEvent(input.ON_ONCE_DOC_ERROR, (err, resp) => this.fireEvent(this.ON_ONCE_DOC_ERROR, [err, resp]))

		// if(input.ON_PERIODICAL_DOC_ERROR)
		// 	input.addEvent(input.ON_PERIODICAL_DOC_ERROR, function(err, resp){
		// 		debug_events('input.ON_PERIODICAL_DOC_ERROR %o', err, resp);
		//
		// 		this.fireEvent(this.ON_PERIODICAL_DOC_ERROR, [err, resp]);
		// 	}.bind(this));
		if(input.ON_PERIODICAL_DOC_ERROR) input.addEvent(input.ON_PERIODICAL_DOC_ERROR, (err, resp) => this.fireEvent(this.ON_PERIODICAL_DOC_ERROR, [err, resp]))

		if(input.ON_DOC)
			input.addEvent(input.ON_DOC, function(doc, opts){
				debug_events('input.ON_DOC %o', doc);

				if(this.filters && this.filters.length > 0){
					opts.input = input;
					// this._apply_filters(doc, opts, Array.clone(this.filters), Array.clone(this.filters).shift());
					this._apply_filters(doc, opts);
				}
				else{
					if(Array.isArray(doc)){
						this.fireEvent(this.ON_SAVE_MULTIPLE_DOCS, [doc, opts]);
					}
					else{
						this.fireEvent(this.ON_SAVE_DOC, [doc, opts]);
					}
				}


			}.bind(this));


		if(input.ON_ONCE_DOC)
			input.addEvent(input.ON_ONCE_DOC, function(doc, opts){
				debug_events('input.ON_ONCE_DOC %o', doc, opts);
				// process.exit(1)
				opts = Object.merge(opts, {once: true})
				if(this.filters && this.filters.length > 0){
					opts.input = input;
					// this._apply_filters(doc, opts, Array.clone(this.filters), Array.clone(this.filters).shift());
					this._apply_filters(doc, opts);
				}
				else{
					if(Array.isArray(doc)){
						this.fireEvent(this.ON_SAVE_MULTIPLE_DOCS, [doc, opts]);
					}
					else{
						this.fireEvent(this.ON_SAVE_DOC, [doc, opts]);
					}
				}


			}.bind(this));

		if(input.ON_PERIODICAL_DOC)
			input.addEvent(input.ON_PERIODICAL_DOC, function(doc, opts){
				debug_events('input.ON_PERIODICAL_DOC %o', doc);
				opts = Object.merge(opts, {periodical: true})

				if(this.filters && this.filters.length > 0){
					opts.input = input;
					// this._apply_filters(doc, opts, Array.clone(this.filters), Array.clone(this.filters).shift());
					this._apply_filters(doc, opts);
				}
				else{
					if(Array.isArray(doc)){
						this.fireEvent(this.ON_SAVE_MULTIPLE_DOCS, [doc, opts]);
					}
					else{
						this.fireEvent(this.ON_SAVE_DOC, [doc, opts]);
					}
				}

			}.bind(this));

		if(input.ON_RANGE_DOC)
			input.addEvent(input.ON_RANGE_DOC, function(doc, opts){
				debug_events('input.ON_RANGE_DOC %o', doc);
				opts = Object.merge(opts, {range: true})
				if(this.filters && this.filters.length > 0){
					opts.input = input;
					// this._apply_filters(doc, opts, Array.clone(this.filters), Array.clone(this.filters).shift());
					this._apply_filters(doc, opts);
				}
				else{
					if(Array.isArray(doc)){
						this.fireEvent(this.ON_SAVE_MULTIPLE_DOCS, [doc, opts]);
					}
					else{
						this.fireEvent(this.ON_SAVE_DOC, [doc, opts]);
					}
				}

			}.bind(this));

		if(input.connect && typeof input.connect === 'function')
			input.connect()
	},
	__start_output: function(output){
		this.addEvent(this.ON_SAVE_DOC, function(doc, opts){
			debug_events('ON_SAVE_DOC %o', doc);

			if(typeof(output) == 'function'){
				//output(JSON.encode(doc));
				// output(doc, opts);
				output.attempt([doc, opts], this);
			}
			// else if(output.save && typeof(output.save) == 'function'){
			// 	//output(JSON.encode(doc));
			// 	output.save(doc, opts);
			// }
			else{
				// output.fireEvent(output.ON_SAVE_DOC, doc, opts);
				output.fireEvent(output.ON_SAVE_DOC, [doc, opts]);
			}
		}.bind(this));

		this.addEvent(this.ON_SAVE_MULTIPLE_DOCS, function(docs, opts){
			debug_events('ON_SAVE_MULTIPLE_DOCS %o', docs);
			if(typeof(output) == 'function'){
				//output(JSON.encode(docs));
				// output(docs, opts);
				output.attempt([doc, opts], this);
			}
			// else if(output.save && typeof(output.save) == 'function'){
			// 	//output(JSON.encode(doc));
			// 	output.save(doc, opts);
			// }
			else{
				// output.fireEvent(output.ON_SAVE_MULTIPLE_DOCS, [docs], opts);
				output.fireEvent(output.ON_SAVE_MULTIPLE_DOCS, [docs, opts]);
			}
		}.bind(this));

		// if(output.ON_DOC_SAVED)
		// 	output.addEvent(output.ON_DOC_SAVED, function(err, result){
		// 		debug_events('output.ON_DOC_SAVED %o', err, result);
		//
		// 		this.fireEvent(this.ON_DOC_SAVED, [err, result]);
		// 	}.bind(this));

		if(output.ON_DOC_SAVED) output.addEvent(output.ON_DOC_SAVED, (err, result) => this.fireEvent(this.ON_DOC_SAVED, [err, result]))

		if(output.connect && typeof output.connect === 'function')
			output.connect()
	},
	start: function(){
		if(Array.isArray(this.inputs)){
			Array.each(this.inputs, function(input){
				this.__start_input(input)
			}.bind(this));
		}
		else{
			Object.each(this.inputs, function(input){
				this.__start_input(input)
			}.bind(this));
		}
		// for (const index in this.inputs) {
		// 	let input = this.inputs[index]
		// 	// this.__start_input(input)
		// 	debug('start', input)
		// }
		debug('this.outputs', this.outputs)
		// process.exit(1)
		if(Array.isArray(this.outputs)){
			Array.each(this.outputs, function(output){
				this.__start_output(output)
			}.bind(this));
		}
		else if(this.outputs !== undefined){
			Object.each(this.outputs, function(output){
				this.__start_output(output)
			}.bind(this));
		}
		// Array.each(this.outputs, function(output){

			// this.addEvent(this.ON_SAVE_DOC, function(doc, opts){
			// 	debug_events('ON_SAVE_DOC %o', doc);
			//
			// 	if(typeof(output) == 'function'){
			// 		//output(JSON.encode(doc));
			// 		output(doc, opts);
			// 	}
			// 	// else if(output.save && typeof(output.save) == 'function'){
			// 	// 	//output(JSON.encode(doc));
			// 	// 	output.save(doc, opts);
			// 	// }
			// 	else{
			// 		// output.fireEvent(output.ON_SAVE_DOC, doc, opts);
			// 		output.fireEvent(output.ON_SAVE_DOC, [doc, opts]);
			// 	}
			// }.bind(this));
			//
			// this.addEvent(this.ON_SAVE_MULTIPLE_DOCS, function(docs, opts){
			// 	debug_events('ON_SAVE_MULTIPLE_DOCS %o', docs);
			// 	if(typeof(output) == 'function'){
			// 		//output(JSON.encode(docs));
			// 		output(docs, opts);
			// 	}
			// 	// else if(output.save && typeof(output.save) == 'function'){
			// 	// 	//output(JSON.encode(doc));
			// 	// 	output.save(doc, opts);
			// 	// }
			// 	else{
			// 		// output.fireEvent(output.ON_SAVE_MULTIPLE_DOCS, [docs], opts);
			// 		output.fireEvent(output.ON_SAVE_MULTIPLE_DOCS, [docs, opts]);
			// 	}
			// }.bind(this));
			//
			// // if(output.ON_DOC_SAVED)
			// // 	output.addEvent(output.ON_DOC_SAVED, function(err, result){
			// // 		debug_events('output.ON_DOC_SAVED %o', err, result);
			// //
			// // 		this.fireEvent(this.ON_DOC_SAVED, [err, result]);
			// // 	}.bind(this));
			//
			// if(output.ON_DOC_SAVED) output.addEvent(output.ON_DOC_SAVED, (err, result) => this.fireEvent(this.ON_DOC_SAVED, [err, result]))

		// }.bind(this));


	},
	output: function(save_doc, opts){
		if(Array.isArray(save_doc)){
			this.fireEvent(this.ON_SAVE_MULTIPLE_DOCS, [save_doc, opts]);
		}
		else{
			this.fireEvent(this.ON_SAVE_DOC, [save_doc, opts]);
		}
		//this.fireEvent(this.ON_SAVE_DOC, save_doc);
	},
	// _apply_filters: function(doc, opts, filters){
	// 	let current = null
  //
	// 	// if(filters != undefined){
	// 		// let new_current = undefined
	// 		if(Array.isArray(filters)){
	// 			current = filters.shift()
	// 		}
	// 		// else{
	// 		// 	current = filters
	// 		// 	filters = undefined
	// 		// 	// new_current = undefined
	// 		// }
	// 		if(typeOf(current) == 'function') {
	// 	    current(
	// 				doc,
	// 				opts,
	// 				function(new_doc, new_opts, next, pipeline){
	// 					// console.log('filters', filters, new_doc)
  //
	// 					if(filters){
	// 						this._apply_filters(new_doc, new_opts, filters)
	// 					}
	// 					else{
	// 						this.output(new_doc)
	// 					}
	// 				}.bind(this),
	// 				this
	// 			)
	// 	  }
	// 		else{
	// 			this.output(doc)
	// 		}
	// 	// }
  //
	// },
	_apply_filters: function(doc, opts){
		// debug('_apply_filters', doc, opts)
		// process.exit(1)
		//
		let next
		// let prev = null;

		for(let i = this.filters.length - 1; i >= 0 ; i--){

			if(i == this.filters.length - 1){
				debug_internals('_apply_filters last')

				if(this.filters.length == 1){//if there is only one filter, 'next' must be sent to "output/save" (enters 'if(i == 0)' )

					next = this.output.bind(this)
					debug_internals('_apply_filters last - only one ')

				}
				else{
					let self = this
					next = function(filtered_doc, opts){

						self.options.filters[i](filtered_doc, opts, self.output.bind(self), self);

					}.bind(self);

					debug_internals('_apply_filters last', i)

				}
			}
			else if(i !== 0){
				debug_internals('_apply_filters not zero %d', i);
				let self = this
				let prev = next
				next = function(filtered_doc, opts){
					self.options.filters[i](filtered_doc, opts, prev.bind(self), self);
				}.bind(self);
			}

			if(i == 0){//first filter, 'start running'
				debug_internals('_apply_filters start %o', doc);

				this.filters[i](doc, opts, next, this);
			}


			//current(doc, opts, prev);


		}

		//filter(doc, opts, current);

		//}.bind(this));

		//debug_internals('_apply_filters->doc %o', doc);

		//return doc;
	}

});
