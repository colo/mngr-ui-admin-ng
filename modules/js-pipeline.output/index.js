'use strict'

const	mootools = require('mootools')

const debug = require('debug')('js-pipeline:output'),
      debug_events = require('debug')('js-pipeline:output:Events'),
      debug_internals = require('debug')('js-pipeline:output:Internals')

/**
 *
 * */
module.exports = new Class({
  Implements: [Options, Events],

  __interval: undefined,

  buffer: [],
  buffer_expire: 0,

  ON_CONNECT: 'onConnect',
  ON_CONNECT_ERROR: 'onConnectError',
  ON_ACCEPT: 'onAccept',

  ON_DOC: 'onDoc',
	//ON_DOC_ERROR: 'onDocError',

	ON_ONCE_DOC: 'onOnceDoc',
	//ON_ONCE_DOC_ERROR: 'onOnceDocError',

	ON_PERIODICAL_DOC: 'onPeriodicalDoc',
  //ON_PERIODICAL_DOC_ERROR: 'onPeriodicalDocError',

  ON_SAVE_DOC: 'onSaveDoc',
  ON_SAVE_MULTIPLE_DOCS: 'onSaveMultipleDocs',

  ON_DOC_SAVED: 'onDocSaved',

  options: {
		id: null,

		buffer:{
      size: 5,//-1 =will add until expire | 0 = no buffer | N > 0 = limit buffer no more than N
			expire: 5000, //miliseconds until saving
			periodical: 1000 //how often will check if buffer timestamp has expire
		},

	},

  connect: function(){},
	initialize: function(options, connect_cb){
		this.setOptions(options);

		this.addEvent(this.ON_SAVE_DOC, this.save);

		this.addEvent(this.ON_SAVE_MULTIPLE_DOCS, this.save);

	},
	save: function(doc){
		debug_internals('save %o', doc);

		if(this.options.buffer.size == 0){
			this._save_to_output(doc)
		}
		// else if( this.buffer.length < this.options.buffer.size && this.buffer_expire > Date.now()){
		// 	this.buffer.push(doc);
		// }
		else{
      if(this.__interval === undefined){
        this.buffer_expire = Date.now() + this.options.buffer.expire;
    		this.__interval = this._expire_buffer.periodical(this.options.buffer.periodical, this);
      }
      // debug_internals('save %o', doc);
      // process.exit(1)
      // if((typeof(doc) == 'array' || doc instanceof Array || Array.isArray(doc)) && doc.length > 0){
      if(Array.isArray(doc)){
        Array.each(doc, function(d){
          this.buffer.push(d)
          if(this.options.buffer.size > 0 && this.buffer.length >= this.options.buffer.size){
            this._save_buffer()
          }
        }.bind(this))
      }
      else{
  			this.buffer.push(doc)
      }


		}
	},
  _save_to_output: function(doc){},

	_expire_buffer: function(){
    debug_internals('_expire_buffer %o', this.buffer_expire, this.buffer);
		if(this.buffer_expire <= Date.now() && this.buffer.length > 0){
      debug_internals('_expire_buffer %o', this.buffer_expire);
			this._save_buffer()
		}

	},
	_save_buffer: function(){
    debug('_save_buffer')
    // process.exit(1)
		// if(this.buffer_expire <= Date.now() && this.buffer.length > 0){
      // debug_internals('_save_buffer %o', this.buffer);
			// let doc = this.buffer;
			// this._save_docs(Array.clone(this.buffer));

      // if(this.accept === true){
        this._save_to_output(Array.clone(this.buffer));
        /**
        * @Todo
        * buffer should be cleaned ON_DOC_SAVED only
        **/
  			this.buffer = [];
  			// this.buffer_expire = Date.now() + this.options.buffer.expire;
        clearInterval(this.__interval)
        this.__interval = undefined
      // }

			// debug_internals('_save_buffer %o', doc);
		// }

	}
});
