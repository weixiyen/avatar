UI.renderWorld = function(world) {
    var html = [],
        prev_username = $('#chat > div:last').attr('rel');
    
    _.each(world.chatlog, function(chat) {
        if (prev_username === chat.username) {
            html.push('<div rel="'+chat.username+'">'+chat.msg+'</div>');
        } else {
            html.push('<div class="first" rel="'+chat.username+'"><b>'+chat.username+' &raquo; </b></div><div rel="'+chat.username+'">'+chat.msg+'</div>');
        }
        prev_username = chat.username;
    });
    
    $('#chat').append(html.join('')).animate({ scrollTop: $('#chat').attr("scrollHeight") - $('#chat').height() }, 200);
    
    var usernames = _.keys(world.users);
    
    _.each(usernames, function(username,i) {
        var user_left = parseInt($('#'+username).css('left')),
            user_top = parseInt($('#'+username).css('top'));
            
        if (!$('#'+username).attr('id')) {
            $('#characters').append('<div id="'+username+'" title="'+username+'" class="character '+world.users[username].model+'" rel="'+world.users[username].model+'"></div>');
        }
        if (UI.world_loaded) {
            if (username != $.cookie('username')) {
                if (user_left !== world.users[username].position.x || user_top !== world.users[username].position.y){
                    clearInterval(UI.Character.walkloop[username]);
                    UI.Character.walk(username, UI.Character.getDirection(user_left, user_top, world.users[username].position.x, world.users[username].position.y));
                    $('#'+username).animate({
                        left: world.users[username].position.x,
                        top: world.users[username].position.y,
                        'z-index': world.users[username].position.y
                        }, {
                        duration: 1000, 
                        easing: 'linear',
                        queue: false,
                        complete: function(){
                            clearInterval(UI.Character.walkloop[username]);
                        }
                    });
                }
            }
        } else {
            $('#'+username).css({
                left: world.users[username].position.x,
                top: world.users[username].position.y,
                'z-index': world.users[username].position.y
            });
        }
    });
    
    _.each(world.deletedUsers, function(username) {
        $('#'+username).remove(); 
    });
    
    UI.world_loaded = true;
};