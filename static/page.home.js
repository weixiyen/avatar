UI.module('home', function(){
    
    var me;
    
    function init() {
        if ( $.cookie('username') && verifyUser( $.cookie('username') ) ) {
            World.show();
        } else {
            showLogin();
        }
    }
    
    // DISPLAY WORLD ----------------------------------------
    // ------------------------------------------------------
    // ------------------------------------------------------
    // ------------------------------------------------------
    // ------------------------------------------------------
    
    var polling = false,
        chat_cursor = 0;
        
    var World = {
        show: function(){
            var self = this;
            
            $('#login').hide();
            $('#world').slideDown('fast', function(){
                 $('#chat-name').html($.cookie('username') + ' &raquo;');
                 self.playMode();
            });
            resizeChat();
            $(window).resize(function(){
                resizeChat();
            });
            $('body').addClass('on');
            polling = true;
            setTimeout(function(){
                worldPoll();
                setTimeout(function(){
                    loadWorld();
                }, 200);
            }, 200);
        },
        playMode: function() {
            enableKeyboardControls();
            $('#info').slideDown('fast');
            $('#message').removeClass('on');
        },
        chatMode: function() {
            $('#info').slideUp('fast');
            $(document).unbind('keydown').unbind('keyup');
            $('#message').addClass('on');
        }
    };

    $('#message').bind('focus',function(){
        World.chatMode();
    }).bind('blur',function(){
        World.playMode();
    }).bind('keydown',function(e){
        switch(e.which){
            case 13: sendMessage($('#message').val());
                break;
            case 27: $(this).blur();
                break;
        }
    });
    
    function enableKeyboardControls() {
        $(document).bind('keydown',function(e){
            switch(e.which) {
                case 32: $('#message').focus();
                    return false;
                    break;
                case 37:
                    UI.Character.move($.cookie('username'), 'left');
                    break;
                case 38:
                    UI.Character.move($.cookie('username'), 'up');
                    break;
                case 39:
                    UI.Character.move($.cookie('username'), 'right');
                    break;
                case 40:
                    UI.Character.move($.cookie('username'), 'down');
                    break;
                case 27:
                    return false;
                    break;
                default:
                    break;
            }
            $(document).unbind('keydown');
        }).bind('keyup',function(e){
            switch(e.which) {
                case 37:
                    UI.Character.stop($.cookie('username'),'left');
                    break;
                case 38:
                    UI.Character.stop($.cookie('username'),'up');
                    break;
                case 39:
                    UI.Character.stop($.cookie('username'),'right');
                    break;
                case 40:
                    UI.Character.stop($.cookie('username'),'down');
                    break;
                default:
                    break;
            }
            $(document).unbind('keyup');
            enableKeyboardControls();
        });
    }
    
    function resizeChat() {
        $('#chat').height($(window).height()-40);
    };
    
    function worldPoll() {
        if (polling) {
            $.ajax({
                url: '/world',
                dataType: 'json',
                data: {
                    chat_cursor: chat_cursor,
                    username: $.cookie('username')
                },
                error: function(){
                    setTimeout(worldPoll, 15000);
                },
                timeout: 50000,
                cache: false,
                success: function(data){
                    if (data.exists) {
                        UI.renderWorld(data);
                        chat_cursor = data.chat_cursor;
                        setTimeout(worldPoll, 200);
                    } else {
                        $.cookie('username', null);
                        location.reload(true);
                    }
                }
            });
        }
    }
    
    function sendMessage(msg) {
        $.ajax({
            url: '/sendMessage',
            data: {
                username: $.cookie('username'),
                msg: msg
            },
            error: function(){
                worldPoll()
            },
            success: function(){
                $('#message').val('').blur();
            }
        });
    }
    
    function loadWorld(msg) {
        $.ajax({
            url: '/loadWorld',
            error: function(){
                worldPoll()
            }
        });
    }
    
    function verifyUser(username) {
        var valid = false;
        $.ajax({
            url: '/verifyUser',
            async: false,
            data: {
                username: username
            },
            success: function(user) {
                valid = user.valid;
            }
        });
        return valid;
    }
    
    
    // DISPLAY LOGIN ----------------------------------------
    // ------------------------------------------------------
    // ------------------------------------------------------
    // ------------------------------------------------------
    // ------------------------------------------------------
    $('#enterWorld').bind('click',function(){
        if ($('#username').val()) {
            $.ajax({
               url: '/login',
               data: {
                   username: $('#username').val(),
                   model: $('input[name=model]:checked').val()
               },
               success: function(data){
                    if (!data.error) {
                        $.cookie('username',data.user.username,{expires:10});
                        World.show();
                    } else {
                        alert(data.error);   
                    }
               },
               dataType: 'json'
           });
        }
    });
    
    function showLogin() {
        $('#world').hide();
        $('body').removeClass('on');
        $('#login').slideDown('fast', function(){
            $('#username').focus().unbind('keydown').bind('keydown',function(e){
                if (e.keyCode === 13) {
                    $('#enterWorld').click();
                }
            });
        });
    }
    
    
    init();
});
