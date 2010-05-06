(function(UI){

    var moveDistance = 2,
        leftInterval,
        upInterval,
        rightInterval,
        downInterval,
        moveInterval = 20,
        update_pos_timer,
        update_position_interval = 1000;
    
    UI.Character = {
        move: function(el, direction){
            stopCharacter(el, direction);
            moveCharacter(el, direction);
            clearInterval(UI.Character.walkloop[el]);
            UI.Character.walk(el, direction);
        },
        stop: function(el,direction){
            stopCharacter(el,direction);
        },
        walkloop: {}
    }
    
    function moveCharacter(el, direction) {
        switch (direction) {
            case 'left':
                leftInterval = setInterval(function(){
                    $('#'+el).css({
                        left: parseInt( $('#'+el).css("left")) - moveDistance,
                        'z-index': parseInt( $('#'+el).css('top'))
                    });
                }, moveInterval);
                
                break;
            case 'up':
                upInterval = setInterval(function(){
                    $('#'+el).css({
                        top: parseInt($('#'+el).css("top")) - moveDistance,
                        'z-index': parseInt($('#'+el).css('top'))
                    }); 
                }, moveInterval);
                break;
            case 'right':
                rightInterval = setInterval(function(){
                    $('#'+el).css({
                        left: parseInt($('#'+el).css("left")) + moveDistance,
                        'z-index': parseInt($('#'+el).css('top'))
                    });
                }, moveInterval);
                break;
            case 'down':
                downInterval = setInterval(function(){
                    $('#'+el).css({
                        top: parseInt($('#'+el).css("top")) + moveDistance,
                        'z-index': parseInt($('#'+el).css('top'))
                    });
                }, moveInterval);
                break;
            default:
                break;
        }
        clearInterval(update_pos_timer);
        update_pos_timer = setInterval(function(){
            updatePosition(el);
        }, update_position_interval);
    }
    
    function stopCharacter(el,direction) {
        switch(direction){
            case 'left': clearInterval(leftInterval);
                break;
            case 'up': clearInterval(upInterval);
                break;
            case 'right': clearInterval(rightInterval);
                break;
            case 'down': clearInterval(downInterval);
                break;
            default:
                clearInterval(leftInterval);
                clearInterval(upInterval);
                clearInterval(rightInterval);
                clearInterval(downInterval);
                break;
        }
        
        updatePosition(el);
        clearInterval(update_pos_timer);
        clearInterval(UI.Character.walkloop[el]);
    }
    
    function updatePosition(el){
        var me = $('#'+el);
        $.ajax({
            url: '/updatePosition',
            data: {
                uid: el,
                top: parseInt(me.css('top')),
                left: parseInt(me.css('left'))
            }
        });
    }
    
    UI.Character.sprite_map = {
        naruto: {
            right: [
                {l:"-144px", t:"-32px"},
                {l:"-168px", t:"-32px"},
                {l:"-192px", t:"-32px"}
            ],
            left: [
                {l:"-144px", t:"-96px"},
                {l:"-168px", t:"-96px"},
                {l:"-192px", t:"-96px"}
            ],
            up: [
                {l:"-144px", t:"0"},
                {l:"-168px", t:"0"},
                {l:"-192px", t:"0"}
            ],
            down: [
                {l:"-144px", t:"-64px"},
                {l:"-168px", t:"-64px"},
                {l:"-192px", t:"-64px"}
            ]
        },
        sasuke: {
            right: [
                {l:"-72px", t:"-32px"},
                {l:"-96px", t:"-32px"},
                {l:"-120px", t:"-32px"}
            ],
            left: [
                {l:"-72px", t:"-96px"},
                {l:"-96px", t:"-96px"},
                {l:"-120px", t:"-96px"}
            ],
            up: [
                {l:"-72px", t:"0"},
                {l:"-96px", t:"0"},
                {l:"-120px", t:"0"}
            ],
            down: [
                {l:"-72px", t:"-64px"},
                {l:"-96px", t:"-64px"},
                {l:"-120px", t:"-64px"}
            ]
        },
        sakura: {
            right: [
                {l:"0", t:"-32px"},
                {l:"-24px", t:"-32px"},
                {l:"-48px", t:"-32px"}
            ],
            left: [
                {l:"0", t:"-96px"},
                {l:"-24px", t:"-96px"},
                {l:"-48px", t:"-96px"}
            ],
            up: [
                {l:"0", t:"0"},
                {l:"-24px", t:"0"},
                {l:"-48px", t:"0"}
            ],
            down: [
                {l:"0", t:"-64px"},
                {l:"-24px", t:"-64px"},
                {l:"-48px", t:"-64px"}
            ]
        }
    }
    
    UI.Character.walk = function(uid, direction){
        var i = 0;
        var model = $('#'+uid).attr('rel');        
        UI.Character.walkloop[uid] = setInterval(function(){
            $('#'+uid).css({
                'background-position': UI.Character.sprite_map[model][direction][i].l + ' ' + UI.Character.sprite_map[model][direction][i].t
            });
            if (++i===3) i = 0;
        }, 100);
    }
    
    UI.Character.getDirection = function(pl, pt, l, t) {
        if (pl > l) {
            return 'left';
        } else if (pl < l) {
            return 'right';
        } else if (pt > t) {
            return 'up'
        } else {
            return 'down'
        }
    }
    

})(UI);

