
class Modal extends HTMLElement {
	constructor(){
		super();
		this._init = this._init.bind(this);
    	this._observer = new MutationObserver(this._init);
	}
	connectedCallback(){
		if (this.children.length) {
			this._init();
		}
		this._observer.observe(this, { childList: true });
	}
	makeEvent( evtName ){
		if( typeof window.CustomEvent === "function" ){
			return new CustomEvent( evtName, {
				bubbles: true,
				cancelable: false
			});
		} else {
			var evt = document.createEvent('CustomEvent');
			evt.initCustomEvent( evtName, true, true, {} );
			return evt;
		}
	}
	_init(){
		this.closetext = "Close dialog";
		this.closeclass = "modal_close";
		this.closed = true;

		this.initEvent = this.makeEvent( "init" );
		this.beforeOpenEvent = this.makeEvent( "beforeopen" );
		this.openEvent = this.makeEvent( "open" );
		this.closeEvent = this.makeEvent( "close" );
		this.beforeCloseEvent = this.makeEvent( "beforeclose" );
		this.activeElem = document.activeElement;
		this.closeBtn = this.querySelector( "." + this.closeclass ) || this.appendCloseBtn();
		this.titleElem = this.querySelector( ".modal_title" );
		this.enhanceMarkup();
		this.bindEvents();
		this.dispatchEvent( this.initEvent );
	}
	closest(el, s){
		var whichMatches = Element.prototype.matches || Element.prototype.msMatchesSelector;
			do {
			  if (whichMatches.call(el, s)) return el;
			  el = el.parentElement || el.parentNode;
			} while (el !== null && el.nodeType === 1);
			return null;
	}
	appendCloseBtn(){
		var btn = document.createElement( "button" );
		btn.className = this.closeclass;
		btn.innerHTML = this.closetext;
		this.appendChild(btn);
		return btn;
	}

	enhanceMarkup(){
		this.setAttribute( "role", "dialog" );
		this.id = this.id || ("modal_" + new Date().getTime());
		if( this.titleElem ){
			this.titleElem.id = this.titleElem.id || ("modal_title_" + new Date().getTime());
			this.setAttribute( "aria-labelledby", this.titleElem.id );
		}
		this.classList.add("modal");
		this.setAttribute("tabindex","-1");
		this.overlay = document.createElement("div");
		this.overlay.className = "modal_screen";
		this.parentNode.insertBefore(this.overlay, this.nextSibling);
		this.modalLinks = "a.modal_link[href='#" + this.id + "']";
		this.changeAssocLinkRoles();
	}

	addInert(){
		var self = this;
		function inertSiblings( node ){
			if( node.parentNode ){
				for(var i in node.parentNode.childNodes ){
					var elem = node.parentNode.childNodes[i];
					if( elem !== node && elem.nodeType === 1 && elem !== self.overlay ){
						elem.inert = true;
					}
				}
				if( node.parentNode !== document.body ){
					inertSiblings(node.parentNode);
				}
			}

		}
		inertSiblings(this);
	}

	removeInert(){
		var elems = document.querySelectorAll( "[inert]" );
		for( var i = 0; i < elems.length; i++ ){
			elems[i].inert = false;
		}
	}

	open(){
		this.dispatchEvent( this.beforeOpenEvent );
		this.classList.add( "modal-open" );
		this.closed = false;
		this.focus();
		this.addInert();
		this.dispatchEvent( this.openEvent );

    document.body.style.overflow = 'hidden'
	}



	close( programmedClose ){
		var self = this;
		this.dispatchEvent( this.beforeCloseEvent );
		this.classList.remove( "modal-open" );
		this.closed = true;
		self.removeInert();

		if( !programmedClose ){
			this.focusedElem.focus();
		}

		this.dispatchEvent( this.closeEvent );

    document.body.style.overflow = 'auto'
	}

	changeAssocLinkRoles(){
		var elems = document.querySelectorAll(this.modalLinks);
		for( var i = 0; i < elems.length; i++ ){
			elems[i].setAttribute("role", "button" );
		}
	}


	bindEvents(){
		var self = this;

		// close btn click
		this.closeBtn.addEventListener('click', event => self.close());

		// open dialog if click is on link to dialog
		window.addEventListener('click', function( e ){
			var assocLink = self.closest(e.target, self.modalLinks);
			if( assocLink ){
				e.preventDefault();
				self.open();
			}
		});

		window.addEventListener('keydown', function( e ){
			var assocLink = self.closest(e.target, self.modalLinks);
			if( assocLink && e.keyCode === 32 ){
				e.preventDefault();
				self.open();
			}
		});

		window.addEventListener('focusin', function( e ){
			self.activeElem = e.target;
		});

		// click on the screen itself closes it
		this.overlay.addEventListener('mouseup', function( e ){
			if( !self.closed ){
				self.close();
			}
		});

		// click on anything outside dialog closes it too (if screen is not shown maybe?)
		window.addEventListener('mouseup', function( e ){
			if( !self.closed && !self.closest(e.target, "#" + self.id ) ){
				e.preventDefault();
				self.close();
			}
		});


		// close on escape
		window.addEventListener('keydown', function( e){
			if( e.keyCode === 27 &&  !self.closed ){
				e.preventDefault();
				self.close();
			}

		});

		// close on other dialog open
		window.addEventListener('beforeopen', function( e){
			if( !self.closed && e.target !== this ){
				self.close( true );
			}
		});
	}

	disconnectedCallback(){
		this._observer.disconnect();
		// remove screen when elem is removed
		this.overlay.remove();
	}
}

if ('customElements' in window) {
	customElements.define('fg-modal', Modal );
}
