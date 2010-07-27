(function(){
    
    var modules = [];
    
    var UI = {
        module: function(module, func) {
            modules.push({name:module,run:func});
        },
        render: function(module) {
            _.each(modules, function(m,i){
                if (m.name === module) {
                    m.run();
                    _.breakLoop();
                }
            });
        },
        world_loaded: false
    }
    
    this.UI = UI;
})();