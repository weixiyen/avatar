UI.renderWorld = function(world) {
    var html = [],
        prev_uid = $('#chat > div:last').attr('rel');
    
    _.each(world.chatlog, function(chat) {
        if (prev_uid === chat.uid) {
            html.push('<div rel="'+chat.uid+'">'+chat.msg+'</div>');
        } else {
            html.push('<div class="first" rel="'+chat.uid+'"><b>'+world.users[chat.uid].username+' &raquo; </b></div><div rel="'+chat.uid+'">'+chat.msg+'</div>');
        }
        prev_uid = chat.uid;
    });
    
    $('#chat').append(html.join('')).animate({ scrollTop: $('#chat').attr("scrollHeight") - $('#chat').height() }, 200);
    
    var userids = _.keys(world.users);
    
    _.each(userids, function(uid,i) {
        var user_left = parseInt($('#'+uid).css('left')),
            user_top = parseInt($('#'+uid).css('top'));
            
        if (!$('#'+uid).attr('id')) {
            $('#characters').append('<div id="'+uid+'" title="'+world.users[uid].username+'" class="character '+world.users[uid].model+'" rel="'+world.users[uid].model+'"></div>');
        }
        if (UI.world_loaded) {
            if (uid != $.cookie('uid')) {
                if (user_left !== world.users[uid].position.x || user_top !== world.users[uid].position.y){
                    clearInterval(UI.Character.walkloop[uid]);
                    UI.Character.walk(uid, UI.Character.getDirection(user_left, user_top, world.users[uid].position.x, world.users[uid].position.y));
                    $('#'+uid).animate({
                        left: world.users[uid].position.x,
                        top: world.users[uid].position.y,
                        'z-index': world.users[uid].position.y
                        }, {
                        duration: 1000, 
                        easing: 'linear',
                        queue: false,
                        complete: function(){
                            clearInterval(UI.Character.walkloop[uid]);
                        }
                    });
                }
            }
        } else {
            $('#'+uid).css({
                left: world.users[uid].position.x,
                top: world.users[uid].position.y,
                'z-index': world.users[uid].position.y
            });
        }
    });
    
    _.each(world.deletedUsers, function(uid) {
        $('#'+uid).remove(); 
    });
    
    UI.world_loaded = true;
};