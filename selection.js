define( [ 'view/js/lib/jquery.min.js' ] , function() {

( function( $ ) {
    function Range( container , options ) {
        var self = this;
        self.container = container;
        self.options   = $.extend( {} , self.options , options );
        self.position  = {};
        self.flag      = false;

        $( document ).on( 'mouseup touchend' , function( event ) {
            self.end( event );
        } );

        container
            .on( 'mousedown touchdown' , function( event ) {
                if( self.options.isRanging.call( this , event , self.options ) ) {
                    self.start( event );
                }
            } )
            .on( 'mousemove touchmove' , function( event ) {
                if( event.which != 1 ) {
                    self.end( event );
                    return;
                }
                self.move( event );
            } );
    }

    Range.prototype = {
        container   : null
        , rangeNode : null
        , options   : {
            isRanging   : function( event , options ) {
                return ( options.which && options.which == event.which ) || true;
            }
        }
        , position  : null
        , flag      : null

        , start     : function( event ) {
            this.flag = true;

            event.preventDefault();
            event.stopPropagation();

            if( ! $( this.rangeNode ).length ) {
                this.rangeNode = $( '<div></div>' ).css( 'position' , 'absolute' );
            }

            this.position.x = [ event.pageX ];
            this.position.y = [ event.pageY ];

            this.container.append( this.rangeNode.css( {height:0,left:0,top:0,width:0} ) ).trigger( 'rangestart' , [ {
                element : this.rangeNode
            } , event ] );
        }
        , move      : function( event ) {
            if( ! this.flag ) {
                return;
            }

            this.position.x[1] = event.pageX;
            this.position.y[1] = event.pageY;

            var offset = this.getOffset();
            var rangeNode = $( this.rangeNode ).css( offset );

            offset.left = offset.left - ( rangeNode.offset().left - offset.left );
            offset.top = offset.top - ( rangeNode.offset().top - offset.top );

            rangeNode.css( offset );

            this.container.trigger( 'rangemove' , [ {
                element  : rangeNode
                , offset : offset
            } , event ] );
        }
        , end       : function( event ) {
            this.flag = false;

            this.position = {};

            this.container.trigger( 'rangeend' , [ {
                element : $( this.rangeNode ).remove()
            } , event ] );
        }
        , getOffset : function() {
            var height;
            var left;
            var top;
            var width;

            if( this.position.x[0] > this.position.x[1] ) {
                left = this.position.x[1];
                width = this.position.x[0] - this.position.x[1];
            } else {
                left = this.position.x[0];
                width = this.position.x[1] - this.position.x[0];
            }

            if( this.position.y[0] > this.position.y[1] ) {
                height = this.position.y[0] - this.position.y[1];
                top = this.position.y[1];
            } else {
                height = this.position.y[1] - this.position.y[0];
                top = this.position.y[0];
            }

            return {
                height  : height
                , left  : left
                , top   : top
                , width : width
            };
        }
    };

    $.fn.range = function( options ) {
        var node = $( this );

        if( node.data( '_range' ) instanceof Range ) {
            return;
        }

        return node.data( '_range' , new Range( node , options ) );
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $.fn.selection = function( options ) {
        var elements;
        options = $.extend( {} , options , {
            timesPerSecond  : 10
        } );
        var date;

        $( this )
            .on( 'rangestart' , function( event , ui , originalEvent ) {
                ui.rangeElement = ui.element;
                delete ui.element;
                ui.elements = elements = $( this ).find( options.selectors ).trigger( 'unselected' , originalEvent );

                $( this ).trigger( 'select' , [ ui , originalEvent ] );
            } )
            .on( 'rangemove' , function( event , ui , originalEvent ) {
                var date_ = new Date;
                if( date && ( date_ - date ) < ( 1000 / options.timesPerSecond ) ) {
                    return;
                }
                date = date_;

                ui.rangeElement = ui.element;
                delete ui.element;
                ui.elements = elements;
                ui.selectedElements = elements.filter( function() {
                    if( this.offsetLeft + this.offsetWidth >= ui.offset.left
                        && this.offsetTop + this.offsetHeight >= ui.offset.top
                        && this.offsetLeft <= ui.offset.left + ui.offset.width
                        && this.offsetTop <= ui.offset.top + ui.offset.height ) {
                        $( this ).trigger( 'selected' , originalEvent );
                        return true;
                    } else {
                        $( this ).trigger( 'unselected' , originalEvent );
                    }
                } );

                $( this ).trigger( 'selection' , [ ui , originalEvent ] );
            } )
            .on( 'rangeend' , function( event , ui , originalEvent ) {
                ui.rangeElement = ui.element;
                delete ui.element;
                $( this ).trigger( 'selected' , [ ui , originalEvent ] );
            } )
            .range( options );

        return this;
    };

} )( window.jQuery || { fn : {} } );

});
