/* 
 * Context.js
 * Copyright Jacob Kelley
 * MIT License
 */
var context_callback = null;

var context = context || (function () {

    var options = {
        fadeSpeed: 100,
        filter: function ($obj) {
        // Modify $obj, Do not return
        },
        above: 'auto',
        preventDoubleContext: true,
        compress: false
    };

    function initialize(opts, callback) {
        context_callback = callback;
        options = $.extend({}, options, opts);

        $(document).on('click', 'html', function () {
            $('.dropdown-context').fadeOut(options.fadeSpeed, function(){
                $('.disable-on-context').removeClass('disabled');
                $('.dropdown-context').css({display:''}).find('.drop-left').removeClass('drop-left');
            });
        });
        if(options.preventDoubleContext){
            $(document).on('contextmenu', '.dropdown-context', function (e) {
                e.preventDefault();
            });
        }
        $(document).on('mouseenter', '.dropdown-submenu', function(e){
            var $sub = $(this).find('.dropdown-context-sub:first'),
                subWidth = $sub.width(),
                subLeft = $sub.offset().left,
                collision = (subWidth+subLeft) > window.innerWidth;
            if(collision){
                $sub.addClass('drop-left');
            }
            // make submenu pop upward if we have no space below
            $sub.css('top', '0px');
            if ((($sub.offset()).top + $sub.height()) > $('html').height()) {
                $sub.css('top', '-' + ($sub.height() - e.target.clientHeight) + 'px');
            }
        });
    }

    function updateOptions(opts){
        options = $.extend({}, options, opts);
    }

    function buildMenu(data, id, subMenu) {
        var subClass = (subMenu) ? ' dropdown-context-sub' : '',
            compressed = options.compress ? ' compressed-context' : '',
            $menu = $('<ul class="dropdown-menu dropdown-context' + subClass + compressed+'" id="dropdown-' + id + '"></ul>');
        var i = 0;
        for(i; i<data.length; i++) {
            var linkTarget = '', data_action = '', data_val = '', element_id = '';
            if (typeof data[i].divider !== 'undefined') {
                $menu.append('<li class="divider"></li>');
            } else if (typeof data[i].header !== 'undefined') {
                $menu.append('<li class="nav-header">' + data[i].header + '</li>');
            } else {
                if (typeof data[i].href == 'undefined') {
                    data[i].href = '#';
                }
                if (typeof data[i].target !== 'undefined') {
                    linkTarget = ' target="' + data[i].target + '"';
                }
                if (typeof data[i].data_action !== 'undefined') {
                    data_action = ' data-action="' + data[i].data_action + '"';
                }
                if (typeof data[i].data_val !== 'undefined') {
                    data_val = ' data-val="' + data[i].data_val + '"';
                }
                if (typeof data[i].element_id !== 'undefined') {
                    element_id = ' id="' + data[i].element_id + '"';
                } 

                if (typeof data[i].subMenu !== 'undefined') {
                    $sub = ('<li '  + element_id + data_action + data_val +  ' class="dropdown-submenu"' + element_id + '><a tabindex="-1" href="' + data[i].href + '">' + data[i].text + '</a></li>');
                } else {
                    $sub = $('<li' + element_id + data_action + data_val + '><a tabindex="-1" href="' + data[i].href + '"'+linkTarget+'>' + data[i].text + '</a></li>');
                }
                if (typeof data[i].action !== 'undefined') {
                    var actiond = new Date(),
                        actionID = 'event-' + actiond.getTime() * Math.floor(Math.random()*100000),
                        eventAction = data[i].action;
                    $sub.find('a').attr('id', actionID);
                    $('#' + actionID).addClass('context-event');
                    $(document).on('click', '#' + actionID, eventAction);
                }
                $menu.append($sub);
                if (typeof data[i].subMenu != 'undefined') {
                    var subMenuData = buildMenu(data[i].subMenu, id, true);
                    $menu.find('li:last').append(subMenuData);
                }
            }
            if (typeof options.filter == 'function') {
                options.filter($menu.find('li:last'));
            }
        }
        return $menu;
    }

    function addContext(selector, data) {
        var d = new Date(),
            id = d.getTime(),
            $menu = buildMenu(data, id);

        $('body').append($menu);

        $(document).on('contextmenu', selector, function (e) {
            $('.disable-on-context').addClass('disabled');
            e.preventDefault();
            e.stopPropagation();
            $('.dropdown-context:not(.dropdown-context-sub)').hide();
            if (context_callback != null) {
                context_callback(e);
            }
            $dd = $('#dropdown-' + id);
            if (typeof options.above == 'boolean' && options.above) {
                $dd.addClass('dropdown-context-up').css({
                    top: e.pageY - $('#dropdown-' + id).height(),
                    left: e.pageX
                }).fadeIn(options.fadeSpeed);
            } else if (typeof options.above == 'string' && options.above == 'auto') {
                $dd.removeClass('dropdown-context-up');
                var autoH = $dd.height();
                if ((e.pageY + autoH) > $('html').height()) {
                    $dd.addClass('dropdown-context-up').css({
                        top: e.pageY - autoH,
                        left: e.pageX
                    }).fadeIn(options.fadeSpeed);
                } else {
                    $dd.css({
                        top: e.pageY,
                        left: e.pageX
                    }).fadeIn(options.fadeSpeed);
                }
            }
        });
    }

    function destroyContext(selector) {
        $(document).off('contextmenu', selector).off('click', '.context-event');
    }

    return {
        init: initialize,
        settings: updateOptions,
        attach: addContext,
        destroy: destroyContext
    };
})();