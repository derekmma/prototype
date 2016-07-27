define(['util', 'temps/BoardDetailTemplate'], function(util, BoardDetailTemplate) {
  "use strict";

  var activity_index = 0;

  $(function(){

    // fetch and render board data
    if(/\?\d+/.test(location.search))
    {
      var pk = location.search.replace('?', '');
      util.get('/lb/'+pk+'/', 
        function(res) {
          var data = res.data;
          var brd_t = new BoardDetailTemplate(data.learningboard, false);
          console.log(brd_t.$followBtn);
          brd_t.$followBtn.off("click");
          brd_t.$followBtn.on("click", function(){alert("You can't subscribe in preview mode.");});
          var brd_m = brd_t.model;
          brd_t.display($(".body_container"));
          document.title = brd_m.title + ' | Learning Boards';
          // unpublish board, deny access
        },
        function(xhr)
        {
          if (xhr.status === 404) util.err404();
        }
      );
    }
  });
});